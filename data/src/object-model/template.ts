import { TemplateId } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { Schema } from 'redis-om';
import { RedisRepository } from '../access/redis-repository';
import { DataProfile } from '../configure';

/**
 * Types
 */

export interface TemplateModel {
    createdAt: Date;
    description: string;
    entityId: string;
    id: string;
    modifiedAt: Date;
    name: string;
}

/**
 * Factories
 */

export const templateRepository: Factory<DataProfile, RedisRepository<TemplateModel, TemplateId>> = (provide) => {
    const redisRepositoryBuilder = provide('redisRepositoryBuilder');

    return redisRepositoryBuilder<TemplateModel, TemplateId>({
        getEntityId: (id) => ['template', id.template.toLowerCase()].join(':'),

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
