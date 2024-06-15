import { TicketDoc, TicketId } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { CoreError } from '@ephemera/stdlib';
import { Schema } from 'redis-om';
import { RedisRepository } from '../access/redis-repository';
import { DataProfile } from '../configure';

const docIdPattern = /^[A-Za-z0-9][A-Za-z0-9-]{3,63}\/\d+$/;

/**
 * Factories
 */

export const ticketDocRepository: Factory<DataProfile, RedisRepository<TicketDoc, TicketId>> = (getUnit) => {
    const redisRepositoryBuilder = getUnit('redisRepositoryBuilder');

    return redisRepositoryBuilder<TicketDoc, TicketId>({
        getDocId: (id) => [id.organization.toLowerCase(), id.ticket.toLowerCase()].join('/'),

        getId: (docId) => {
            if (!docIdPattern.test(docId)) {
                throw new CoreError('Given entity ID did not match pattern expected for tickets.');
            }

            const [organization, ticket] = docId.split('/');

            return { organization, ticket };
        },

        mapEntityToDocument: (entity) => ({
            createdAt: entity['createdAt'] as Date,
            deletedAt: entity['deletedAt'] as Date,
            docId: entity['docId'] as string,
            id: entity['id'] as string,
            isDeleted: entity['isDeleted'] as boolean,
            modifiedAt: entity['modifiedAt'] as Date,
            templateDocId: entity['templateDocId'] as string,
            templateId: entity['templateId'] as string,
            templateVersion: entity['templateVersion'] as number,
            title: entity['title'] as string,
            version: entity['version'] as number,
        }),

        schema: new Schema('organization:ticket', {
            createdAt: { type: 'date' },
            deletedAt: { type: 'date' },
            docId: { type: 'string' },
            id: { type: 'string' },
            isDeleted: { type: 'boolean' },
            modifiedAt: { type: 'date' },
            templateDocId: { type: 'string' },
            templateId: { type: 'string' },
            templateVersion: { type: 'number' },
            title: { type: 'string' },
            version: { type: 'number' },
        }),
    });
};
