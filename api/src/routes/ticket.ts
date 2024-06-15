import { OrganizationId, TicketId } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { validateRequestBody } from '@ephemera/services';
import { isFailure } from '@ephemera/stdlib';
import { Request, Response, Router } from 'express';
import { ApiProfile } from '../configure';
import {
    DeleteTicketResponseBody,
    GetTicketResponseBody,
    ListTicketsResponseBody,
    PatchTicketRequestBody,
    PatchTicketResponseBody,
    PostTicketRequestBody,
    PostTicketResponseBody,
    PutTicketRequestBody,
    PutTicketResponseBody,
    TicketErrorCode,
} from '../contract/ticket';
import { getCountFromQuery, getSkipFromQuery } from '../utilities/query';

type DeleteTicketRequest = Request<{ organizationId: string; ticketId: string }>;
type DeleteTicketResponse = Response<DeleteTicketResponseBody>;
type GetTicketRequest = Request<{ organizationId: string; ticketId: string }>;
type GetTicketResponse = Response<GetTicketResponseBody>;
type ListTicketsRequest = Request<{ organizationId: string }>;
type ListTicketsResponse = Response<ListTicketsResponseBody>;

type PatchTicketRequest = Request<
    { organizationId: string; ticketId: string },
    PatchTicketResponseBody,
    PatchTicketRequestBody
>;

type PatchTicketResponse = Response<PatchTicketResponseBody>;
type PostTicketRequest = Request<{ organizationId: string }, PostTicketResponseBody, PostTicketRequestBody>;
type PostTicketResponse = Response<PostTicketResponseBody>;

type PutTicketRequest = Request<
    { organizationId: string; ticketId: string },
    PutTicketResponseBody,
    PutTicketRequestBody
>;

type PutTicketResponse = Response<PutTicketResponseBody>;

const createTicketRequestValidator = (validateRequired: boolean) =>
    validateRequestBody<TicketErrorCode>((builder) => {
        builder.addField('template', (field) => {
            if (validateRequired) {
                field.isRequired({
                    code: TicketErrorCode.MissingTemplate,
                    message: 'Property "template" must be given.',
                });
            }

            field.shouldNotBeBlank({
                code: TicketErrorCode.InvalidTemplate,
                message: 'Property "template" cannot be empty.',
            });
        });

        builder.addField('templateVersion', (field) => {
            field.shouldBeGreaterThan(0, {
                code: TicketErrorCode.InvalidTemplateVersion,
                message: 'Property "templateVersion" must be greater than 0.',
            });
        });

        builder.addField('title', (field) => {
            if (validateRequired) {
                field.isRequired({
                    code: TicketErrorCode.MissingTitle,
                    message: 'Property "title" must be given.',
                });
            }

            field.shouldNotBeBlank({
                code: TicketErrorCode.InvalidTitle,
                message: 'Property "title" cannot be empty.',
            });
        });

        builder.addField('values', (field) => {
            if (validateRequired) {
                field.isRequired({
                    code: TicketErrorCode.MissingValues,
                    message: 'Property "values" must be given.',
                });
            }

            field.shouldBeArray({
                code: TicketErrorCode.InvalidValues,
                message: 'Property "values" should be an array.',
            });

            field.everyItemShouldPass((member) => {
                member.addField('field', (field) => {
                    field
                        .isRequired({
                            code: TicketErrorCode.MissingValueField,
                            message: 'Property "field" must be given.',
                        })
                        .shouldNotBeBlank({
                            code: TicketErrorCode.InvalidValueField,
                            message: 'Property "field" cannot be empty.',
                        });
                });

                member.addField('value', (field) => {
                    field
                        .isRequired({
                            code: TicketErrorCode.MissingValueValue,
                            message: 'Property "value" must be given.',
                        })
                        .shouldNotBeBlank({
                            code: TicketErrorCode.InvalidValueValue,
                            message: 'Property "value" cannot be empty.',
                        });
                });
            });
        });
    });

const getStatusCodeForErrorCode = (code: string) => {
    switch (code) {
        case TicketErrorCode.InvalidRequest:
        case TicketErrorCode.InvalidTemplate:
        case TicketErrorCode.InvalidTemplateVersion:
        case TicketErrorCode.InvalidTitle:
        case TicketErrorCode.InvalidValueField:
        case TicketErrorCode.InvalidValues:
        case TicketErrorCode.InvalidValueValue:
        case TicketErrorCode.MissingTemplate:
        case TicketErrorCode.MissingTitle:
        case TicketErrorCode.MissingValueField:
        case TicketErrorCode.MissingValues:
        case TicketErrorCode.MissingValueValue:
            return 400;

        case TicketErrorCode.NotFound:
            return 404;

        default:
            return 500;
    }
};

