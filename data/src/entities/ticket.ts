import {
    OrganizationId,
    TemplateId,
    TicketEntity,
    TicketId,
    TicketProperties,
    TicketValueDoc,
    TicketValueEntity,
    TicketValueId,
    TicketValueProperties,
} from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { ErrorCode } from '@ephemera/services';
import { FailureWithContent, Fault, Result, SuccessWithContent, SuccessWithoutContent } from '@ephemera/stdlib';
import {
    AddEntityOperation,
    GetEntityOperation,
    ListEntitiesByOperation,
    RemoveEntityOperation,
    SetEntityOperation,
    UpdateEntityOperation,
} from '../access/entity-operation';
import { DataProfile } from '../configure';

const getTicketValueEntityFromDoc = (doc: TicketValueDoc): TicketValueEntity => ({
    field: doc.field,
    id: doc.id,
    value: doc.value,
});

export type TicketEntityRepository = AddEntityOperation<TicketEntity, TicketProperties, OrganizationId, ErrorCode> &
    GetEntityOperation<TicketId, TicketEntity, ErrorCode> &
    ListEntitiesByOperation<OrganizationId, TicketEntity, ErrorCode> &
    RemoveEntityOperation<TicketId, ErrorCode> &
    SetEntityOperation<TicketId, TicketEntity, TicketProperties, ErrorCode> &
    UpdateEntityOperation<TicketId, TicketEntity, TicketProperties, ErrorCode>;

