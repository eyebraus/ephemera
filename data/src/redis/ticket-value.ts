import { TicketValueDoc, TicketValueId } from '@ephemera/model';
import { Factory } from '@ephemera/provide';
import { CoreError } from '@ephemera/stdlib';
import { Schema } from 'redis-om';
import { RedisRepository } from '../access/redis-repository';
import { DataProfile } from '../configure';

const docIdPattern = /^[A-Za-z0-9][A-Za-z0-9-]{3,63}\/\d+\/[A-Za-z0-9][A-Za-z0-9\._-]*$/;

/**
 * Factories
 */

export const ticketValueDocRepository: Factory<DataProfile, RedisRepository<TicketValueDoc, TicketValueId>> = (
    getUnit,
) => {
    const redisRepositoryBuilder = getUnit('redisRepositoryBuilder');

    return redisRepositoryBuilder<TicketValueDoc, TicketValueId>({
        getDocId: (id) => [id.organization.toLowerCase(), id.ticket.toLowerCase(), id.field].join('/'),

        getId: (docId) => {
            if (!docIdPattern.test(docId)) {
                throw new CoreError('Given doc ID did not match pattern expected for ticket values.');
            }

            const [organization, ticket, field] = docId.split('/');

            return { field, organization, ticket };
        },

        mapEntityToDocument: (entity) => ({
            createdAt: entity['createdAt'] as Date,
            deletedAt: entity['deletedAt'] as Date,
            docId: entity['docId'] as string,
            field: entity['field'] as string,
            id: entity['id'] as string,
            isDeleted: entity['isDeleted'] as boolean,
            modifiedAt: entity['modifiedAt'] as Date,
            value: entity['value'] as string,
        }),

        schema: new Schema('organization:template', {
            createdAt: { type: 'date' },
            deletedAt: { type: 'date' },
            docId: { type: 'string' },
            field: { type: 'string' },
            id: { type: 'string' },
            isDeleted: { type: 'boolean' },
            modifiedAt: { type: 'date' },
            value: { type: 'string' },
        }),
    });
};
