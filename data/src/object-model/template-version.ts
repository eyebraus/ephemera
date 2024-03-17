import { TemplateVersionId } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { Schema } from 'redis-om';
import { RedisRepository } from '../access/redis-repository';
import { DataProfile } from '../configure';

/**
 * Types
 */

export interface TemplateVersionModel {
    createdAt: Date;
    entityId: string;
    id: string;
    modifiedAt: Date;
    versionNumber: number;
}

/**
 * Factories
 */

export const templateVersionRepository: Factory<
    DataProfile,
    RedisRepository<TemplateVersionModel, TemplateVersionId>
> = (provide) => {
    const redisRepositoryBuilder = provide('redisRepositoryBuilder');

    return redisRepositoryBuilder<TemplateVersionModel, TemplateVersionId>({
        getEntityId: (id) => ['template', id.template.toLowerCase(), 'version', id.versionNumber].join(':'),

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