// TODO: validate against given template
// TODO: handle adding templateDocId correctly
export const ticketEntityRepository: Factory<DataProfile, TicketEntityRepository> = (getUnit) => {
    const organizationDocRepository = getUnit('organizationDocRepository');
    const templateDocRepository = getUnit('templateDocRepository');
    const ticketDocRepository = getUnit('ticketDocRepository');
    const valueDocRepository = getUnit('ticketValueDocRepository');

    const getValuesForTicket = async (id: TicketId) => {
        const docId = ticketDocRepository.getDocId(id);
        const docs = await valueDocRepository.search().where('docId').equals(`${docId}/*`).all();

        return docs.map(getTicketValueEntityFromDoc);
    };

    const removeValuesForTicket = async (id: TicketId, timestamp: Date) => {
        const docId = ticketDocRepository.getDocId(id);
        const docs = await valueDocRepository.search().where('docId').equals(`${docId}/*`).all();

        return await Promise.all(
            docs.map((doc) => {
                const valueId: TicketValueId = { ...id, field: doc.id };

                return valueDocRepository.save(valueId, {
                    ...doc,
                    deletedAt: timestamp,
                    isDeleted: true,
                    modifiedAt: timestamp,
                });
            }),
        );
    };

    const saveValuesForTicket = async (id: TicketId, values: TicketValueProperties[], timestamp: Date) => {
        const docs = await Promise.all(
            values.map((value) => {
                const valueId: TicketValueId = { ...id, field: value.field };

                return valueDocRepository.save(valueId, {
                    ...value,
                    createdAt: timestamp,
                    id: value.field,
                    modifiedAt: timestamp,
                });
            }),
        );

        return docs.map(getTicketValueEntityFromDoc);
    };

    const add = async (
        id: OrganizationId,
        properties: TicketProperties,
    ): Promise<Result<TicketEntity, Fault<ErrorCode>>> => {
        // Fail if parent organization doesn't exist
        const organization = await organizationDocRepository.fetch(id);

        if (!organization || organization.isDeleted) {
            return FailureWithContent<Fault<ErrorCode>>({
                code: ErrorCode.NotFound,
                message: 'Organization not found.',
            });
        }

        const { values: valueProperties, ...otherProperties } = properties;
        const templateId: TemplateId = { ...id, template: properties.templateId };
        const ticketId: TicketId = { ...id, ticket: crypto.randomUUID() };
        const timestamp = new Date();

        const values = await saveValuesForTicket(ticketId, valueProperties, timestamp);

        const ticket = await ticketDocRepository.save(ticketId, {
            ...otherProperties,
            createdAt: timestamp,
            id: ticketId.ticket,
            modifiedAt: timestamp,
            templateDocId: templateDocRepository.getDocId(templateId),
            version: 1,
        });

        return SuccessWithContent<TicketEntity>({
            id: ticket.id,
            templateId: ticket.templateId,
            templateVersion: ticket.templateVersion,
            title: ticket.title,
            values,
            version: ticket.version,
        });
    };

    const get = async (id: TicketId): Promise<Result<TicketEntity, Fault<ErrorCode>>> => {
        // Fail if either the organization or ticket do not exist
        const parentId: OrganizationId = { organization: id.organization };

        const [organization, ticket] = await Promise.all([
            organizationDocRepository.fetch(parentId),
            ticketDocRepository.fetch(id),
        ]);

        if (!organization || organization.isDeleted || !ticket || ticket.isDeleted) {
            return FailureWithContent<Fault<ErrorCode>>({
                code: ErrorCode.NotFound,
                message: 'Ticket not found.',
            });
        }

        const values = await getValuesForTicket(id);

        return SuccessWithContent<TicketEntity>({
            id: ticket.id,
            templateId: ticket.templateId,
            templateVersion: ticket.templateVersion,
            title: ticket.title,
            values,
            version: ticket.version,
        });
    };

    const listBy = async (
        id: OrganizationId,
        skip: number,
        count: number,
    ): Promise<Result<TicketEntity[], Fault<ErrorCode>>> => {
        // Fail if parent organization doesn't exist
        const organization = await organizationDocRepository.fetch(id);

        if (!organization || organization.isDeleted) {
            return FailureWithContent<Fault<ErrorCode>>({
                code: ErrorCode.NotFound,
                message: 'Organization not found.',
            });
        }

        const tickets = await ticketDocRepository
            .search()
            .where('docId')
            .equals(`${organizationDocRepository.getDocId(id)}/*`)
            .where('isDeleted')
            .false()
            .page(skip, count);

        const valuesByTicket = await Promise.all(
            tickets.map((ticket) => getValuesForTicket({ ...id, ticket: ticket.id })),
        );

        return SuccessWithContent<TicketEntity[]>(
            tickets.map((ticket, index) => ({
                id: ticket.id,
                templateId: ticket.templateId,
                templateVersion: ticket.templateVersion,
                title: ticket.title,
                values: valuesByTicket[index],
                version: ticket.version,
            })),
        );
    };

    // TODO: revisions
    const remove = async (id: TicketId): Promise<Result<void, Fault<ErrorCode>>> => {
        // Fail if either the organization or ticket do not exist
        const parentId: OrganizationId = { organization: id.organization };

        const [organization, ticket] = await Promise.all([
            organizationDocRepository.fetch(parentId),
            ticketDocRepository.fetch(id),
        ]);

        if (!organization || organization.isDeleted || !ticket || ticket.isDeleted) {
            return FailureWithContent<Fault<ErrorCode>>({
                code: ErrorCode.NotFound,
                message: 'Ticket not found.',
            });
        }

        const timestamp = new Date();

        // Delete the ticket and all of its child values
        await Promise.all([
            ticketDocRepository.save(id, {
                ...ticket,
                deletedAt: timestamp,
                isDeleted: true,
                modifiedAt: timestamp,
            }),
            removeValuesForTicket(id, timestamp),
        ]);

        return SuccessWithoutContent();
    };

    // TODO: revisions
    // TODO: skip operation if there weren't any revisions
    const set = async (id: TicketId, properties: TicketProperties): Promise<Result<TicketEntity, Fault<ErrorCode>>> => {
        // Fail if either the organization or ticket do not exist
        const parentId: OrganizationId = { organization: id.organization };

        const [organization, ticket] = await Promise.all([
            organizationDocRepository.fetch(parentId),
            ticketDocRepository.fetch(id),
        ]);

        if (!organization || organization.isDeleted || !ticket || ticket.isDeleted) {
            return FailureWithContent<Fault<ErrorCode>>({
                code: ErrorCode.NotFound,
                message: 'Ticket not found.',
            });
        }

        const { values: valueProperties, ...otherProperties } = properties;
        const timestamp = new Date();

        // Overwrite existing values
        await removeValuesForTicket(id, timestamp);
        const newValues = await saveValuesForTicket(id, valueProperties, timestamp);

        // Overwrite existing ticket
        const newTicket = await ticketDocRepository.save(id, {
            ...ticket,
            ...otherProperties,
            id: id.ticket,
            modifiedAt: timestamp,
            version: ticket.version + 1,
        });

        return SuccessWithContent<TicketEntity>({
            id: newTicket.id,
            templateId: newTicket.templateId,
            templateVersion: newTicket.templateVersion,
            title: newTicket.title,
            values: newValues,
            version: newTicket.version,
        });
    };

    // TODO: revisions
    // TODO: skip operation if there weren't any revisions
    const update = async (
        id: TicketId,
        properties: Partial<TicketProperties>,
    ): Promise<Result<TicketEntity, Fault<ErrorCode>>> => {
        // Fail if either the organization or ticket do not exist
        const parentId: OrganizationId = { organization: id.organization };

        const [organization, ticket] = await Promise.all([
            organizationDocRepository.fetch(parentId),
            ticketDocRepository.fetch(id),
        ]);

        if (!organization || organization.isDeleted || !ticket || ticket.isDeleted) {
            return FailureWithContent<Fault<ErrorCode>>({
                code: ErrorCode.NotFound,
                message: 'Ticket not found.',
            });
        }

        const timestamp = new Date();
        const { values: valueProperties, ...otherProperties } = properties;
        let newValues: TicketValueEntity[] | undefined = undefined;

        // If new values were given, remove the old docs and save the new ones
        if (valueProperties) {
            await removeValuesForTicket(id, timestamp);
            newValues = await saveValuesForTicket(id, valueProperties, timestamp);
        }

        const updatedValues = newValues ?? (await getValuesForTicket(id));

        // Note: even if otherProperties is blank, we want to increment version/modifiedAt from values change
        const updatedTicket = await ticketDocRepository.save(id, {
            ...ticket,
            ...otherProperties,
            modifiedAt: timestamp,
            version: ticket.version + 1,
        });

        return SuccessWithContent<TicketEntity>({
            id: updatedTicket.id,
            templateId: updatedTicket.templateId,
            templateVersion: updatedTicket.templateVersion,
            title: updatedTicket.title,
            values: updatedValues,
            version: updatedTicket.version,
        });
    };

    return { add, get, listBy, remove, set, update };
};
