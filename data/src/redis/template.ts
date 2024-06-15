import { TemplateDoc, TemplateId } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { CoreError } from '@ephemera/stdlib';
import { Schema } from 'redis-om';
import { RedisRepository } from '../access/redis-repository';
import { DataProfile } from '../configure';

const docIdPattern = /^[A-Za-z0-9][A-Za-z0-9-]{3,63}\/[A-Za-z0-9][A-Za-z0-9-]{3,63}$/;

/**
 * Factories
 */

export const templateDocRepository: Factory<DataProfile, RedisRepository<TemplateDoc, TemplateId>> = (getUnit) => {
    const redisRepositoryBuilder = getUnit('redisRepositoryBuilder');

    return redisRepositoryBuilder<TemplateDoc, TemplateId>({
        getDocId: (id) => [id.organization.toLowerCase(), id.template.toLowerCase()].join('/'),

        getId: (docId) => {
            if (!docIdPattern.test(docId)) {
                throw new CoreError('Given doc ID did not match pattern expected for templates.');
            }

            const [organization, template] = docId.split('/');

            return { organization, template };
        },

        mapEntityToDocument: (entity) => ({
            createdAt: entity['createdAt'] as Date,
            deletedAt: entity['deletedAt'] as Date,
            description: entity['description'] as string,
            docId: entity['docId'] as string,
            id: entity['id'] as string,
            isDeleted: entity['isDeleted'] as boolean,
            modifiedAt: entity['modifiedAt'] as Date,
            name: entity['name'] as string,
            version: entity['version'] as number,
        }),

        schema: new Schema('organization:template', {
            createdAt: { type: 'date' },
            deletedAt: { type: 'date' },
            description: { type: 'text' },
            docId: { type: 'string' },
            id: { type: 'string' },
            isDeleted: { type: 'boolean' },
            modifiedAt: { type: 'date' },
            name: { type: 'string' },
            version: { type: 'number' },
        }),
    });
};
