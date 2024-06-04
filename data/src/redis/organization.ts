import { OrganizationDoc, OrganizationId } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { CoreError } from '@ephemera/stdlib';
import { Schema } from 'redis-om';
import { RedisRepository } from '../access/redis-repository';
import { DataProfile } from '../configure';

const docIdPattern = /^[A-Za-z0-9][A-Za-z0-9-]{3,63}$/;

/**
 * Factories
 */

export const organizationDocRepository: Factory<DataProfile, RedisRepository<OrganizationDoc, OrganizationId>> = (
    getUnit,
) => {
    const redisRepositoryBuilder = getUnit('redisRepositoryBuilder');

    return redisRepositoryBuilder<OrganizationDoc, OrganizationId>({
        getDocId: (id) => id.organization.toLowerCase(),

        getId: (docId) => {
            if (!docIdPattern.test(docId)) {
                throw new CoreError('Given doc ID did not match pattern expected for organizations.');
            }

            return { organization: docId };
        },

        mapEntityToDocument: (entity) => ({
            createdAt: entity['createdAt'] as Date,
            deletedAt: entity['deletedAt'] as Date,
            description: entity['description'] as string,
            docId: entity['docId'] as string,
            id: entity['id'] as string,
            isDeleted: entity['isDeleted'] as boolean,
            modifiedAt: entity['modifiedAt'] as Date,
            name: entity['name'] as string,
        }),

        schema: new Schema('organization', {
            createdAt: { type: 'date' },
            deletedAt: { type: 'date' },
            description: { type: 'string' },
            docId: { type: 'string' },
            id: { type: 'string' },
            isDeleted: { type: 'boolean' },
            modifiedAt: { type: 'date' },
            name: { type: 'string' },
        }),
    });
};
