import { Fault, IfVoid, Result } from '@ephemera/stdlib';

export type AddEntityOperation<
    TEntity extends NonNullable<unknown>,
    TProperties extends NonNullable<unknown>,
    TId = void,
    TErrorCode extends string = string,
> = IfVoid<
    TId,
    {
        add: (properties: TProperties) => Promise<Result<TEntity, Fault<TErrorCode>>>;
    },
    {
        add: (id: TId, properties: TProperties) => Promise<Result<TEntity, Fault<TErrorCode>>>;
    }
>;

export type GetEntityOperation<
    TId extends NonNullable<unknown>,
    TEntity extends NonNullable<unknown>,
    TErrorCode extends string = string,
> = {
    get: (id: TId) => Promise<Result<TEntity, Fault<TErrorCode>>>;
};

export type ListEntitiesByOperation<
    TId extends NonNullable<unknown>,
    TEntity extends NonNullable<unknown>,
    TErrorCode extends string = string,
> = {
    listBy: (id: TId, skip: number, count: number) => Promise<Result<TEntity[], Fault<TErrorCode>>>;
};

export type ListEntitiesOperation<TEntity extends NonNullable<unknown>, TErrorCode extends string = string> = {
    list: (skip: number, count: number) => Promise<Result<TEntity[], Fault<TErrorCode>>>;
};

export type RemoveEntityOperation<TId extends NonNullable<unknown>, TErrorCode extends string = string> = {
    remove: (id: TId) => Promise<Result<void, Fault<TErrorCode>>>;
};

export type SetEntityOperation<
    TId extends NonNullable<unknown>,
    TEntity extends NonNullable<unknown>,
    TProperties extends NonNullable<unknown>,
    TErrorCode extends string = string,
> = {
    set: (id: TId, properties: TProperties) => Promise<Result<TEntity, Fault<TErrorCode>>>;
};

export type UpdateEntityOperation<
    TId extends NonNullable<unknown>,
    TEntity extends NonNullable<unknown>,
    TProperties extends NonNullable<unknown>,
    TErrorCode extends string = string,
> = {
    update: (id: TId, properties: Partial<TProperties>) => Promise<Result<TEntity, Fault<TErrorCode>>>;
};
