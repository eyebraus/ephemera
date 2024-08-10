import { isArray } from './array';
import { Defined } from './defined';

/**
 * A value that is an array that contains more than one defined value.
 */
export type Many<T extends Defined> = [T, T, ...T[]];

/**
 * A value that is an empty array.
 */
export type None = [];

/**
 * A value that could be zero, one, or many defined values.
 */
export type NoneOneOrMany<T extends Defined> = Many<T> | None | One<T>;

/**
 * Creates a {@link NoneOneOrMany}.
 * @param value Zero or more defined values
 * @returns A {@link NoneOneOrMany} built from the given values.
 */
export const NoneOneOrMany = <T extends Defined>(...values: T[]): NoneOneOrMany<T> => {
    if (values.length < 1) {
        return [];
    }

    if (values.length === 1) {
        return values[0];
    }

    const [first, second, ...rest] = values;

    return [first, second, ...rest];
};

/**
 * A value that could be zero or one defined values.
 */
export type NoneOrOne<T extends Defined> = None | One<T>;

/**
 * Creates a {@link NoneOrOne}.
 * @param value A value.
 * @returns A {@link NoneOrOne} built from the given value.
 */
export const NoneOrOne = <T extends Defined>(value?: T): NoneOrOne<T> => value ?? [];

/**
 * A value that is either a single defined value or an array containing a single defined value.
 */
export type One<T extends Defined> = T | [T];

/**
 * A value that could be one or more defined values.
 */
export type OneOrMany<T extends Defined> = Many<T> | One<T>;

/**
 * Creates a {@link OneOrMany}.
 * @param value A single defined value.
 * @param others Additional defined values.
 * @returns A {@link OneOrMany} built from the given values.
 */
export const OneOrMany = <T extends Defined>(value: T, ...others: T[]): OneOrMany<T> =>
    others.length > 0 ? [value, ...(others as [T])] : value;

/**
 * Type guard that checks whether a value is {@link Many}.
 * @param value A single defined value or array of defined values.
 * @returns True if the value is {@link Many}, false otherwise.
 */
export const isMany = <T extends Defined>(value: T | T[]): value is Many<T> => isArray(value) && value.length > 1;

/**
 * Type guard that checks whether a value is {@link None}.
 * @param value A single defined value or array of defined values.
 * @returns True if the value is {@link None}, false otherwise.
 */
export const isNone = <T extends Defined>(value: T | T[]): value is None => isArray(value) && value.length < 1;

/**
 * Type guard that checks whether a value is {@link One}.
 * @param value A single defined value or array of defined values.
 * @returns True if the value is {@link One}, false otherwise.
 */
export const isOne = <T extends Defined>(value: T | T[]): value is One<T> => !isArray(value) || value.length === 1;

/**
 * Converts a {@link NoneOneOrMany} into an array.
 * @param value A {@link NoneOneOrMany}.
 * @returns An array representation of the given {@link NoneOneOrMany}. If the {@link NoneOneOrMany} was already an
 * array, will return a copy.
 */
export const toArray = <T extends Defined>(value: NoneOneOrMany<T>): T[] => (isArray(value) ? [...value] : [value]);
