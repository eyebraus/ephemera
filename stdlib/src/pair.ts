import { isArray } from './array';

/**
 * Types
 */

export type Pair<TFirst, TSecond> = [TFirst, TSecond];

/**
 * Initializers
 */

export const Pair = <TFirst, TSecond>(first: TFirst, second: TSecond): Pair<TFirst, TSecond> => [first, second];

/**
 * Functions
 */

export const first = <TFirst, TSecond>(pair: Pair<TFirst, TSecond>): TFirst => pair[0];

export const mapFirst = <TFirstX, TFirstY, TSecond>(
    pair: Pair<TFirstX, TSecond>,
    map: (first: TFirstX) => TFirstY,
): Pair<TFirstY, TSecond> => Pair(map(first(pair)), second(pair));

export const mapPair = <TFirstX, TSecondX, TFirstY, TSecondY>(
    pair: Pair<TFirstX, TSecondX>,
    mapFirst: (first: TFirstX) => TFirstY,
    mapSecond: (second: TSecondX) => TSecondY,
): Pair<TFirstY, TSecondY> => Pair(mapFirst(first(pair)), mapSecond(second(pair)));

export const mapSecond = <TFirst, TSecondX, TSecondY>(
    pair: Pair<TFirst, TSecondX>,
    map: (first: TSecondX) => TSecondY,
): Pair<TFirst, TSecondY> => Pair(first(pair), map(second(pair)));

export const second = <TFirst, TSecond>(pair: Pair<TFirst, TSecond>): TSecond => pair[1];

/**
 * Type guards
 */

export const isPair = <TFirst, TSecond>(value: unknown): value is Pair<TFirst, TSecond> =>
    isArray(value) && value.length === 2;
