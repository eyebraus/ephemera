import { TemplateFieldModel, TemplateId, TemplateVersionId } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { isUndefinedOrWhiteSpace } from '@ephemera/stdlib';
import { Request, Response, Router } from 'express';
import { ApiProfile } from '../configure';
import {
    DeleteTemplateVersionResponseBody,
    GetTemplateVersionResponseBody,
    ListTemplateVersionsResponseBody,
    PutTemplateVersionRequestBody,
    PutTemplateVersionResponseBody,
    TemplateVersionErrorCode,
} from '../contract/template-version';
import { getCountFromQuery, getSkipFromQuery } from '../utilities/query';

type DeleteTemplateVersionRequest = Request<{ id: string; template: string }>;
type DeleteTemplateVersionResponse = Response<DeleteTemplateVersionResponseBody>;
type GetTemplateVersionRequest = Request<{ id: string; template: string }>;
type GetTemplateVersionResponse = Response<GetTemplateVersionResponseBody>;
type ListTemplateVersionsRequest = Request<{ template: string }>;
type ListTemplateVersionsResponse = Response<ListTemplateVersionsResponseBody>;

type PutTemplateVersionRequest = Request<
    { id: string; template: string },
    PutTemplateVersionResponseBody,
    PutTemplateVersionRequestBody
>;

type PutTemplateVersionResponse = Response<PutTemplateVersionResponseBody>;

const getUrlForTemplateVersion = (hostname: string, tokens: TemplateVersionId) => {
    const { template, versionNumber } = tokens;

    return `https://${hostname}/templates/${template.toLowerCase()}/versions/${versionNumber}`;
};

const isInvalidField = (field: PutTemplateVersionRequestBody['fields'][0]) => {
    const { allowed, description, id, kind, name } = field;

    return (
        (allowed && allowed.length < 1) ||
        isUndefinedOrWhiteSpace(description) ||
        isUndefinedOrWhiteSpace(id) ||
        isUndefinedOrWhiteSpace(kind) ||
        isUndefinedOrWhiteSpace(name)
    );
};

const removeEntityIdFromFields = (fields: TemplateFieldModel[]) =>
    fields.map((field) => {
        const { entityId: _, ...fieldResponse } = field;

        return fieldResponse;
    });

