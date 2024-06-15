import { OrganizationId, TemplateFieldKind, TemplateId } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { validateRequestBody } from '@ephemera/services';
import { isFailure } from '@ephemera/stdlib';
import { Request, Response, Router } from 'express';
import { ApiProfile } from '../configure';
import {
    DeleteTemplateResponseBody,
    GetTemplateResponseBody,
    ListTemplatesResponseBody,
    PatchTemplateRequestBody,
    PatchTemplateResponseBody,
    PutTemplateRequestBody,
    PutTemplateResponseBody,
    TemplateErrorCode,
} from '../contract/template';
import { getCountFromQuery, getSkipFromQuery } from '../utilities/query';

type DeleteTemplateRequest = Request<{ organizationId: string; templateId: string }>;
type DeleteTemplateResponse = Response<DeleteTemplateResponseBody>;
type GetTemplateRequest = Request<{ organizationId: string; templateId: string }>;
type GetTemplateResponse = Response<GetTemplateResponseBody>;
type ListTemplatesRequest = Request<{ organizationId: string }>;
type ListTemplatesResponse = Response<ListTemplatesResponseBody>;

type PatchTemplateRequest = Request<
    { organizationId: string; templateId: string },
    PatchTemplateResponseBody,
    PatchTemplateRequestBody
>;

type PatchTemplateResponse = Response<PatchTemplateResponseBody>;

type PutTemplateRequest = Request<
    { organizationId: string; templateId: string },
    PutTemplateResponseBody,
    PutTemplateRequestBody
>;

type PutTemplateResponse = Response<PutTemplateResponseBody>;

const createTemplateRequestValidator = (validateRequired: boolean) =>
    validateRequestBody<TemplateErrorCode>((builder) => {
        builder.addField('description', (field) => {
            if (validateRequired) {
                field.isRequired({
                    code: TemplateErrorCode.MissingDescription,
                    message: 'Property "description" must be given.',
                });
            }

            field.shouldNotBeBlank({
                code: TemplateErrorCode.InvalidDescription,
                message: 'Property "description" cannot be empty.',
            });
        });

        builder.addField('fields', (field) => {
            if (validateRequired) {
                field.isRequired({
                    code: TemplateErrorCode.MissingFields,
                    message: 'Property "fields" must be given.',
                });
            }

            field.everyItemShouldPass((member) => {
                member.addField('allowed', (field) => {
                    field
                        .shouldBeArray({
                            code: TemplateErrorCode.InvalidFieldAllowed,
                            message: 'Property "allowed" must be an array.',
                        })
                        .shouldBeLongerThan(0, {
                            code: TemplateErrorCode.InvalidFieldAllowed,
                            message: 'Property "allowed" cannot be empty.',
                        });
                });

                member.addField('description', (field) => {
                    field
                        .isRequired({
                            code: TemplateErrorCode.MissingFieldDescription,
                            message: 'Property "description" must be given.',
                        })
                        .shouldNotBeBlank({
                            code: TemplateErrorCode.InvalidFieldDescription,
                            message: 'Property "description" cannot be empty.',
                        });
                });

                member.addField('id', (field) => {
                    field
                        .isRequired({
                            code: TemplateErrorCode.MissingFieldId,
                            message: 'Property "id" must be given.',
                        })
                        .shouldMatch(/^[A-Za-z0-9][A-Za-z0-9\._-]*$/, {
                            code: TemplateErrorCode.InvalidFieldId,
                            message:
                                'Property "id" is not of a valid format. Value should only include alphanums, .s, _s, and -s.',
                        });
                });

                member.addField('kind', (field) => {
                    field
                        .isRequired({
                            code: TemplateErrorCode.MissingFieldKind,
                            message: 'Property "kind" must be given.',
                        })
                        .shouldBeIn(Object.values(TemplateFieldKind), {
                            code: TemplateErrorCode.InvalidFieldKind,
                            message: 'Property "kind" is not one of the expected values.',
                        });
                });

                member.addField('name', (field) => {
                    field
                        .isRequired({
                            code: TemplateErrorCode.MissingFieldName,
                            message: 'Property "name" must be given.',
                        })
                        .shouldNotBeBlank({
                            code: TemplateErrorCode.InvalidFieldName,
                            message: 'Property "name" cannot be empty.',
                        });
                });

                member.addField('required', (field) => {
                    field.shouldBeBoolean({
                        code: TemplateErrorCode.InvalidFieldRequired,
                        message: 'Property "required" must be boolean.',
                    });
                });
            });
        });

        builder.addField('name', (field) => {
            if (validateRequired) {
                field.isRequired({
                    code: TemplateErrorCode.MissingName,
                    message: 'Property "name" must be given.',
                });
            }

            field.shouldNotBeBlank({
                code: TemplateErrorCode.InvalidName,
                message: 'Property "name" cannot be empty.',
            });
        });
    });

