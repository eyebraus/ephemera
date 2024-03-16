import { TemplateVersionIdTokenSet } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { CoreError } from '@ephemera/stdlib';
import { Repository, Schema } from 'redis-om';
import { DataProfile } from '../configure';

export interface TemplateVersionModel {
    createdAt: Date;
    entityId: string;
    id: string;
    modifiedAt: Date;
    versionNumber: number;
}

export const getEntityIdForTemplateVersion = (tokens: TemplateVersionIdTokenSet): string =>
    ['template', tokens.template.toLowerCase(), 'version', tokens.versionNumber].join(':');

export const getTokensFromTemplateVersionEntityId = (entityId: string): TemplateVersionIdTokenSet => {
    if (!/^template:[A-Za-z0-9\-]+:version:\d+$/.test(entityId)) {
        throw new CoreError('Given ID is not a valid template version entity ID');
    }

    const [, template, , versionNumber] = entityId.split(':');

    return { template, versionNumber };
};

export const templateVersionSchema = new Schema('template:version', {
    createdAt: { type: 'date' },
    entityId: { type: 'string' },
    id: { type: 'string' },
    modifiedAt: { type: 'date' },
    versionNumber: { type: 'number' },
});

export const templateVersionRepository: Factory<DataProfile, Repository> = (provide) => {
    const redisClient = provide('redisClient');

    return new Repository(templateVersionSchema, redisClient);
};