const getUrlForTicket = (hostname: string, id: TicketId) => {
    const { organization, ticket } = id;

    return `https://${hostname}/orgs/${organization.toLowerCase()}/tickets/${ticket.toLowerCase()}`;
};

const validatePatchRequestBody = createTicketRequestValidator(false);
const validatePostRequestBody = createTicketRequestValidator(true);
const validatePutRequestBody = createTicketRequestValidator(true);

export const ticketRouter: Factory<ApiProfile, Router> = (getUnit) => {
    const ticketEntityRepository = getUnit('ticketEntityRepository');
    const router = Router({ mergeParams: true });

    router.delete('/:ticketId', async (request: DeleteTicketRequest, response: DeleteTicketResponse) => {
        const { params } = request;
        const { organizationId, ticketId } = params;
        const id: TicketId = { organization: organizationId, ticket: ticketId };

        const result = await ticketEntityRepository.remove(id);

        if (isFailure(result)) {
            const { content } = result;
            const { code } = content;
            response.status(getStatusCodeForErrorCode(code)).send(content);

            return;
        }

        response.status(204);
    });

    router.get('/', async (request: ListTicketsRequest, response: ListTicketsResponse) => {
        const { hostname, params } = request;
        const { organizationId } = params;
        const count = getCountFromQuery(request);
        const skip = getSkipFromQuery(request);
        const id: OrganizationId = { organization: organizationId };

        const result = await ticketEntityRepository.listBy(id, skip, count);

        if (isFailure(result)) {
            const { content } = result;
            const { code } = content;
            response.status(getStatusCodeForErrorCode(code)).send(content);

            return;
        }

        const { content } = result;

        response.status(200).send({
            count: content.length,
            start: skip,
            values: content.map((ticket) => ({
                ...ticket,
                url: getUrlForTicket(hostname, { ...id, ticket: ticket.id }),
            })),
        });
    });

    router.get('/:ticketId', async (request: GetTicketRequest, response: GetTicketResponse) => {
        const { hostname, params } = request;
        const { organizationId, ticketId } = params;
        const parentId: OrganizationId = { organization: organizationId };
        const id: TicketId = { ...parentId, ticket: ticketId };

        const result = await ticketEntityRepository.get(id);

        if (isFailure(result)) {
            const { content } = result;
            const { code } = content;
            response.status(getStatusCodeForErrorCode(code)).send(content);

            return;
        }

        const { content } = result;
        const url = getUrlForTicket(hostname, id);
        response.status(200).send({ ...content, url });
    });

    router.patch(
        '/:ticketId',
        validatePatchRequestBody,
        async (request: PatchTicketRequest, response: PatchTicketResponse) => {
            const { body, hostname, params } = request;
            const { organizationId, ticketId } = params;
            const id: TicketId = { organization: organizationId, ticket: ticketId };

            const result = await ticketEntityRepository.update(id, body);

            if (isFailure(result)) {
                const { content } = result;
                const { code } = content;
                response.status(getStatusCodeForErrorCode(code)).send(content);

                return;
            }

            const { content } = result;
            const url = getUrlForTicket(hostname, id);
            response.status(200).send({ ...content, url });
        },
    );

    router.post('/', validatePostRequestBody, async (request: PostTicketRequest, response: PostTicketResponse) => {
        const { body, hostname, params } = request;
        const { organizationId } = params;
        const id: OrganizationId = { organization: organizationId };

        const result = await ticketEntityRepository.add(id, body);

        if (isFailure(result)) {
            const { content } = result;
            const { code } = content;
            response.status(getStatusCodeForErrorCode(code)).send(content);

            return;
        }

        const { content } = result;
        const url = getUrlForTicket(hostname, { ...id, ticket: content.id });
        response.status(201).send({ ...content, url });
    });

    router.put('/:ticketId', validatePutRequestBody, async (request: PutTicketRequest, response: PutTicketResponse) => {
        const { body, hostname, params } = request;
        const { organizationId, ticketId } = params;
        const id: TicketId = { organization: organizationId, ticket: ticketId };

        const result = await ticketEntityRepository.set(id, body);

        if (isFailure(result)) {
            const { content } = result;
            const { code } = content;
            response.status(getStatusCodeForErrorCode(code)).send(content);

            return;
        }

        const { content } = result;
        const url = getUrlForTicket(hostname, id);
        response.status(200).send({ ...content, url });
    });

    return router;
};
