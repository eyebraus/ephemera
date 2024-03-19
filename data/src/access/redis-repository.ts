import { Factory } from '@ephemera/provide';
import { Empty, If } from '@ephemera/stdlib';
import { Entity, Repository, Schema, Search, WhereField } from 'redis-om';
import { DataProfile } from '../configure';

interface RedisDocument {
    entityId: string;
}

interface RedisRepositoryBuilderConfiguration<
    TDocument extends RedisDocument,
    TId extends NonNullable<unknown> = string,
> {
    getEntityId: (id: TId) => string;
    getId: (entityId: string) => TId;
    mapEntityToDocument: (entity: Entity) => TDocument;
    schema: Schema;
}

/**
 * A client for interfacing with a RedisStack instance via redis-om.
 */
export interface RedisRepository<TDocument extends RedisDocument, TId extends NonNullable<unknown> = string> {
    /**
     * Creates an index in Redis for use by search. Does not create a new index if the index hasn't changed. Requires
     * that RediSearch and RedisJSON are installed on your instance of Redis.
     */
    createIndex: () => Promise<void>;

    /**
     * Removes an existing index from Redis. Use this method if you want to swap out your index because the schema of
     * your document has changed. Requires that RediSearch and RedisJSON are installed on your instance of Redis.
     */
    dropIndex: () => Promise<void>;

    /**
     * Set the time to live of the document. If the document is not found, does nothing.
     * @param id The ID of the document to set and expiration for.
     * @param ttlInSeconds The time to live in seconds.
     */
    expire: (id: TId, ttlInSeconds: number) => Promise<void>;

    /**
     * Use Date object to set the document's time to live. If the document is not found, does nothing.
     * @param id The ID of the document to set an expiration date for.
     * @param expirationDate The time the data should expire.
     */
    expireAt: (id: TId, expirationDate: Date) => Promise<void>;

    /**
     * Read and return a document from Redis for the given id. If the document is not found, returns undefined.
     * @param id The ID of the document you seek.
     * @returns The matching document, or undefined if no document matches.
     */
    fetch: (id: TId) => Promise<TDocument | undefined>;

    /**
     * Translate a {@link TId} into the entity ID value that will be used in Redis.
     * @param id ID.
     * @returns Entity ID.
     */
    getEntityId: (id: TId) => string;

    /**
     * Translate an entity ID value from Redis into a {@link TId}.
     * @param entityId Entity ID.
     * @returns ID.
     */
    getId: (entityId: string) => TId;

    /**
     * Checks whether a document with the given ID exists.
     * @param id The ID of the document you seek.
     * @returns True if document exists in the store, false otherwise.
     */
    has: (id: TId) => Promise<boolean>;

    /**
     * Remove a document from Redis for the given ID. If the document is not found, does nothing.
     * @param id The ID of the document you wish to delete.
     */
    remove: (id: TId) => Promise<void>;

    /**
     * Insert or update a document to Redis with a given ID.
     * @param id The ID of the document to save.
     * @param doc The document to save, without its entity ID.
     * @returns A copy of the provided document with its entityId populated.
     * @remarks If entity ID is provided in document, it will be ignored in favor of the entity ID value generated by
     * the repository from {@link id}.
     */
    save: (id: TId, doc: Omit<TDocument, 'entityId'>) => Promise<TDocument>;

    /**
     * Kicks off the process of building a query. Requires that RediSearch (and optionally RedisJSON) be installed on
     * your instance of Redis.
     * @returns A {@link SearchBuilder<TDocument>} instance.
     */
    search: () => SearchBuilder<TDocument, TId>;
}

/**
 * A function allowing consumers to build a {@link RedisRepository} from a configuration.
 */
export type RedisRepositoryBuilder = <TDocument extends RedisDocument, TId extends NonNullable<unknown>>(
    configuration: RedisRepositoryBuilderConfiguration<TDocument, TId>,
) => RedisRepository<TDocument, TId>;

/**
 * A fluent specification allowing consumers to build queries to execute over the Redis store.
 */
export interface SearchBuilder<TDocument extends RedisDocument, TId extends NonNullable<unknown>> {
    /**
     * Gets all the documents that match this query. This method makes multiple calls to Redis until all the documents
     * are returned.
     * @returns An array of all documents matching the query.
     */
    all: () => Promise<TDocument[]>;

    /**
     * Gets all IDs of documents that match this query. This method makes multiple calls to Redis until all the IDs are
     * returned.
     * @returns An array of IDs of all documents matching the query.
     */
    allIds: () => Promise<TId[]>;

    /**
     * Connects a sub-clause to the query under construction using the logical AND operator.
     * @param field The name of the field to filter on in sub-clause.
     * @returns A fluent specification object allowing consumer to build a WHERE clause.
     */
    and: (field: keyof TDocument) => WhereClauseBuilder<TDocument, TId, typeof field>;

