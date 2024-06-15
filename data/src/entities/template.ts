import {
    OrganizationId,
    TemplateEntity,
    TemplateFieldDoc,
    TemplateFieldEntity,
    TemplateFieldId,
    TemplateFieldProperties,
    TemplateId,
    TemplateProperties,
} from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { ErrorCode } from '@ephemera/services';
import { FailureWithContent, Fault, Result, SuccessWithContent, SuccessWithoutContent } from '@ephemera/stdlib';
import {
    GetEntityOperation,
    ListEntitiesByOperation,
    RemoveEntityOperation,
    SetEntityOperation,
    UpdateEntityOperation,
} from '../access/entity-operation';
import { DataProfile } from '../configure';

const getTemplateFieldEntityFromDoc = (doc: TemplateFieldDoc): TemplateFieldEntity => ({
    allowed: doc.allowed,
    description: doc.description,
    id: doc.id,
    kind: doc.kind,
    name: doc.name,
    required: doc.required,
});

export type TemplateEntityRepository = GetEntityOperation<TemplateId, TemplateEntity, ErrorCode> &
    ListEntitiesByOperation<OrganizationId, TemplateEntity, ErrorCode> &
    RemoveEntityOperation<TemplateId, ErrorCode> &
    SetEntityOperation<TemplateId, TemplateEntity, TemplateProperties, ErrorCode> &
    UpdateEntityOperation<TemplateId, TemplateEntity, TemplateProperties, ErrorCode>;

