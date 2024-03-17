import { Factory } from '@ephemera/provide';
import { Empty, If } from '@ephemera/stdlib';
import { Entity, Repository, Schema, Search, WhereField } from 'redis-om';
import { DataProfile } from '../configure';

/**
 * Types
 */

interface RedisDocument {
    entityId: string;
}

interface RedisRepositoryBuilderConfiguration<
    TDocument extends RedisDocument,
    TId extends NonNullable<unknown> = string,
> {
    getEntityId?: (id: TId) => string;
    mapEntityToDocument: (entity: Entity) => TDocument;
    schema: Schema;
}

export interface RedisRepository<TDocument extends RedisDocument, TId extends NonNullable<unknown> = string> {
    createIndex: () => Promise<void>;
    dropIndex: () => Promise<void>;
    expire: (id: TId, ttlInSeconds: number) => Promise<void>;
    expireAt: (id: TId, expirationDate: Date) => Promise<void>;
    fetch: (id: TId) => Promise<TDocument>;
    getEntityId: (id: TId) => string;
    remove: (id: TId) => Promise<void>;
    save: (id: TId, doc: Omit<TDocument, 'entityId'>) => Promise<TDocument>;
    search: () => SearchBuilder<TDocument>;
}

export type RedisRepositoryBuilder = <TDocument extends RedisDocument, TId extends NonNullable<unknown>>(
    configuration: RedisRepositoryBuilderConfiguration<TDocument, TId>,
) => RedisRepository<TDocument, TId>;

export interface SearchBuilder<TDocument extends RedisDocument> {
    all: () => Promise<TDocument[]>;
    and: (field: keyof TDocument) => WhereClauseBuilder<TDocument, typeof field>;
    count: () => Promise<number>;
    first: () => Promise<TDocument | undefined>;
    max: (field: keyof TDocument) => Promise<TDocument | undefined>;
    min: (field: keyof TDocument) => Promise<TDocument | undefined>;
    or: (field: keyof TDocument) => WhereClauseBuilder<TDocument, typeof field>;
    page: (offset: number, count: number) => Promise<TDocument[]>;
    sortAscending: (field: keyof TDocument) => SearchBuilder<TDocument>;
    sortBy: (field: keyof TDocument, descending?: false) => SearchBuilder<TDocument>;
    sortDescending: (field: keyof TDocument) => SearchBuilder<TDocument>;
    where: (field: keyof TDocument) => WhereClauseBuilder<TDocument, typeof field>;
}

export type WhereClauseBuilder<
    TDocument extends RedisDocument,
    TField extends keyof TDocument,
> = WhereClauseOnAnyBuilder<TDocument, TField> &
    If<TDocument[TField], boolean, WhereClauseOnBooleanBuilder<TDocument>, Empty> &
    If<TDocument[TField], Date, WhereClauseOnDateBuilder<TDocument>, Empty> &
    If<TDocument[TField], number, WhereClauseOnNumberBuilder<TDocument>, Empty> &
    If<TDocument[TField], string, WhereClauseOnStringBuilder<TDocument>, Empty>;

type WhereClauseAcrossAllTypesBuilder<
    TDocument extends RedisDocument,
    TField extends keyof TDocument,
> = WhereClauseOnAnyBuilder<TDocument, TField> &
    WhereClauseOnBooleanBuilder<TDocument> &
    WhereClauseOnDateBuilder<TDocument> &
    WhereClauseOnNumberBuilder<TDocument> &
    WhereClauseOnStringBuilder<TDocument>;

interface WhereClauseOnAnyBuilder<TDocument extends RedisDocument, TField extends keyof TDocument> {
    equals: (value: TDocument[TField]) => SearchBuilder<TDocument>;
}

interface WhereClauseOnBooleanBuilder<TDocument extends RedisDocument> {
    false: () => SearchBuilder<TDocument>;
    true: () => SearchBuilder<TDocument>;
}

interface WhereClauseOnDateBuilder<TDocument extends RedisDocument> {
    after: (value: Date) => SearchBuilder<TDocument>;
    before: (value: Date) => SearchBuilder<TDocument>;
    betweenDates: (lower: Date, upper: Date) => SearchBuilder<TDocument>;
    onOrAfter: (value: Date) => SearchBuilder<TDocument>;
    onOrBefore: (value: Date) => SearchBuilder<TDocument>;
}

interface WhereClauseOnNumberBuilder<TDocument extends RedisDocument> {
    between: (lower: number, upper: number) => SearchBuilder<TDocument>;
    greaterThan: (value: number) => SearchBuilder<TDocument>;
    greaterThanOrEqualTo: (value: number) => SearchBuilder<TDocument>;
    lessThan: (value: number) => SearchBuilder<TDocument>;
    lessThanOrEqualTo: (value: number) => SearchBuilder<TDocument>;
}

interface WhereClauseOnStringBuilder<TDocument extends RedisDocument> {
    contains: (...values: string[]) => SearchBuilder<TDocument>;
    matches: (value: string) => SearchBuilder<TDocument>;
}

/**
 * Initializers
 */