    /**
     * Gets the number of documents that match this query.
     * @returns The number of documents matching the query.
     */
    count: () => Promise<number>;

    /**
     * Gets the first document matching this query, if any documents do.
     * @returns The first document to match the query, or undefined if no documents match.
     */
    first: () => Promise<TDocument | undefined>;

    /**
     * Gets the document which has the largest value value for the given field in this query, if any documents match.
     * @param field The name of the field whose value the result will be maximized over.
     * @returns The document maximizing the value of {@link field}, or undefined if no documents match the query.
     */
    max: (field: keyof TDocument) => Promise<TDocument | undefined>;

    /**
     * Gets the document which has the smallest value value for the given field in this query, if any documents match.
     * @param field The name of the field whose value the result will be minimized over.
     * @returns The document minimizing the value of {@link field}, or undefined if no documents match the query.
     */
    min: (field: keyof TDocument) => Promise<TDocument | undefined>;

    /**
     * Connects a sub-clause to the query under construction using the logical OR operator.
     * @param field The name of the field to filter on in sub-clause.
     * @returns A fluent specification object allowing consumer to build a WHERE clause.
     */
    or: (field: keyof TDocument) => WhereClauseBuilder<TDocument, TId, typeof field>;

    /**
     * Gets a page of documents matching this query.
     * @param offset The number of documents to skip. Defines the "start point" of the page.
     * @param count The number of documents to return in this page.
     * @returns An array of up to {@link count} documents matching the query.
     */
    page: (offset: number, count: number) => Promise<TDocument[]>;

    /**
     * Gets a page of IDs of documents matching this query.
     * @param offset The number of documents to skip. Defines the "start point" of the page.
     * @param count The number of documents to return in this page.
     * @returns An array of up to {@link count} IDs of documents matching the query.
     */
    pageOfIds: (offset: number, count: number) => Promise<TId[]>;

    /**
     * Applies ascending sort order to the query under construction.
     * @param field The name of the field over which to sort documents.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    sortAscending: (field: keyof TDocument) => SearchBuilder<TDocument, TId>;

    /**
     * Applies sorting to the query under construction.
     * @param field The name of the field over which to sort documents.
     * @param descending Whether descending order should be used. If not given, defaults to false.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    sortBy: (field: keyof TDocument, descending?: false) => SearchBuilder<TDocument, TId>;

    /**
     * Applies descending sort order to the query under construction.
     * @param field The name of the field over which to sort documents.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    sortDescending: (field: keyof TDocument) => SearchBuilder<TDocument, TId>;

    /**
     * Starts a WHERE clause matching a particular field. If multiple calls are chained together, they are treated as
     * logical ANDs.
     * @param field The name of the field to filter on.
     * @returns A fluent specification object allowing consumer to build a WHERE clause.
     */
    where: (field: keyof TDocument) => WhereClauseBuilder<TDocument, TId, typeof field>;
}

/**
 * A fluent specification allowing consumers to add WHERE clauses to their queries.
 */
export type WhereClauseBuilder<
    TDocument extends RedisDocument,
    TId extends NonNullable<unknown>,
    TField extends keyof TDocument,
> = WhereClauseOnAnyBuilder<TDocument, TId, TField> &
    If<TDocument[TField], boolean, WhereClauseOnBooleanBuilder<TDocument, TId>, Empty> &
    If<TDocument[TField], Date, WhereClauseOnDateBuilder<TDocument, TId>, Empty> &
    If<TDocument[TField], number, WhereClauseOnNumberBuilder<TDocument, TId>, Empty> &
    If<TDocument[TField], string, WhereClauseOnStringBuilder<TDocument, TId>, Empty>;

type WhereClauseAcrossAllTypesBuilder<
    TDocument extends RedisDocument,
    TId extends NonNullable<unknown>,
    TField extends keyof TDocument,
> = WhereClauseOnAnyBuilder<TDocument, TId, TField> &
    WhereClauseOnBooleanBuilder<TDocument, TId> &
    WhereClauseOnDateBuilder<TDocument, TId> &
    WhereClauseOnNumberBuilder<TDocument, TId> &
    WhereClauseOnStringBuilder<TDocument, TId>;

interface WhereClauseOnAnyBuilder<
    TDocument extends RedisDocument,
    TId extends NonNullable<unknown>,
    TField extends keyof TDocument,
