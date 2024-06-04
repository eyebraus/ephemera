import { OrganizationEntity, OrganizationId, OrganizationProperties } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { ErrorCode } from '@ephemera/services';
import { FailureWithContent, Fault, Result, SuccessWithContent, SuccessWithoutContent } from '@ephemera/stdlib';
import {
    GetEntityOperation,
    ListEntitiesOperation,
    RemoveEntityOperation,
    SetEntityOperation,
    UpdateEntityOperation,
} from '../access/entity-operation';
import { DataProfile } from '../configure';

export type OrganizationEntityRepository = GetEntityOperation<OrganizationId, OrganizationEntity, ErrorCode> &
    ListEntitiesOperation<OrganizationEntity, ErrorCode> &
    RemoveEntityOperation<OrganizationId, ErrorCode> &
    SetEntityOperation<OrganizationId, OrganizationEntity, OrganizationProperties, ErrorCode> &
    UpdateEntityOperation<OrganizationId, OrganizationEntity, OrganizationProperties, ErrorCode>;

export const organizationEntityRepository: Factory<DataProfile, OrganizationEntityRepository> = (getUnit) => {
    const organizationDocRepository = getUnit('organizationDocRepository');

    const get = async (id: OrganizationId): Promise<Result<OrganizationEntity, Fault<ErrorCode>>> => {
        const organization = await organizationDocRepository.fetch(id);

        if (!organization || organization.isDeleted) {
            return FailureWithContent<Fault<ErrorCode>>({
                code: ErrorCode.NotFound,
                message: 'Organization not found.',
            });
        }

        return SuccessWithContent<OrganizationEntity>({
            description: organization.description,
            id: organization.id,
            name: organization.name,
        });
    };

    const list = async (skip: number, count: number): Promise<Result<OrganizationEntity[], Fault<ErrorCode>>> => {
        const organizations = await organizationDocRepository.search().where('isDeleted').false().page(skip, count);

        return SuccessWithContent<OrganizationEntity[]>(
            organizations.map((org) => ({
                description: org.description,
                id: org.id,
                name: org.name,
            })),
        );
    };

    const remove = async (id: OrganizationId): Promise<Result<void, Fault<ErrorCode>>> => {
        const organization = await organizationDocRepository.fetch(id);

        if (!organization || organization.isDeleted) {
            return FailureWithContent({
                code: ErrorCode.NotFound,
                message: 'Organization not found.',
            });
        }

        const timestamp = new Date();

        await organizationDocRepository.save(id, {
            ...organization,
            deletedAt: timestamp,
            isDeleted: true,
            modifiedAt: timestamp,
        });

        return SuccessWithoutContent();
    };

    const set = async (
        id: OrganizationId,
        properties: OrganizationProperties,
    ): Promise<Result<OrganizationEntity, Fault<ErrorCode>>> => {
        const timestamp = new Date();

        const organization = await organizationDocRepository.save(id, {
            ...properties,
            createdAt: timestamp,
            id: id.organization,
            modifiedAt: timestamp,
        });

        return SuccessWithContent<OrganizationEntity>({
            description: organization.description,
            id: organization.id,
            name: organization.name,
        });
    };

    const update = async (
        id: OrganizationId,
        properties: Partial<OrganizationProperties>,
    ): Promise<Result<OrganizationEntity, Fault<ErrorCode>>> => {
        const existingOrganization = await organizationDocRepository.fetch(id);

        if (!existingOrganization || existingOrganization.isDeleted) {
            return FailureWithContent<Fault<ErrorCode>>({
                code: ErrorCode.NotFound,
                message: 'Organization not found.',
            });
        }

        const organization = await organizationDocRepository.save(id, {
            ...existingOrganization,
            ...properties,
            modifiedAt: new Date(),
        });

        return SuccessWithContent<OrganizationEntity>({
            description: organization.description,
            id: organization.id,
            name: organization.name,
        });
    };

    return { get, list, remove, set, update };
};
