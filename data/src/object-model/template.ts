import { TemplateIdTokenSet } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { CoreError } from '@ephemera/stdlib';
import { Repository, Schema } from 'redis-om';
import { DataProfile } from '../configure';

export interface TemplateModel {
    createdAt: Date;
    description: string;
    entityId: string;
    id: string;
    modifiedAt: Date;
    name: string;
}

export const getEntityIdForTemplate = (tokens: TemplateIdTokenSet): string =>
    ['template', tokens.template.toLowerCase()].join(':');

export const getTokensFromTemplateEntityId = (entityId: string): TemplateIdTokenSet => {
    if (!/^template:[A-Za-z0-9\-]+$/.test(entityId)) {
        throw new CoreError('Given ID is not a valid template entity ID');
    }

    const [, template] = entityId.split(':');

    return { template };
};

export const templateSchema = new Schema('template', {
    createdAt: { type: 'date' },
    description: { type: 'text' },
    entityId: { type: 'string' },
    id: { type: 'string' },
    modifiedAt: { type: 'date' },
    name: { type: 'string' },
});

export const templateRepository: Factory<DataProfile, Repository> = (provide) => {
    const redisClient = provide('redisClient');

    return new Repository(templateSchema, redisClient);
};
