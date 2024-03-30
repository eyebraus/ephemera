import { TemplateId } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { validateRequestBody } from '@ephemera/services';
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

type DeleteTemplateResponse = Response<DeleteTemplateResponseBody>;
type GetTemplateResponse = Response<GetTemplateResponseBody>;
type ListTemplatesResponse = Response<ListTemplatesResponseBody>;
type PatchTemplateRequest = Request<{ id: string }, PatchTemplateResponseBody, PatchTemplateRequestBody>;
type PatchTemplateResponse = Response<PatchTemplateResponseBody>;
type PutTemplateRequest = Request<{ id: string }, PutTemplateResponseBody, PutTemplateRequestBody>;
type PutTemplateResponse = Response<PutTemplateResponseBody>;

const getUrlForTemplate = (hostname: string, id: TemplateId) => {
    const { template } = id;

    return `https://${hostname}/template/${template.toLowerCase()}`;
};

const validatePatchRequestBody = validateRequestBody<TemplateErrorCode>((builder) => {
    builder.addField('description', (field) => {
        field.shouldNotBeBlank({
            code: TemplateErrorCode.InvalidDescription,
            message: 'Description cannot be empty.',
        });
    });

    builder.addField('name', (field) => {
        field.shouldNotBeBlank({
            code: TemplateErrorCode.InvalidName,
            message: 'Name cannot be empty.',
        });
    });
});

const validatePutRequestBody = validateRequestBody<TemplateErrorCode>((builder) => {
    builder.addField('description', (field) => {
        field
            .isRequired({
                code: TemplateErrorCode.MissingDescription,
                message: 'Property "description" must be given.',
            })
            .shouldNotBeBlank({
                code: TemplateErrorCode.InvalidDescription,
                message: 'Property "description" cannot be empty.',
            });
    });

    builder.addField('name', (field) => {
        field
            .isRequired({
                code: TemplateErrorCode.MissingName,
                message: 'Property "name" must be given.',
            })
            .shouldNotBeBlank({
                code: TemplateErrorCode.InvalidName,
                message: 'Property "name" cannot be empty.',
            });
    });
});

export const templateRouter: Factory<ApiProfile, Router> = (provider) => {
    const fieldRepository = provider('templateFieldRepository');
    const templateRepository = provider('templateRepository');
    const versionRepository = provider('templateVersionRepository');
    const router = Router({ mergeParams: true });

    const getIdsOfChildTemplateFields = async (id: TemplateId) => {
        const entityId = templateRepository.getEntityId(id);

        return await fieldRepository.search().where('entityId').equals(`${entityId}/*`).allIds();
    };

    const getIdsOfChildTemplateVersions = async (id: TemplateId) => {
        const entityId = templateRepository.getEntityId(id);

        return await versionRepository.search().where('entityId').equals(`${entityId}/*`).allIds();
    };

    router.delete('/:id', async (request, response: DeleteTemplateResponse) => {
        const { params } = request;
        const { id: template } = params;
        const id: TemplateId = { template };

        // Check for the existence of the template. If it doesn't exist, 404
        const doesTemplateExist = await templateRepository.has(id);

        if (!doesTemplateExist) {
            response.status(404).send({
                code: TemplateErrorCode.NotFound,
                message: 'Template not found.',
            });

            return;
        }

        // Get IDs of all descended template versions and fields
        const [fieldIds, versionIds] = await Promise.all([
            getIdsOfChildTemplateFields(id),
            getIdsOfChildTemplateVersions(id),
        ]);

        // Delete template and all related documents
        await Promise.all([
            templateRepository.remove(id),
            ...versionIds.map((id) => versionRepository.remove(id)),
            ...fieldIds.map((id) => fieldRepository.remove(id)),
        ]);

        response.status(204);
    });

    router.get('/', async (request, response: ListTemplatesResponse) => {
        const { hostname } = request;
        const count = getCountFromQuery(request);
        const skip = getSkipFromQuery(request);
        const templates = await templateRepository.search().page(skip, count);

        response.status(200).send({
            count: templates.length,
            start: skip,
            value: templates.map((template) => ({
                description: template.description,
                id: template.id,
                name: template.name,
                url: getUrlForTemplate(hostname, { template: template.id }),
            })),
        });
    });

    router.get('/:id', async (request, response: GetTemplateResponse) => {
        const { hostname, params } = request;
        const { id } = params;
        const template = await templateRepository.fetch({ template: id });

        if (!template) {
            response.status(404).send({
                code: TemplateErrorCode.NotFound,
                message: 'Template not found.',
            });

            return;
        }

        response.status(200).send({
            description: template.description,
            id: template.id,
            name: template.name,
            url: getUrlForTemplate(hostname, { template: id }),
        });
    });

    router.patch(
        '/:id',
        validatePatchRequestBody,
        async (request: PatchTemplateRequest, response: PatchTemplateResponse) => {
            const { body, hostname, params } = request;
            const { id } = params;

            const existingTemplate = await templateRepository.fetch({ template: id });

            if (!existingTemplate) {
                response.status(404).send({
                    code: TemplateErrorCode.NotFound,
                    message: 'Template not found.',
                });

                return;
            }

            const template = await templateRepository.save(
                { template: id },
                {
                    ...existingTemplate,
                    ...body,
                    modifiedAt: new Date(),
                },
            );

            response.status(200).send({
                description: template.description,
                id: template.id,
                name: template.name,
                url: getUrlForTemplate(hostname, { template: id }),
            });
        },
    );

    router.put('/:id', validatePutRequestBody, async (request: PutTemplateRequest, response: PutTemplateResponse) => {
        const { body, hostname, params } = request;
        const { id } = params;

        const timestamp = new Date();

        const template = await templateRepository.save(
            { template: id },
            {
                ...body,
                createdAt: timestamp,
                id,
                modifiedAt: timestamp,
            },
        );

        response.status(201).send({
            description: template.description,
            id: template.id,
            name: template.name,
            url: getUrlForTemplate(hostname, { template: id }),
        });
    });

    return router;
};
