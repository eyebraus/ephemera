import { isArray } from './array';
import { Pair } from './pair';

/**
 * Types
 */

export type Map<TValue> = { [key: string]: TValue };

/**
 * Initializers
 */

export const Map = <TValue>(value?: Map<TValue> | Pair<string, TValue>[]): Map<TValue> => {
    // Undefined: return empty object
    if (!value) {
        return {};
    }

    const map: Map<TValue> = {};

    // Array of pairs: add each pair to new object
    if (isArray(value)) {
        value.forEach((pair) => {
            const [key, value] = pair;
            map[key] = value;
        });

        return map;
    }

    // Existing map: copy it, with case sensitivity accounted for
    for (const key in value) {
        map[key] = value[key];
    }

    return map;
};

/**
 * Functions
 */

export const entries = <TValue>(map: Map<TValue>): Pair<string, TValue>[] =>
    keys(map).map((key) => Pair(key, map[key]));

export const forEach = <TValue>(map: Map<TValue>, fn: (value: TValue, key: string) => void): void => {
    for (const key in map) {
        fn(map[key], key);
    }
};

export const filter = <TValue>(map: Map<TValue>, predicate: (value: TValue, key: string) => boolean): Map<TValue> => {
    const copy: Map<TValue> = {};

    for (const key in map) {
        if (predicate(map[key], key)) {
            copy[key] = map[key];
        }
    }

    return copy;
};

export const get = <TValue>(map: Map<TValue>, key: string): TValue | undefined =>
    has(map, key) ? map[key] : undefined;

export const has = <TValue>(map: Map<TValue>, key: string): boolean => Object.hasOwn(map, key);

export const isEmpty = <TValue>(map: Map<TValue>): boolean => size(map) < 1;

export const keys = <TValue>(map: Map<TValue>): string[] => Object.keys(map);

export const map = <TValueIn, TValueOut>(
    map: Map<TValueIn>,
    fn: (value: TValueIn, key: string) => TValueOut,
): Map<TValueOut> => {
    const copy: Map<TValueOut> = {};

    for (const key in map) {
        copy[key] = fn(map[key], key);
    }

    return copy;
};

export const merge = <TValue>(...maps: Map<TValue>[]): Map<TValue> => {
    if (maps.length < 1) {
        return {};
    }

    const copy = Map(maps[0]);

    if (maps.length === 1) {
        return copy;
    }

    maps.forEach((map) => {
        for (const key in map) {
            copy[key] = map[key];
        }
    });

    return copy;
};

export const remove = <TValue>(map: Map<TValue>, key: string): Map<TValue> => {
    const copy = Map(map);
    delete copy[key];

    return copy;
};

export const set = <TValue>(map: Map<TValue>, key: string, value: TValue): Map<TValue> => {
    const copy = Map(map);
    copy[key] = value;

    return copy;
};

export const size = <TValue>(map: Map<TValue>): number => keys(map).length;

export const values = <TValue>(map: Map<TValue>): TValue[] => Object.values(map);
