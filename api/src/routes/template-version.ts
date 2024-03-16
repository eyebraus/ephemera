import {
    TemplateFieldModel,
    TemplateVersionModel,
    getEntityIdForTemplate,
    getEntityIdForTemplateField,
    getEntityIdForTemplateVersion,
} from '@ephemera/data';
import { TemplateVersionIdTokenSet } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { Request, Response, Router } from 'express';
import { Entity } from 'redis-om';
import { ApiProfile } from '../configure';
import {
    GetTemplateVersionResponseBody,
    ListTemplateVersionsResponseBody,
    PutTemplateVersionRequestBody,
    PutTemplateVersionResponseBody,
} from '../contract/template-version';
import { getCountFromQuery, getSkipFromQuery } from '../utilities/query';

type DeleteTemplateVersionRequest = Request<{ id: string; template: string }>;
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

const getUrlForTemplateVersion = (hostname: string, tokens: TemplateVersionIdTokenSet) => {
    const { template, versionNumber } = tokens;

    return `https://${hostname}/templates/${template.toLowerCase()}/versions/${versionNumber}`;
};

export const templateVersionRouter: Factory<ApiProfile, Router> = (provider) => {
    const fieldRepository = provider('templateFieldRepository');
    const versionRepository = provider('templateVersionRepository');
    const router = Router();

    const getChildTemplateFields = async (entityId: string) => {
        const entities = await fieldRepository.search().where('entityId').equals(`${entityId}:*`).all();

        return entities as unknown as (TemplateFieldModel & Entity)[];
    };

    router.delete('/:id(d+)', async (request: DeleteTemplateVersionRequest, response) => {
        const { params } = request;
        const { id, template } = params;
        const entityId = getEntityIdForTemplateVersion({ template, versionNumber: id });

        const fields = await getChildTemplateFields(entityId);
        const fieldEntityIds = fields.map((field) => field.entityId);

        await Promise.all([
            versionRepository.remove(entityId),
            ...fieldEntityIds.map((entityId) => fieldRepository.remove(entityId)),
        ]);

        response.status(204);
    });

    router.get('/', async (request: ListTemplateVersionsRequest, response: ListTemplateVersionsResponse) => {
        const { hostname, params } = request;
        const { template } = params;
        const count = getCountFromQuery(request);
        const skip = getSkipFromQuery(request);
        const templateEntityId = getEntityIdForTemplate({ template });

        const versions = (await versionRepository
            .search()
            .where('entityId')
            .equals(`${templateEntityId}:*`)
            .page(skip, count)) as unknown as (TemplateVersionModel & Entity)[];

        const fieldsByVersion = await Promise.all(versions.map((version) => getChildTemplateFields(version.entityId)));

        const value = versions.map<GetTemplateVersionResponseBody>((version, index) => ({
            fields: fieldsByVersion[index].map((model) => ({
                allowed: model.allowed,
                description: model.description,
                id: model.id,
                kind: model.kind,
                name: model.name,
                required: model.required,
            })),
            id: version.id,
            url: getUrlForTemplateVersion(hostname, { template, versionNumber: version.id }),
            versionNumber: version.versionNumber,
        }));

        response.status(200).send({
            count: value.length,
            start: skip,
            value,
        });
    });

    router.get('/:id(d+)', async (request: GetTemplateVersionRequest, response: GetTemplateVersionResponse) => {
        const { hostname, params } = request;
        const { id, template } = params;
        const entityId = getEntityIdForTemplateVersion({ template, versionNumber: id });

        const version = (await versionRepository.fetch(entityId)) as unknown as TemplateVersionModel;
        const fields = await getChildTemplateFields(entityId);

        response.status(200).send({
            fields: fields.map((model) => ({
                allowed: model.allowed,
                description: model.description,
                id: model.id,
                kind: model.kind,
                name: model.name,
                required: model.required,
            })),
            id: version.id,
            url: getUrlForTemplateVersion(hostname, { template, versionNumber: id }),
            versionNumber: version.versionNumber,
        });
    });

    router.put('/:id(d+)', async (request: PutTemplateVersionRequest, response: PutTemplateVersionResponse) => {
        const { body, hostname, params } = request;
        const { fields, versionNumber } = body;
        const { id, template } = params;
        const timestamp = new Date();
        const entityId = getEntityIdForTemplateVersion({ template, versionNumber: id });

        const versionEntity: TemplateVersionModel & Entity = {
            createdAt: timestamp,
            entityId,
            id,
            modifiedAt: timestamp,
            versionNumber,
        };

        const fieldEntities = fields.map<TemplateFieldModel & Entity>((field) => ({
            allowed: field.allowed,
            description: field.description,
            entityId: getEntityIdForTemplateField({ field: field.id, template, versionNumber: id }),
            id: field.id,
            kind: field.kind,
            name: field.name,
            required: field.required,
        }));

        const versionModel = (await versionRepository.save(entityId, versionEntity)) as unknown as TemplateVersionModel;

        const fieldModels = await Promise.all(
            fieldEntities.map(async (entity) => {
                const entityId = getEntityIdForTemplateField({
                    field: entity.id,
                    template,
                    versionNumber: id,
                });

                return (await fieldRepository.save(entityId, entity)) as unknown as TemplateFieldModel;
            }),
        );

        response.status(201).send({
            fields: fieldModels.map((model) => ({
                allowed: model.allowed,
                description: model.description,
                id: model.id,
                kind: model.kind,
                name: model.name,
                required: model.required,
            })),
            id: versionModel.id,
            url: getUrlForTemplateVersion(hostname, { template, versionNumber: id }),
            versionNumber: versionModel.versionNumber,
        });
    });

    return router;
};
