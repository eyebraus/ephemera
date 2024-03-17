import { TemplateFieldId } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { Schema } from 'redis-om';
import { RedisRepository } from '../access/redis-repository';
import { DataProfile } from '../configure';

/**
 * Types
 */

export interface TemplateFieldModel {
    allowed?: string[];
    description: string;
    entityId: string;
    id: string;
    kind: string;
    name: string;
    required: boolean;
}

/**
 * Factories
 */

export const templateFieldRepository: Factory<DataProfile, RedisRepository<TemplateFieldModel, TemplateFieldId>> = (
    provide,
) => {
    const redisRepositoryBuilder = provide('redisRepositoryBuilder');

    return redisRepositoryBuilder<TemplateFieldModel, TemplateFieldId>({
        getEntityId: (id) =>
            ['template', id.template.toLowerCase(), 'version', id.versionNumber, 'field', id.field.toLowerCase()].join(
                ':',
            ),

        mapEntityToDocument: (entity) => ({
            allowed: entity['allowed'] ? (entity['allowed'] as string[]) : undefined,
            description: entity['description'] as string,
            entityId: entity['entityId'] as string,
            id: entity['id'] as string,
            kind: entity['kind'] as string,
            name: entity['name'] as string,
            required: entity['required'] as boolean,
        }),

        schema: new Schema('template:version:field', {
            allowed: { type: 'string[]' },
            description: { type: 'string' },
            entityId: { type: 'string' },
            id: { type: 'string' },
            kind: { type: 'string' },
            name: { type: 'string' },
            required: { type: 'boolean' },
        }),
    });
};