> {
    /**
     * Adds an equals comparison to the WHERE clause.
     * @param value The value to which the field's value should be equal.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    equals: (value: TDocument[TField]) => SearchBuilder<TDocument, TId>;
}

interface WhereClauseOnBooleanBuilder<TDocument extends RedisDocument, TId extends NonNullable<unknown>> {
    /**
     * Adds a `false` check to the WHERE clause.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    false: () => SearchBuilder<TDocument, TId>;

    /**
     * Adds a `true` check to the WHERE clause.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    true: () => SearchBuilder<TDocument, TId>;
}

interface WhereClauseOnDateBuilder<TDocument extends RedisDocument, TId extends NonNullable<unknown>> {
    /**
     * Adds a comparison to the WHERE clause specifying that the field's value should occur after a given {@link Date}.
     * @param value The value which the field's value should be after.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    after: (value: Date) => SearchBuilder<TDocument, TId>;

    /**
     * Adds a comparison to the WHERE clause specifying that the field's value should occur before a given {@link Date}.
     * @param value The value which the field's value should be before.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    before: (value: Date) => SearchBuilder<TDocument, TId>;

    /**
     * Adds a comparison to the WHERE clause specifying that the field's value should occur on or between two
     * {@link Date}s.
     * @param lower The value which the field's value should be on or after.
     * @param upper The value which the field's value should be on or before.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    betweenDates: (lower: Date, upper: Date) => SearchBuilder<TDocument, TId>;

    /**
     * Adds a comparison to the WHERE clause specifying that the field's value should occur on or after a given
     * {@link Date}.
     * @param value The value which the field's value should be on or after.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    onOrAfter: (value: Date) => SearchBuilder<TDocument, TId>;

    /**
     * Adds a comparison to the WHERE clause specifying that the field's value should occur on or before a given
     * {@link Date}.
     * @param value The value which the field's value should be on or before.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    onOrBefore: (value: Date) => SearchBuilder<TDocument, TId>;
}

interface WhereClauseOnNumberBuilder<TDocument extends RedisDocument, TId extends NonNullable<unknown>> {
    /**
     * Adds a comparison to the WHERE clause specifying that the field's value should be inclusively between two
     * numbers.
     * @param lower The value which the field's value should be greater than or equal to.
     * @param upper The value which the field's value should be less than or equal to.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    between: (lower: number, upper: number) => SearchBuilder<TDocument, TId>;

    /**
     * Adds a comparison to the WHERE clause specifying that the field's value should be greater than a number.
     * @param value The value which the field's value should be greater than.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    greaterThan: (value: number) => SearchBuilder<TDocument, TId>;

    /**
     * Adds a comparison to the WHERE clause specifying that the field's value should be greater than or equal to a
     * number.
     * @param value The value which the field's value should be greater than or equal to.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    greaterThanOrEqualTo: (value: number) => SearchBuilder<TDocument, TId>;

    /**
     * Adds a comparison to the WHERE clause specifying that the field's value should be less than a number.
     * @param value The value which the field's value should be less than.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    lessThan: (value: number) => SearchBuilder<TDocument, TId>;

    /**
     * Adds a comparison to the WHERE clause specifying that the field's value should be less than or equal to a number.
     * @param value The value which the field's value should be less than or equal to.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    lessThanOrEqualTo: (value: number) => SearchBuilder<TDocument, TId>;
}

interface WhereClauseOnStringBuilder<TDocument extends RedisDocument, TId extends NonNullable<unknown>> {
    /**
     * Adds a comparison to the WHERE clause specifying that the field's value should be equal to one of the provided
     * strings.
     * @param value An array of values which the field's value may match.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    contains: (...values: string[]) => SearchBuilder<TDocument, TId>;

    /**
     * Adds a comparison to the WHERE clause specifying that the field's value should exactly match a given string in
     * the context of a full-text search comparison over the value.
     * @param value A word or phrase which the field's value should match at least once.
     * @returns A fluent specification allowing the consumer to continue building the query under construction.
     */
    matches: (value: string) => SearchBuilder<TDocument, TId>;
}

/**
 * Initializers
 */

const RedisRepository = <TDocument extends RedisDocument, TId extends NonNullable<unknown> = string>(
    repository: Repository,
    configuration: Omit<RedisRepositoryBuilderConfiguration<TDocument, TId>, 'schema'>,
): RedisRepository<TDocument, TId> => {
    const { getEntityId, getId, mapEntityToDocument } = configuration;

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

            // If the entity doesn't exist, redis-om returns an empty object. We want to return undefined instead.
            if (Object.entries(entity).length < 1) {
                return undefined;
            }

            return mapEntityToDocument(entity);
        },

        getEntityId,
        getId,

        has: async (id) => {
            const doc = await redisRepository.fetch(id);
            return !!doc;
        },

        remove: async (id) => {
            const entityId = getEntityId(id);
            await repository.remove(entityId);
        },

        save: async (id, doc) => {
            const entityId = getEntityId(id);
            const entity = await repository.save(entityId, { ...doc, entityId });
            return mapEntityToDocument(entity);
        },

        search: () => SearchBuilder(repository.search(), getId, mapEntityToDocument),
    };

    return redisRepository;
};

