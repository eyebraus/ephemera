import { TemplateFieldIdTokenSet } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { CoreError } from '@ephemera/stdlib';
import { Repository, Schema } from 'redis-om';
import { DataProfile } from '../configure';

export interface TemplateFieldModel {
    allowed?: string[];
    description: string;
    entityId: string;
    id: string;
    kind: string;
    name: string;
    required: boolean;
}

export const getEntityIdForTemplateField = (tokens: TemplateFieldIdTokenSet): string =>
    [
        'template',
        tokens.template.toLowerCase(),
        'version',
        tokens.versionNumber,
        'field',
        tokens.field.toLowerCase(),
    ].join(':');

export const getTokensFromTemplateFieldEntityId = (entityId: string): TemplateFieldIdTokenSet => {
    if (!/^template:[A-Za-z0-9\-]+:version:\d+:field:[A-Za-z0-9\-]+$/.test(entityId)) {
        throw new CoreError('Given ID is not a valid template field entity ID');
    }

    const [, template, , versionNumber, , field] = entityId.split(':');

    return { field, template, versionNumber };
};

export const templateFieldSchema = new Schema('template:version:field', {
    allowed: { type: 'string[]' },
    description: { type: 'string' },
    entityId: { type: 'string' },
    id: { type: 'string' },
    kind: { type: 'string' },
    name: { type: 'string' },
    required: { type: 'boolean' },
});

export const templateFieldRepository: Factory<DataProfile, Repository> = (provide) => {
    const redisClient = provide('redisClient');

    return new Repository(templateFieldSchema, redisClient);
};