const RedisRepository = <TDocument extends RedisDocument, TId extends NonNullable<unknown> = string>(
    repository: Repository,
    configuration: Omit<RedisRepositoryBuilderConfiguration<TDocument, TId>, 'schema'>,
): RedisRepository<TDocument, TId> => {
    const { getEntityId: providedGetEntityId, mapEntityToDocument } = configuration;

    const getEntityId = (id: TId) => (providedGetEntityId ? providedGetEntityId(id) : `${id}`);

    const redisRepository: RedisRepository<TDocument, TId> = {
        createIndex: () => repository.createIndex(),
        dropIndex: () => repository.dropIndex(),

        expire: async (id, ttlInSeconds) => {
            const entityId = getEntityId(id);
            await repository.expire(entityId, ttlInSeconds);
        },

        expireAt: async (id, expirationDate) => {
            const entityId = getEntityId(id);
            await repository.expireAt(entityId, expirationDate);
        },

        fetch: async (id) => {
            const entityId = getEntityId(id);
            const entity = await repository.fetch(entityId);
            return mapEntityToDocument(entity);
        },

        getEntityId,

        remove: async (id) => {
            const entityId = getEntityId(id);
            await repository.remove(entityId);
        },

        save: async (id, doc) => {
            const entityId = getEntityId(id);
            const entity = await repository.save(entityId, { ...doc, entityId });
            return mapEntityToDocument(entity);
        },

        search: () => SearchBuilder(repository.search(), mapEntityToDocument),
    };

    return redisRepository;
};

const SearchBuilder = <TDocument extends RedisDocument>(
    search: Search,
    mapEntityToDocument: (entity: Entity) => TDocument,
): SearchBuilder<TDocument> => ({
    all: async () => {
        const entities = await search.all();
        return entities.map(mapEntityToDocument);
    },

    and: (field) => {
        const where = createWhereClause(search.and(field as string), mapEntityToDocument);
        return where as WhereClauseBuilder<TDocument, keyof TDocument>;
    },

    count: async () => await search.count(),

    first: async () => {
        const entity = await search.first();
        return entity ? mapEntityToDocument(entity) : undefined;
    },

    max: async (field) => {
        const entity = await search.max(field as string);
        return entity ? mapEntityToDocument(entity) : undefined;
    },

    min: async (field) => {
        const entity = await search.min(field as string);
        return entity ? mapEntityToDocument(entity) : undefined;
    },

    or: (field) => {
        const where = createWhereClause(search.or(field as string), mapEntityToDocument);
        return where as WhereClauseBuilder<TDocument, keyof TDocument>;
    },

    page: async (offset, count) => {
        const entities = await search.page(offset, count);
        return entities.map(mapEntityToDocument);
    },

    sortAscending: (field) => {
        const sortedSearch = search.sortAscending(field as string);
        return SearchBuilder(sortedSearch as Search, mapEntityToDocument);
    },

    sortBy: (field, descending) => {
        const sortedSearch = search.sortBy(field as string, descending ? 'DESC' : undefined);
        return SearchBuilder(sortedSearch as Search, mapEntityToDocument);
    },

    sortDescending: (field) => {
        const sortedSearch = search.sortDescending(field as string);
        return SearchBuilder(sortedSearch as Search, mapEntityToDocument);
    },

    where: (field) => {
        const where = createWhereClause(search.where(field as string), mapEntityToDocument);
        return where as WhereClauseBuilder<TDocument, keyof TDocument>;
    },
});

/**
 * Helper functions
 */

const createWhereClause = <TDocument extends RedisDocument, TField extends keyof TDocument>(
    where: WhereField,
    mapEntityToDocument: (entity: Entity) => TDocument,
): WhereClauseAcrossAllTypesBuilder<TDocument, TField> => ({
    after: (value) => SearchBuilder(where.after(value), mapEntityToDocument),
    before: (value) => SearchBuilder(where.before(value), mapEntityToDocument),
    between: (lower, upper) => SearchBuilder(where.between(lower, upper), mapEntityToDocument),
    betweenDates: (lower, upper) => SearchBuilder(where.between(lower, upper), mapEntityToDocument),
    contains: (...values) => SearchBuilder(where.containsOneOf(...values), mapEntityToDocument),
    equals: (value) => SearchBuilder(where.equals(value as boolean | Date | number | string), mapEntityToDocument),
    false: () => SearchBuilder(where.false(), mapEntityToDocument),
    greaterThan: (value) => SearchBuilder(where.greaterThan(value), mapEntityToDocument),
    greaterThanOrEqualTo: (value) => SearchBuilder(where.greaterThanOrEqualTo(value), mapEntityToDocument),
    lessThan: (value) => SearchBuilder(where.lessThan(value), mapEntityToDocument),
    lessThanOrEqualTo: (value) => SearchBuilder(where.lessThanOrEqualTo(value), mapEntityToDocument),
    matches: (value) => SearchBuilder(where.matchesExactly(value), mapEntityToDocument),
    onOrAfter: (value) => SearchBuilder(where.onOrAfter(value), mapEntityToDocument),
    onOrBefore: (value) => SearchBuilder(where.onOrBefore(value), mapEntityToDocument),
    true: () => SearchBuilder(where.true(), mapEntityToDocument),
});

/**
 * Factories
 */

export const redisRepositoryBuilder: Factory<DataProfile, RedisRepositoryBuilder> = (provide) => {
    const redisClient = provide('redisClient');
    redisClient.connect();

    return (configuration) => {
        const { getEntityId, mapEntityToDocument, schema } = configuration;
        const repository = new Repository(schema, redisClient);

        return RedisRepository(repository, { getEntityId, mapEntityToDocument });
    };
};
