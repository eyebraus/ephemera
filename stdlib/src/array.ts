import { Defined } from './defined';
import { Dict } from './dict';
import { Maybe, wrap } from './maybe';
import { isNone } from './none-one-or-many';
import { Pair, first, second } from './pair';

/**
 * Gets the last item in the array if the array is non-empty.
 * @param array An array of defined items.
 * @returns A {@link Maybe} containing the last item in the array if the array is non-empty.
 */
export const end = <TItem extends Defined>(array: TItem[]): Maybe<TItem> =>
    wrap(isNone(array) ? undefined : array[array.length - 1]);

/**
 * Gets an array of all but the last item in an array.
 * @param array An array of defined items.
 * @returns A new array containing all items except the last one.
 */
export const front = <TItem extends Defined>(array: TItem[]): TItem[] => array.slice(0, -1);

/**
 * Creates an array of key-array {@link Pair}s from an array using a key selector function.
 * @param array An array of defined items.
 * @param groupBy A function that gets the key that the given value should be grouped with.
 * @returns An array of key-array {@link Pair}s where values that have the same key belong to the same pair.
 */
export const group = <TKey extends Defined, TValue extends Defined>(
    array: TValue[],
    groupBy: (value: TValue, index: number) => TKey,
): Pair<TKey, TValue[]>[] => {
    const pairs = array.map((value, index) => Pair(groupBy(value, index), value));
    const groupKeys = unique(pairs.map(first));
    const groups: Pair<TKey, TValue[]>[] = [];

    for (const groupKey of groupKeys) {
        const valuesForGroup = pairs.filter((pair) => groupKey === first(pair)).map(second);
        groups.push(Pair(groupKey, valuesForGroup));
    }

    return groups;
};

/**
 * Creates a {@link Dict} of arrays from an array using a key selector function.
 * @param array An array of defined items.
 * @param groupBy A function that gets the key that the given value should be grouped with.
 * @returns A {@link Dict} of arrays where values that have the same key belong to the same pair.
 */
export const groupInto = <TValue extends Defined>(
    array: TValue[],
    groupBy: (value: TValue, index: number) => string,
): Dict<TValue[]> => Dict(group(array, groupBy));

/**
 * Gets the first item in the array if the array is non-empty.
 * @param array An array of defined items.
 * @returns A {@link Maybe} containing the first item in the array if the array is non-empty.
 */
export const head = <TItem extends Defined>(array: TItem[]): Maybe<TItem> => wrap(isNone(array) ? undefined : array[0]);

/**
 * Type guard that checks whether a value is an array.
 * @param value An unknown value.
 * @returns True if the value is an array, false otherwise.
 */
export const isArray = <TItem extends Defined>(value: unknown): value is TItem[] => Array.isArray(value);

/**
 * Gets an array of all but the first item in an array.
 * @param array An array of defined items.
 * @returns A new array containing all items except the first one.
 */
export const tail = <TItem extends Defined>(value: TItem[]): TItem[] => value.slice(1);

/**
 * Gets an array that contains all unique values from a given array.
 * @param value An array of defined items.
 * @returns A new array containing all unique values from the given array.
 */
export const unique = <TItem extends Defined>(value: TItem[]): TItem[] => [...new Set(value)];
