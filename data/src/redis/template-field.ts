import { TemplateFieldDoc, TemplateFieldId, TemplateFieldKind } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { CoreError } from '@ephemera/stdlib';
import { Schema } from 'redis-om';
import { RedisRepository } from '../access/redis-repository';
import { DataProfile } from '../configure';

const docIdPattern = /^[A-Za-z0-9][A-Za-z0-9-]{3,63}\/[A-Za-z0-9][A-Za-z0-9-]{3,63}\/[A-Za-z0-9][A-Za-z0-9\._-]*$/;

/**
 * Factories
 */

export const templateFieldDocRepository: Factory<DataProfile, RedisRepository<TemplateFieldDoc, TemplateFieldId>> = (
    getUnit,
) => {
    const redisRepositoryBuilder = getUnit('redisRepositoryBuilder');

    return redisRepositoryBuilder<TemplateFieldDoc, TemplateFieldId>({
        getDocId: (id) => [id.organization.toLowerCase(), id.template.toLowerCase(), id.field].join('/'),

        getId: (docId) => {
            if (!docIdPattern.test(docId)) {
                throw new CoreError('Given doc ID did not match pattern expected for template fields.');
            }

            const [organization, template, field] = docId.split('/');

            return { field, organization, template };
        },

        mapEntityToDocument: (entity) => ({
            allowed: entity['allowed'] ? (entity['allowed'] as string[]) : undefined,
            createdAt: entity['createdAt'] as Date,
            deletedAt: entity['deletedAt'] as Date,
            description: entity['description'] as string,
            docId: entity['docId'] as string,
            id: entity['id'] as string,
            isDeleted: entity['isDeleted'] as boolean,
            kind: entity['kind'] as TemplateFieldKind,
            modifiedAt: entity['modifiedAt'] as Date,
            name: entity['name'] as string,
            required: entity['required'] as boolean,
        }),

        schema: new Schema('organization:template:field', {
            allowed: { type: 'string[]' },
            createdAt: { type: 'date' },
            deletedAt: { type: 'date' },
            description: { type: 'string' },
            docId: { type: 'string' },
            id: { type: 'string' },
            isDeleted: { type: 'boolean' },
            kind: { type: 'string' },
            modifiedAt: { type: 'date' },
            name: { type: 'string' },
            required: { type: 'boolean' },
        }),
    });
};
