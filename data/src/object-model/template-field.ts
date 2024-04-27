import { TemplateFieldId, TemplateFieldKind, TemplateFieldModel } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { CoreError } from '@ephemera/stdlib';
import { Schema } from 'redis-om';
import { RedisRepository } from '../access/redis-repository';
import { DataProfile } from '../configure';

const entityIdPattern = /^[A-Za-z0-9-]{4,64}\/[A-Za-z0-9-]{4,64}\/[A-Za-z0-9-]{4,64}$/;

/**
 * Factories
 */

export const templateFieldRepository: Factory<DataProfile, RedisRepository<TemplateFieldModel, TemplateFieldId>> = (
    getUnit,
) => {
    const redisRepositoryBuilder = getUnit('redisRepositoryBuilder');

    return redisRepositoryBuilder<TemplateFieldModel, TemplateFieldId>({
        getEntityId: (id) => [id.template.toLowerCase(), id.versionNumber, id.field.toLowerCase()].join('/'),

        getId: (entityId) => {
            if (!entityIdPattern.test(entityId)) {
                throw new CoreError('Given entity ID did not match pattern expected for template fields.');
            }

            const [template, versionNumber, field] = entityId.split('/');

            return { field, template, versionNumber };
        },

        mapEntityToDocument: (entity) => ({
            allowed: entity['allowed'] ? (entity['allowed'] as string[]) : undefined,
            description: entity['description'] as string,
            entityId: entity['entityId'] as string,
            id: entity['id'] as string,
            kind: entity['kind'] as TemplateFieldKind,
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
