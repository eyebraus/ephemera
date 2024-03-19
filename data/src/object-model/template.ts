import { TemplateId, TemplateModel } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { CoreError } from '@ephemera/stdlib';
import { Schema } from 'redis-om';
import { RedisRepository } from '../access/redis-repository';
import { DataProfile } from '../configure';

const entityIdPattern = /^[A-Za-z0-9-]{4,64}$/;

/**
 * Factories
 */

export const templateRepository: Factory<DataProfile, RedisRepository<TemplateModel, TemplateId>> = (provide) => {
    const redisRepositoryBuilder = provide('redisRepositoryBuilder');

    return redisRepositoryBuilder<TemplateModel, TemplateId>({
        getEntityId: (id) => id.template.toLowerCase(),

        getId: (entityId) => {
            if (!entityIdPattern.test(entityId)) {
                throw new CoreError('Given entity ID did not match pattern expected for templates.');
            }

            return { template: entityId };
        },

        mapEntityToDocument: (entity) => ({
            createdAt: entity['createdAt'] as Date,
            description: entity['description'] as string,
            entityId: entity['entityId'] as string,
            id: entity['id'] as string,
            modifiedAt: entity['modifiedAt'] as Date,
            name: entity['name'] as string,
        }),

        schema: new Schema('template', {
            createdAt: { type: 'date' },
            description: { type: 'text' },
            entityId: { type: 'string' },
            id: { type: 'string' },
            modifiedAt: { type: 'date' },
            name: { type: 'string' },
        }),
    });
};
