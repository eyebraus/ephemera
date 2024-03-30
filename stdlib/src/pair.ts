import { isArray } from './array';

/**
 * Types
 */

export type Pair<TKey, TValue> = [TKey, TValue];

/**
 * Initializers
 */

export const Pair = <TKey, TValue>(key: TKey, value: TValue): Pair<TKey, TValue> => [key, value];

/**
 * Functions
 */

export const key = <TKey, TValue>(pair: Pair<TKey, TValue>): TKey => pair[0];

export const value = <TKey, TValue>(pair: Pair<TKey, TValue>): TValue => pair[1];

/**
 * Type guards
 */

export const isPair = <TKey, TValue>(value: unknown): value is Pair<TKey, TValue> =>
    isArray(value) && value.length === 2;
