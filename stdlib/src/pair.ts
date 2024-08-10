import { isArray } from './array';
import { Defined } from './defined';

/**
 * A tuple of two defined values.
 */
export type Pair<TFirst extends Defined, TSecond extends Defined> = [TFirst, TSecond];

/**
 * Creates a {@link Pair}.
 * @param first First value.
 * @param second Second value.
 * @returns A {@link Pair} created from the given values..
 */
export const Pair = <TFirst extends Defined, TSecond extends Defined>(
    first: TFirst,
    second: TSecond,
): Pair<TFirst, TSecond> => [first, second];

/**
 * Gets the first value of a {@link Pair}.
 * @param pair A {@link Pair}.
 * @returns The first value of a {@link Pair}.
 */
export const first = <TFirst extends Defined, TSecond extends Defined>(pair: Pair<TFirst, TSecond>): TFirst => pair[0];

/**
 * Type guard that checks whether a value is a {@link Pair}.
 * @param value An unknown value.
 * @returns True if the value is a {@link Pair}, false otherwise.
 */
export const isPair = <TFirst extends Defined, TSecond extends Defined>(
    value: unknown,
): value is Pair<TFirst, TSecond> => isArray(value) && value.length === 2;

/**
 * Creates a new {@link Pair} by mapping the first value of an existing {@link Pair} to a new value using a function.
 * @param pair A {@link Pair}.
 * @param fn A function that maps the first value of the given {@link Pair} to a new value.
 * @returns A new {@link Pair} with the mapped first value and unchanged second value.
 */
export const mapFirst = <TFirstX extends Defined, TFirstY extends Defined, TSecond extends Defined>(
    pair: Pair<TFirstX, TSecond>,
    fn: (first: TFirstX) => TFirstY,
): Pair<TFirstY, TSecond> => Pair(fn(first(pair)), second(pair));

/**
 * Creates a new {@link Pair} by mapping the first and second values of an existing {@link Pair} to new values using two
 * functions.
 * @param pair A {@link Pair}.
 * @param fn A function that maps the first value of the given {@link Pair} to a new value.
 * @returns A new {@link Pair} with the mapped first value and unchanged second value.
 */
export const mapPair = <
    TFirstX extends Defined,
    TSecondX extends Defined,
    TFirstY extends Defined,
    TSecondY extends Defined,
>(
    pair: Pair<TFirstX, TSecondX>,
    fn1: (first: TFirstX) => TFirstY,
    fn2: (second: TSecondX) => TSecondY,
): Pair<TFirstY, TSecondY> => Pair(fn1(first(pair)), fn2(second(pair)));

/**
 * Creates a new {@link Pair} by mapping the second value of an existing {@link Pair} to a new value using a function.
 * @param pair A {@link Pair}.
 * @param fn A function that maps the second value of the given {@link Pair} to a new value.
 * @returns A new {@link Pair} with the unchanged first value and mapped second value.
 */
export const mapSecond = <TFirst extends Defined, TSecondX extends Defined, TSecondY extends Defined>(
    pair: Pair<TFirst, TSecondX>,
    fn: (first: TSecondX) => TSecondY,
): Pair<TFirst, TSecondY> => Pair(first(pair), fn(second(pair)));

/**
 * Gets the second value of a {@link Pair}.
 * @param pair A {@link Pair}.
 * @returns The second value of a {@link Pair}.
 */
export const second = <TFirst extends Defined, TSecond extends Defined>(pair: Pair<TFirst, TSecond>): TSecond =>
    pair[1];
