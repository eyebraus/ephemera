import { TemplateModel, getEntityIdForTemplate } from '@ephemera/data';
import { TemplateIdTokenSet } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { Request, Response, Router } from 'express';
import { Entity } from 'redis-om';
import { ApiProfile } from '../configure';
import {
    GetTemplateResponseBody,
    ListTemplatesResponseBody,
    PutTemplateRequestBody,
    PutTemplateResponseBody,
} from '../contract/template';
import { getCountFromQuery, getSkipFromQuery } from '../utilities/query';

type GetTemplateResponse = Response<GetTemplateResponseBody>;
type ListTemplatesResponse = Response<ListTemplatesResponseBody>;
type PutTemplateRequest = Request<{ id: string }, PutTemplateResponseBody, PutTemplateRequestBody>;
type PutTemplateResponse = Response<PutTemplateResponseBody>;

const getUrlForTemplate = (hostname: string, tokens: TemplateIdTokenSet) => {
    const { template } = tokens;

    return `https://${hostname}/template/${template.toLowerCase()}`;
};

export const templateRouter: Factory<ApiProfile, Router> = (provider) => {
    const repository = provider('templateRepository');
    const router = Router();

    router.delete('/:id', async (request, response) => {
        const { params } = request;
        const { id } = params;
        const entityId = getEntityIdForTemplate({ template: id });

        await repository.remove(entityId);
        response.status(204);
    });

    router.get('/', async (request, response: ListTemplatesResponse) => {
        const { hostname } = request;
        const count = getCountFromQuery(request);
        const skip = getSkipFromQuery(request);
        const templates = (await repository.search().page(skip, count)) as unknown as (TemplateModel & Entity)[];

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
        const entityId = getEntityIdForTemplate({ template: id });

        const template = (await repository.fetch(entityId)) as unknown as TemplateModel;

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
        const entityId = getEntityIdForTemplate({ template: id });

        const entity: TemplateModel & Entity = {
            ...body,
            createdAt: timestamp,
            entityId,
            id,
            modifiedAt: timestamp,
        };

        const template = (await repository.save(entityId, entity)) as unknown as TemplateModel;

        response.status(201).send({
            description: template.description,
            id: template.id,
            name: template.name,
            url: getUrlForTemplate(hostname, { template: id }),
        });
    });

    return router;
};
