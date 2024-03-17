import { TemplateFieldModel } from '@ephemera/data';
import { TemplateFieldId, TemplateId, TemplateVersionId } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { Request, Response, Router } from 'express';
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

const getUrlForTemplateVersion = (hostname: string, tokens: TemplateVersionId) => {
    const { template, versionNumber } = tokens;

    return `https://${hostname}/templates/${template.toLowerCase()}/versions/${versionNumber}`;
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
    const router = Router();

    const getChildTemplateFields = async (id: TemplateVersionId) => {
        const entityId = versionRepository.getEntityId(id);

        return await fieldRepository.search().where('entityId').equals(`${entityId}:*`).all();
    };

    router.delete('/:id(d+)', async (request: DeleteTemplateVersionRequest, response) => {
        const { params } = request;
        const { id: versionNumber, template } = params;
        const id: TemplateVersionId = { template, versionNumber };

        const fields = await getChildTemplateFields(id);
        const fieldEntityIds = fields.map<TemplateFieldId>((field) => ({ ...id, field: field.id }));

        await Promise.all([versionRepository.remove(id), ...fieldEntityIds.map((id) => fieldRepository.remove(id))]);

        response.status(204);
    });

    router.get('/', async (request: ListTemplateVersionsRequest, response: ListTemplateVersionsResponse) => {
        const { hostname, params } = request;
        const { template } = params;
        const count = getCountFromQuery(request);
        const skip = getSkipFromQuery(request);
        const id: TemplateId = { template };

        const versions = await versionRepository
            .search()
            .where('entityId')
            .equals(`${templateRepository.getEntityId(id)}:*`)
            .page(skip, count);

        const fieldsByVersion = await Promise.all(
            versions.map((version) => getChildTemplateFields({ ...id, versionNumber: version.id })),
        );

        const value = versions.map<GetTemplateVersionResponseBody>((version, index) => ({
            fields: removeEntityIdFromFields(fieldsByVersion[index]),
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
        const { id: versionNumber, template } = params;
        const id: TemplateVersionId = { template, versionNumber };

        const version = await versionRepository.fetch(id);
        const fields = await getChildTemplateFields(id);

        response.status(200).send({
            fields: removeEntityIdFromFields(fields),
            id: version.id,
            url: getUrlForTemplateVersion(hostname, id),
            versionNumber: version.versionNumber,
        });
    });

    router.put('/:id(d+)', async (request: PutTemplateVersionRequest, response: PutTemplateVersionResponse) => {
        const { body, hostname, params } = request;
        const { fields, versionNumber } = body;
        const { id: versionNumberId, template } = params;
        const id: TemplateVersionId = { template, versionNumber: versionNumberId };
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
