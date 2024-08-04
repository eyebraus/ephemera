import { Map } from './map';
import { Pair, first, second } from './pair';

/**
 * Functions
 */

export const compact = <TItem>(value: (TItem | undefined)[]): TItem[] =>
    value.filter((item) => item !== undefined) as TItem[];

export const end = <TItem>(value: TItem[]): TItem | undefined =>
    value.length > 0 ? value[value.length - 1] : undefined;

export const front = <TItem>(value: TItem[]): TItem[] => (value.length > 0 ? value.slice(0, -1) : []);

export const group = <TKey, TValue>(
    items: TValue[],
    groupBy: (value: TValue, index: number) => TKey,
): Pair<TKey, TValue[]>[] => {
    const pairs = items.map((value, index) => Pair(groupBy(value, index), value));
    const groupKeys = unique(pairs.map(first));
    const groups: Pair<TKey, TValue[]>[] = [];

    for (const groupKey of groupKeys) {
        const valuesForGroup = pairs.filter((pair) => groupKey === first(pair)).map(second);
        groups.push(Pair(groupKey, valuesForGroup));
    }

    return groups;
};

export const groupInto = <TValue>(value: TValue[], groupBy: (value: TValue, index: number) => string): Map<TValue[]> =>
    Map(group(value, groupBy));

export const head = <TItem>(value: TItem[]): TItem | undefined => (value.length > 0 ? value[0] : undefined);

export const isArray = <TItem>(value: unknown): value is TItem[] => Array.isArray(value);

export const tail = <TItem>(value: TItem[]): TItem[] => (value.length > 0 ? value.slice(1) : []);

export const unique = <TItem>(value: TItem[]): TItem[] => [...new Set(value)];
