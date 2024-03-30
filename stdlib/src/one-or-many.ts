import { isArray } from './array';

/**
 * Types
 */

export type OneOrMany<T> = T | T[];

/**
 * Functions
 */

export const toMany = <T>(value: OneOrMany<T>): T[] => (isMany(value) ? value : [value]);

/**
 * Type guards
 */

export const isMany = <T>(value: OneOrMany<T>): value is T[] => isArray(value);

export const isOne = <T>(value: OneOrMany<T>): value is T => !isArray(value);