export const templateEntityRepository: Factory<DataProfile, TemplateEntityRepository> = (getUnit) => {
    const fieldDocRepository = getUnit('templateFieldDocRepository');
    const organizationDocRepository = getUnit('organizationDocRepository');
    const templateDocRepository = getUnit('templateDocRepository');

    const getFieldsForTemplate = async (id: TemplateId) => {
        const docId = templateDocRepository.getDocId(id);
        const docs = await fieldDocRepository.search().where('docId').equals(`${docId}/*`).all();

        return docs.map(getTemplateFieldEntityFromDoc);
    };

    const removeFieldsForTemplate = async (id: TemplateId, timestamp: Date) => {
        const docId = templateDocRepository.getDocId(id);
        const docs = await fieldDocRepository.search().where('docId').equals(`${docId}/*`).all();

        return await Promise.all(
            docs.map((doc) => {
                const fieldId: TemplateFieldId = { ...id, field: doc.id };

                return fieldDocRepository.save(fieldId, {
                    ...doc,
                    deletedAt: timestamp,
                    isDeleted: true,
                    modifiedAt: timestamp,
                });
            }),
        );
    };

    const saveFieldsForTemplate = async (id: TemplateId, fields: TemplateFieldProperties[], timestamp: Date) => {
        const docs = await Promise.all(
            fields.map((field) => {
                const fieldId: TemplateFieldId = { ...id, field: field.id };

                return fieldDocRepository.save(fieldId, {
                    ...field,
                    createdAt: timestamp,
                    modifiedAt: timestamp,
                });
            }),
        );

        return docs.map(getTemplateFieldEntityFromDoc);
    };

    const get = async (id: TemplateId): Promise<Result<TemplateEntity, Fault<ErrorCode>>> => {
        const parentId: OrganizationId = { organization: id.organization };

        // Fail if either the organization or template do not exist
        const [organization, template] = await Promise.all([
            organizationDocRepository.fetch(parentId),
            templateDocRepository.fetch(id),
        ]);

        if (!organization || organization.isDeleted || !template || template.isDeleted) {
            return FailureWithContent<Fault<ErrorCode>>({
                code: ErrorCode.NotFound,
                message: 'Template not found.',
            });
        }

        const fields = await getFieldsForTemplate(id);

        return SuccessWithContent<TemplateEntity>({
            description: template.description,
            fields,
            id: template.id,
            name: template.name,
            version: template.version,
        });
    };

    const listBy = async (
        id: OrganizationId,
        skip: number,
        count: number,
    ): Promise<Result<TemplateEntity[], Fault<ErrorCode>>> => {
        // Fail if parent organization doesn't exist
        const organization = await organizationDocRepository.fetch(id);

        if (!organization || organization.isDeleted) {
            return FailureWithContent<Fault<ErrorCode>>({
                code: ErrorCode.NotFound,
                message: 'Organization not found.',
            });
        }

        const templates = await templateDocRepository
            .search()
            .where('docId')
            .equals(`${organizationDocRepository.getDocId(id)}/*`)
            .where('isDeleted')
            .false()
            .page(skip, count);

        const fieldsByTemplate = await Promise.all(
            templates.map((template) => getFieldsForTemplate({ ...id, template: template.id })),
        );

        return SuccessWithContent<TemplateEntity[]>(
            templates.map((template, index) => ({
                description: template.description,
                fields: fieldsByTemplate[index],
                id: template.id,
                name: template.name,
                version: template.version,
            })),
        );
    };

    // TODO: revisions
    const remove = async (id: TemplateId): Promise<Result<void, Fault<ErrorCode>>> => {
        const parentId: OrganizationId = { organization: id.organization };

        // Fail if either the organization or template do not exist
        const [organization, template] = await Promise.all([
            organizationDocRepository.fetch(parentId),
            templateDocRepository.fetch(id),
        ]);

        if (!organization || organization.isDeleted || !template || template.isDeleted) {
            return FailureWithContent<Fault<ErrorCode>>({
                code: ErrorCode.NotFound,
                message: 'Template not found.',
            });
        }

        const timestamp = new Date();

        // Delete the template and all of its child fields
        await Promise.all([
            templateDocRepository.save(id, {
                ...template,
                deletedAt: timestamp,
                isDeleted: true,
                modifiedAt: timestamp,
            }),
            removeFieldsForTemplate(id, timestamp),
        ]);

        return SuccessWithoutContent();
    };

    // TODO: revisions
    // TODO: skip operation if there weren't any revisions
    const set = async (
        id: TemplateId,
        properties: TemplateProperties,
    ): Promise<Result<TemplateEntity, Fault<ErrorCode>>> => {
        const { fields: fieldProperties, ...otherProperties } = properties;
        const parentId: OrganizationId = { organization: id.organization };

        // Fail if the organization does not exist
        const organization = await organizationDocRepository.fetch(parentId);

        if (!organization || organization.isDeleted) {
            return FailureWithContent<Fault<ErrorCode>>({
                code: ErrorCode.NotFound,
                message: 'Organization not found.',
            });
        }

        // Check if there is an existing template. If so, this will be counted as a revision rather than a new template
        const existingTemplate = await templateDocRepository.fetch(id);

        const timestamp = new Date();

        if (existingTemplate) {
            await removeFieldsForTemplate(id, timestamp);
        }

        // Write all new content
        const newFields = await saveFieldsForTemplate(id, fieldProperties, timestamp);

        const newTemplate = await templateDocRepository.save(id, {
            ...(existingTemplate ?? {}),
            ...otherProperties,
            createdAt: timestamp,
            id: id.template,
            modifiedAt: timestamp,
            version: (existingTemplate?.version ?? 0) + 1,
        });

        return SuccessWithContent<TemplateEntity>({
            description: newTemplate.description,
            fields: newFields,
            id: newTemplate.id,
            name: newTemplate.name,
            version: newTemplate.version,
        });
    };

    // TODO: revisions
    // TODO: skip operation if there weren't any revisions
    const update = async (
        id: TemplateId,
        properties: Partial<TemplateProperties>,
    ): Promise<Result<TemplateEntity, Fault<ErrorCode>>> => {
        const { fields: fieldProperties, ...otherProperties } = properties;
        const parentId: OrganizationId = { organization: id.organization };

        // Fail if either the organization or template do not exist
        const [organization, template] = await Promise.all([
            organizationDocRepository.fetch(parentId),
            templateDocRepository.fetch(id),
        ]);

        if (!organization || organization.isDeleted || !template || template.isDeleted) {
            return FailureWithContent<Fault<ErrorCode>>({
                code: ErrorCode.NotFound,
                message: 'Template not found.',
            });
        }

        const timestamp = new Date();
        let newFields: TemplateFieldEntity[] | undefined = undefined;

        // If new fields were given, remove the old docs and save the new
        if (fieldProperties) {
            await removeFieldsForTemplate(id, timestamp);
            newFields = await saveFieldsForTemplate(id, fieldProperties, timestamp);
        }

        const updatedFields = newFields ?? (await getFieldsForTemplate(id));

        // Note: even if otherProperties is blank, we want to increment version/modifiedAt from fields change
        const updatedTemplate = await templateDocRepository.save(id, {
            ...template,
            ...otherProperties,
            modifiedAt: timestamp,
            version: template.version + 1,
        });

        return SuccessWithContent<TemplateEntity>({
            description: updatedTemplate.description,
            fields: updatedFields,
            id: updatedTemplate.id,
            name: updatedTemplate.name,
            version: updatedTemplate.version,
        });
    };

    return { get, listBy, remove, set, update };
};
