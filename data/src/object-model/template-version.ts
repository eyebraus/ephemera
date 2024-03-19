import { TemplateVersionId, TemplateVersionModel } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { CoreError } from '@ephemera/stdlib';
import { Schema } from 'redis-om';
import { RedisRepository } from '../access/redis-repository';
import { DataProfile } from '../configure';

const entityIdPattern = /^[A-Za-z0-9-]{4,64}\/[A-Za-z0-9-]{4,64}$/;

/**
 * Factories
 */

export const templateVersionRepository: Factory<
    DataProfile,
    RedisRepository<TemplateVersionModel, TemplateVersionId>
> = (provide) => {
    const redisRepositoryBuilder = provide('redisRepositoryBuilder');

    return redisRepositoryBuilder<TemplateVersionModel, TemplateVersionId>({
        getEntityId: (id) => [id.template.toLowerCase(), id.versionNumber].join('/'),

        getId: (entityId) => {
            if (!entityIdPattern.test(entityId)) {
                throw new CoreError('Given entity ID did not match pattern expected for template versions.');
            }

            const [template, versionNumber] = entityId.split('/');

            return { template, versionNumber };
        },

        mapEntityToDocument: (entity) => ({
            createdAt: entity['createdAt'] as Date,
            entityId: entity['entityId'] as string,
            id: entity['id'] as string,
            modifiedAt: entity['modifiedAt'] as Date,
            versionNumber: entity['versionNumber'] as number,
        }),

        schema: new Schema('template:version', {
            createdAt: { type: 'date' },
            entityId: { type: 'string' },
            id: { type: 'string' },
            modifiedAt: { type: 'date' },
            versionNumber: { type: 'number' },
        }),
    });
};