const SearchBuilder = <TDocument extends RedisDocument, TId extends NonNullable<unknown>>(
    search: Search,
    getId: (entityId: string) => TId,
    mapEntityToDocument: (entity: Entity) => TDocument,
): SearchBuilder<TDocument, TId> => ({
    all: async () => {
        const entities = await search.all();
        return entities.map(mapEntityToDocument);
    },

    allIds: async () => {
        const entities = await search.all();

        return entities.map((entity) => {
            const { entityId } = mapEntityToDocument(entity);
            return getId(entityId);
        });
    },

    and: (field) => {
        const where = createWhereClause(search.and(field as string), getId, mapEntityToDocument);
        return where as WhereClauseBuilder<TDocument, TId, keyof TDocument>;
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
        const where = createWhereClause(search.or(field as string), getId, mapEntityToDocument);
        return where as WhereClauseBuilder<TDocument, TId, keyof TDocument>;
    },

    page: async (offset, count) => {
        const entities = await search.page(offset, count);
        return entities.map(mapEntityToDocument);
    },

    pageOfIds: async (offset, count) => {
        const entities = await search.page(offset, count);

        return entities.map((entity) => {
            const { entityId } = mapEntityToDocument(entity);
            return getId(entityId);
        });
    },

    sortAscending: (field) => {
        const sortedSearch = search.sortAscending(field as string);
        return SearchBuilder(sortedSearch as Search, getId, mapEntityToDocument);
    },

    sortBy: (field, descending) => {
        const sortedSearch = search.sortBy(field as string, descending ? 'DESC' : undefined);
        return SearchBuilder(sortedSearch as Search, getId, mapEntityToDocument);
    },

    sortDescending: (field) => {
        const sortedSearch = search.sortDescending(field as string);
        return SearchBuilder(sortedSearch as Search, getId, mapEntityToDocument);
    },

    where: (field) => {
        const where = createWhereClause(search.where(field as string), getId, mapEntityToDocument);
        return where as WhereClauseBuilder<TDocument, TId, keyof TDocument>;
    },
});

/**
 * Helper functions
 */

const createWhereClause = <
    TDocument extends RedisDocument,
    TId extends NonNullable<unknown>,
    TField extends keyof TDocument,
>(
    where: WhereField,
    getId: (entityId: string) => TId,
    mapEntityToDocument: (entity: Entity) => TDocument,
): WhereClauseAcrossAllTypesBuilder<TDocument, TId, TField> => ({
    after: (value) => SearchBuilder(where.after(value), getId, mapEntityToDocument),
    before: (value) => SearchBuilder(where.before(value), getId, mapEntityToDocument),
    between: (lower, upper) => SearchBuilder(where.between(lower, upper), getId, mapEntityToDocument),
    betweenDates: (lower, upper) => SearchBuilder(where.between(lower, upper), getId, mapEntityToDocument),
    contains: (...values) => SearchBuilder(where.containsOneOf(...values), getId, mapEntityToDocument),
    equals: (value) =>
        SearchBuilder(where.equals(value as boolean | Date | number | string), getId, mapEntityToDocument),
    false: () => SearchBuilder(where.false(), getId, mapEntityToDocument),
    greaterThan: (value) => SearchBuilder(where.greaterThan(value), getId, mapEntityToDocument),
    greaterThanOrEqualTo: (value) => SearchBuilder(where.greaterThanOrEqualTo(value), getId, mapEntityToDocument),
    lessThan: (value) => SearchBuilder(where.lessThan(value), getId, mapEntityToDocument),
    lessThanOrEqualTo: (value) => SearchBuilder(where.lessThanOrEqualTo(value), getId, mapEntityToDocument),
    matches: (value) => SearchBuilder(where.matchesExactly(value), getId, mapEntityToDocument),
    onOrAfter: (value) => SearchBuilder(where.onOrAfter(value), getId, mapEntityToDocument),
    onOrBefore: (value) => SearchBuilder(where.onOrBefore(value), getId, mapEntityToDocument),
    true: () => SearchBuilder(where.true(), getId, mapEntityToDocument),
});

/**
 * Factories
 */

export const redisRepositoryBuilder: Factory<DataProfile, RedisRepositoryBuilder> = (provide) => {
    const redisClient = provide('redisClient');
    redisClient.connect();

    return (configuration) => {
        const { getEntityId, getId, mapEntityToDocument, schema } = configuration;
        const repository = new Repository(schema, redisClient);

        return RedisRepository(repository, { getEntityId, getId, mapEntityToDocument });
    };
};
