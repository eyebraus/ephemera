import { OrganizationId } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { validateRequestBody } from '@ephemera/services';
import { isFailure } from '@ephemera/stdlib';
import { Request, Response, Router } from 'express';
import { ApiProfile } from '../configure';
import {
    DeleteOrganizationResponseBody,
    GetOrganizationResponseBody,
    ListOrganizationsResponseBody,
    OrganizationErrorCode,
    PatchOrganizationRequestBody,
    PatchOrganizationResponseBody,
    PutOrganizationRequestBody,
    PutOrganizationResponseBody,
} from '../contract/organization';
import { getCountFromQuery, getSkipFromQuery } from '../utilities/query';

type DeleteOrganizationResponse = Response<DeleteOrganizationResponseBody>;
type GetOrganizationResponse = Response<GetOrganizationResponseBody>;
type ListOrganizationsResponse = Response<ListOrganizationsResponseBody>;

type PatchOrganizationRequest = Request<
    { organizationId: string },
    PatchOrganizationResponseBody,
    PatchOrganizationRequestBody
>;

type PatchOrganizationResponse = Response<PatchOrganizationResponseBody>;

type PutOrganizationRequest = Request<
    { organizationId: string },
    PutOrganizationResponseBody,
    PutOrganizationRequestBody
>;

type PutOrganizationResponse = Response<PutOrganizationResponseBody>;

const createOrganizationRequestValidator = (validateRequired: boolean) =>
    validateRequestBody<OrganizationErrorCode>((builder) => {
        builder.addField('description', (field) => {
            if (validateRequired) {
                field.isRequired({
                    code: OrganizationErrorCode.MissingDescription,
                    message: 'Property "description" must be given.',
                });
            }

            field.shouldNotBeBlank({
                code: OrganizationErrorCode.InvalidDescription,
                message: 'Property "description" cannot be empty.',
            });
        });

        builder.addField('name', (field) => {
            if (validateRequired) {
                field.isRequired({
                    code: OrganizationErrorCode.MissingName,
                    message: 'Property "name" must be given.',
                });
            }

            field.shouldNotBeBlank({
                code: OrganizationErrorCode.InvalidName,
                message: 'Property "name" cannot be empty.',
            });
        });
    });

const getStatusCodeForErrorCode = (code: string) => {
    switch (code) {
        case OrganizationErrorCode.InvalidDescription:
        case OrganizationErrorCode.InvalidName:
        case OrganizationErrorCode.InvalidRequest:
        case OrganizationErrorCode.MissingDescription:
        case OrganizationErrorCode.MissingName:
            return 400;

        case OrganizationErrorCode.NotFound:
            return 404;

        default:
            return 500;
    }
};

const getUrlForOrganization = (hostname: string, id: OrganizationId) => {
    const { organization } = id;

    return `https://${hostname}/orgs/${organization.toLowerCase()}`;
};

const validatePatchRequestBody = createOrganizationRequestValidator(false);
const validatePutRequestBody = createOrganizationRequestValidator(true);

export const organizationRouter: Factory<ApiProfile, Router> = (getUnit) => {
    const organizationEntityRepository = getUnit('organizationEntityRepository');
    const router = Router({ mergeParams: true });

    // TODO: write background job to clean up associated records
    router.delete('/:organizationId', async (request, response: DeleteOrganizationResponse) => {
        const { params } = request;
        const { organizationId } = params;
        const id: OrganizationId = { organization: organizationId };

        const result = await organizationEntityRepository.remove(id);

        if (isFailure(result)) {
            const { content } = result;
            const { code } = content;
            response.status(getStatusCodeForErrorCode(code)).send(content);

            return;
        }

        response.status(204);
    });

    router.get('/', async (request, response: ListOrganizationsResponse) => {
        const { hostname } = request;
        const count = getCountFromQuery(request);
        const skip = getSkipFromQuery(request);

        const result = await organizationEntityRepository.list(skip, count);

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
            values: content.map((org) => ({
                ...org,
                url: getUrlForOrganization(hostname, { organization: org.id }),
            })),
        });
    });

    router.get('/:organizationId', async (request, response: GetOrganizationResponse) => {
        const { hostname, params } = request;
        const { organizationId } = params;
        const id: OrganizationId = { organization: organizationId };

        const result = await organizationEntityRepository.get(id);

        if (isFailure(result)) {
            const { content } = result;
            const { code } = content;
            response.status(getStatusCodeForErrorCode(code)).send(content);

            return;
        }

        const { content } = result;
        const url = getUrlForOrganization(hostname, id);
        response.status(200).send({ ...content, url });
    });

    router.patch(
        '/:organizationId',
        validatePatchRequestBody,
        async (request: PatchOrganizationRequest, response: PatchOrganizationResponse) => {
            const { body, hostname, params } = request;
            const { organizationId } = params;
            const id: OrganizationId = { organization: organizationId };

            const result = await organizationEntityRepository.update(id, body);

            if (isFailure(result)) {
                const { content } = result;
                const { code } = content;
                response.status(getStatusCodeForErrorCode(code)).send(content);

                return;
            }

            const { content } = result;
            const url = getUrlForOrganization(hostname, id);
            response.status(200).send({ ...content, url });
        },
    );

    router.put(
        '/:organizationId',
        validatePutRequestBody,
        async (request: PutOrganizationRequest, response: PutOrganizationResponse) => {
            const { body, hostname, params } = request;
            const { organizationId } = params;
            const id: OrganizationId = { organization: organizationId };

            const result = await organizationEntityRepository.set(id, body);

            if (isFailure(result)) {
                const { content } = result;
                const { code } = content;
                response.status(getStatusCodeForErrorCode(code)).send(content);

                return;
            }

            const { content } = result;
            const url = getUrlForOrganization(hostname, id);
            response.status(201).send({ ...content, url });
        },
    );

    return router;
};
