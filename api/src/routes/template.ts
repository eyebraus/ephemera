import { TemplateId } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { Request, Response, Router } from 'express';
import { ApiProfile } from '../configure';
import {
    GetTemplateResponseBody,
    ListTemplatesResponseBody,
    PatchTemplateRequestBody,
    PatchTemplateResponseBody,
    PutTemplateRequestBody,
    PutTemplateResponseBody,
} from '../contract/template';
import { getCountFromQuery, getSkipFromQuery } from '../utilities/query';

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

    router.delete('/:id', async (request, response) => {
        const { params } = request;
        const { id: template } = params;
        const id: TemplateId = { template };

        // Check for the existence of the template. If it doesn't exist, 404
        const doesTemplateExist = await templateRepository.has(id);

        if (!doesTemplateExist) {
            response.status(404);
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

        const value = templates.map<GetTemplateResponseBody>((template) => ({
            description: template.description,
            id: template.id,
            name: template.name,
            url: getUrlForTemplate(hostname, { template: template.id }),
        }));

        response.status(200).send({
            count: value.length,
            start: skip,
            value,
        });
    });

    router.get('/:id', async (request, response: GetTemplateResponse) => {
        const { hostname, params } = request;
        const { id } = params;
        const template = await templateRepository.fetch({ template: id });

        if (!template) {
            response.status(404);
            return;
        }

        response.status(200).send({
            description: template.description,
            id: template.id,
            name: template.name,
            url: getUrlForTemplate(hostname, { template: id }),
        });
    });

    router.patch('/:id', async (request: PatchTemplateRequest, response: PatchTemplateResponse) => {
        const { body, hostname, params } = request;
        const { id } = params;
        const timestamp = new Date();

        const existingTemplate = await templateRepository.fetch({ template: id });

        if (!existingTemplate) {
            response.status(404);
            return;
        }

        const template = await templateRepository.save(
            { template: id },
            {
                ...existingTemplate,
                ...body,
                modifiedAt: timestamp,
            },
        );

        response.status(200).send({
            description: template.description,
            id: template.id,
            name: template.name,
            url: getUrlForTemplate(hostname, { template: id }),
        });
    });

    router.put('/:id', async (request: PutTemplateRequest, response: PutTemplateResponse) => {
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