export const templateVersionRouter: Factory<ApiProfile, Router> = (provider) => {
    const fieldRepository = provider('templateFieldRepository');
    const templateRepository = provider('templateRepository');
    const versionRepository = provider('templateVersionRepository');
    const router = Router({ mergeParams: true });

    const getChildTemplateFields = async (id: TemplateVersionId) => {
        const entityId = versionRepository.getEntityId(id);

        return await fieldRepository.search().where('entityId').equals(`${entityId}/*`).all();
    };

    const getIdsOfChildTemplateFields = async (id: TemplateVersionId) => {
        const entityId = versionRepository.getEntityId(id);

        return await fieldRepository.search().where('entityId').equals(`${entityId}/*`).allIds();
    };

    router.delete(
        '/:id(\\d+)',
        async (request: DeleteTemplateVersionRequest, response: DeleteTemplateVersionResponse) => {
            const { params } = request;
            const { id: versionNumber, template } = params;
            const parentId: TemplateId = { template };
            const id: TemplateVersionId = { ...parentId, versionNumber };

            // Check for the existence of the version and its ancestors. If they don't exist, 404
            const [doesTemplateExist, doesVersionExist] = await Promise.all([
                templateRepository.has(parentId),
                versionRepository.has(id),
            ]);

            if (!doesTemplateExist) {
                response.status(404).send({
                    code: TemplateVersionErrorCode.NotFound,
                    message: 'Template not found.',
                });

                return;
            }

            if (!doesVersionExist) {
                response.status(404).send({
                    code: TemplateVersionErrorCode.NotFound,
                    message: 'Template version not found.',
                });

                return;
            }

            // Get IDs of all descended template fields
            const fieldIds = await getIdsOfChildTemplateFields(id);

            // Delete version and all related documents
            await Promise.all([versionRepository.remove(id), ...fieldIds.map((id) => fieldRepository.remove(id))]);

            response.status(204);
        },
    );

    router.get('/', async (request: ListTemplateVersionsRequest, response: ListTemplateVersionsResponse) => {
        const { hostname, params } = request;
        const { template } = params;
        const count = getCountFromQuery(request);
        const skip = getSkipFromQuery(request);
        const id: TemplateId = { template };

        // Check for the existence of the parent template. If it doesn't exist, 404
        const doesTemplateExist = await templateRepository.has(id);

        if (!doesTemplateExist) {
            response.status(404).send({
                code: TemplateVersionErrorCode.NotFound,
                message: 'Template not found.',
            });

            return;
        }

        const versions = await versionRepository
            .search()
            .where('entityId')
            .equals(`${templateRepository.getEntityId(id)}/*`)
            .page(skip, count);

        const fieldsByVersion = await Promise.all(
            versions.map((version) => getChildTemplateFields({ ...id, versionNumber: version.id })),
        );

        response.status(200).send({
            count: versions.length,
            start: skip,
            value: versions.map((version, index) => ({
                fields: removeEntityIdFromFields(fieldsByVersion[index]),
                id: version.id,
                url: getUrlForTemplateVersion(hostname, { template, versionNumber: version.id }),
                versionNumber: version.versionNumber,
            })),
        });
    });

    router.get('/:id(\\d+)', async (request: GetTemplateVersionRequest, response: GetTemplateVersionResponse) => {
        const { hostname, params } = request;
        const { id: versionNumber, template } = params;
        const parentId: TemplateId = { template };
        const id: TemplateVersionId = { ...parentId, versionNumber };

        // Check for the existence of the template and version. If they doesn't exist, 404
        const [doesTemplateExist, version] = await Promise.all([
            templateRepository.has(parentId),
            versionRepository.fetch(id),
        ]);

        if (!doesTemplateExist) {
            response.status(404).send({
                code: TemplateVersionErrorCode.NotFound,
                message: 'Template not found.',
            });

            return;
        }

        if (!version) {
            response.status(404).send({
                code: TemplateVersionErrorCode.NotFound,
                message: 'Template version not found.',
            });
            return;
        }

        const fields = await getChildTemplateFields(id);

        response.status(200).send({
            fields: removeEntityIdFromFields(fields),
            id: version.id,
            url: getUrlForTemplateVersion(hostname, id),
            versionNumber: version.versionNumber,
        });
    });

    router.put('/:id(\\d+)', async (request: PutTemplateVersionRequest, response: PutTemplateVersionResponse) => {
        const { body, hostname, params } = request;
        const { fields, versionNumber } = body;
        const { id: versionNumberId, template } = params;
        const parentId: TemplateId = { template };
        const id: TemplateVersionId = { ...parentId, versionNumber: versionNumberId };

        // Check validity of request
        if (fields.some(isInvalidField)) {
            response.status(400).send({
                code: TemplateVersionErrorCode.InvalidFields,
                message: 'One or more fields are invalid.',
            });

            return;
        }

        // Check for the existence of the template. If it doesn't exist, 404
        const doesTemplateExist = await templateRepository.has(parentId);

        if (!doesTemplateExist) {
            response.status(404).send({
                code: TemplateVersionErrorCode.NotFound,
                message: 'Template not found.',
            });

            return;
        }

        const timestamp = new Date();

        const versionModel = await versionRepository.save(id, {
            createdAt: timestamp,
            id: versionNumberId,
            modifiedAt: timestamp,
            versionNumber,
        });

        const fieldModels = await Promise.all(
            fields.map((field) => fieldRepository.save({ ...id, field: field.id }, field)),
        );

        response.status(201).send({
            fields: removeEntityIdFromFields(fieldModels),
            id: versionModel.id,
            url: getUrlForTemplateVersion(hostname, id),
            versionNumber: versionModel.versionNumber,
        });
    });

    return router;
};