const getStatusCodeForErrorCode = (code: string) => {
    switch (code) {
        case TemplateErrorCode.InvalidDescription:
        case TemplateErrorCode.InvalidFieldAllowed:
        case TemplateErrorCode.InvalidFieldDescription:
        case TemplateErrorCode.InvalidFieldId:
        case TemplateErrorCode.InvalidFieldKind:
        case TemplateErrorCode.InvalidFieldName:
        case TemplateErrorCode.InvalidFieldRequired:
        case TemplateErrorCode.InvalidName:
        case TemplateErrorCode.InvalidRequest:
        case TemplateErrorCode.MissingDescription:
        case TemplateErrorCode.MissingFieldAllowed:
        case TemplateErrorCode.MissingFieldDescription:
        case TemplateErrorCode.MissingFieldId:
        case TemplateErrorCode.MissingFieldKind:
        case TemplateErrorCode.MissingFieldName:
        case TemplateErrorCode.MissingFieldRequired:
        case TemplateErrorCode.MissingFields:
        case TemplateErrorCode.MissingName:
            return 400;

        case TemplateErrorCode.NotFound:
            return 404;

        default:
            return 500;
    }
};

const getUrlForTemplate = (hostname: string, id: TemplateId) => {
    const { organization, template } = id;

    return `https://${hostname}/orgs/${organization.toLowerCase()}/templates/${template.toLowerCase()}`;
};

const validatePatchRequestBody = createTemplateRequestValidator(false);
const validatePutRequestBody = createTemplateRequestValidator(true);

export const templateRouter: Factory<ApiProfile, Router> = (getUnit) => {
    const templateEntityRepository = getUnit('templateEntityRepository');
    const router = Router({ mergeParams: true });

    router.delete('/:templateId', async (request: DeleteTemplateRequest, response: DeleteTemplateResponse) => {
        const { params } = request;
        const { organizationId, templateId } = params;
        const id: TemplateId = { organization: organizationId, template: templateId };

        const result = await templateEntityRepository.remove(id);

        if (isFailure(result)) {
            const { content } = result;
            const { code } = content;
            response.status(getStatusCodeForErrorCode(code)).send(content);

            return;
        }

        response.status(204);
    });

    router.get('/', async (request: ListTemplatesRequest, response: ListTemplatesResponse) => {
        const { hostname, params } = request;
        const { organizationId } = params;
        const count = getCountFromQuery(request);
        const skip = getSkipFromQuery(request);
        const id: OrganizationId = { organization: organizationId };

        const result = await templateEntityRepository.listBy(id, skip, count);

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
            values: content.map((template) => ({
                ...template,
                url: getUrlForTemplate(hostname, { ...id, template: template.id }),
            })),
        });
    });

    router.get('/:templateId', async (request: GetTemplateRequest, response: GetTemplateResponse) => {
        const { hostname, params } = request;
        const { organizationId, templateId } = params;
        const parentId: OrganizationId = { organization: organizationId };
        const id: TemplateId = { ...parentId, template: templateId };

        const result = await templateEntityRepository.get(id);

        if (isFailure(result)) {
            const { content } = result;
            const { code } = content;
            response.status(getStatusCodeForErrorCode(code)).send(content);

            return;
        }

        const { content } = result;
        const url = getUrlForTemplate(hostname, id);
        response.status(200).send({ ...content, url });
    });

    router.patch(
        '/:templateId',
        validatePatchRequestBody,
        async (request: PatchTemplateRequest, response: PatchTemplateResponse) => {
            const { body, hostname, params } = request;
            const { organizationId, templateId } = params;
            const id: TemplateId = { organization: organizationId, template: templateId };

            const result = await templateEntityRepository.update(id, body);

            if (isFailure(result)) {
                const { content } = result;
                const { code } = content;
                response.status(getStatusCodeForErrorCode(code)).send(content);

                return;
            }

            const { content } = result;
            const url = getUrlForTemplate(hostname, id);
            response.status(200).send({ ...content, url });
        },
    );

    router.put(
        '/:templateId',
        validatePutRequestBody,
        async (request: PutTemplateRequest, response: PutTemplateResponse) => {
            const { body, hostname, params } = request;
            const { organizationId, templateId } = params;
            const id: TemplateId = { organization: organizationId, template: templateId };

            const result = await templateEntityRepository.set(id, body);

            if (isFailure(result)) {
                const { content } = result;
                const { code } = content;
                response.status(getStatusCodeForErrorCode(code)).send(content);

                return;
            }

            const { content } = result;
            const url = getUrlForTemplate(hostname, id);
            response.status(content.version === 1 ? 201 : 200).send({ ...content, url });
        },
    );

    return router;
};
