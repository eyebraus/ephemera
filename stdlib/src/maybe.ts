import { CoreError } from './core-error';
import { Defined } from './defined';

/**
 * A value representing either the presence or absence of a value. This is useful in contexts when you want semantics
 * like ____ | undefined but a given type must be non-nullable.
 */
export type Maybe<TValue extends Defined> = Something<TValue> | Nothing;

/**
 * Creates a {@link Maybe}.
 * @param value Optional value.
 * @returns A {@link Something} if value is given; {@link Nothing} otherwise.
 */
export const Maybe = <TValue extends Defined>(value?: TValue): Maybe<TValue> =>
    value ? { is: true, value } : { is: false };

/**
 * A value representing the absence of a value.
 */
export type Nothing = { is: false };

/**
 * Creates a {@link Nothing}.
 * @returns A {@link Nothing}.
 */
export const Nothing = (): Nothing => ({ is: false });

/**
 * A value representing the presence of a value.
 */
export type Something<TValue extends Defined> = { is: true; value: TValue };

/**
 * Creates a {@link Maybe}.
 * @param value Optional value.
 * @returns A {@link Something} if value is given; {@link Nothing} otherwise.
 */
export const Something = <TValue extends Defined>(value: TValue): Something<TValue> => ({
    is: true,
    value,
});

/**
 * Creates a {@link Something} containing the values of all the given {@link Maybe}s that were {@link Something}s.
 * @param maybes An array of {@link Maybe}s.
 * @returns A {@link Something} that contains an array of values from {@link Something}s in the given array.
 */
export const compact = <TValue extends Defined>(maybes: Maybe<TValue>[]): Something<TValue[]> =>
    Something(unwrapMany(...maybes.filter(isSomething)));

/**
 * Gets the number of {@link Something}s in an array of {@link Maybe}s.
 * @param maybes An array of {@link Maybe}s.
 * @returns The number of {@link Something}s in the given array.
 */
export const density = <TValue extends Defined>(maybes: Maybe<TValue>[]): number => maybes.filter(isSomething).length;

/**
 * Type guard which detects whether every {@link Maybe} in a given array is {@link Something}.
 * @param maybes An array of {@link Maybe}s.
 * @returns True if all {@link Maybe}s are {@link Something}, false otherwise.
 */
export const isFull = <TValue extends Defined>(maybes: Maybe<TValue>[]): maybes is Something<TValue>[] =>
    maybes.every(isSomething);

/**
 * Type guard which detects whether a given {@link Maybe} is {@link Nothing}.
 * @param maybe A {@link Maybe}.
 * @returns True if {@link Nothing}, false otherwise.
 */
export const isNothing = <TValue extends Defined>(maybe: Maybe<TValue>): maybe is Nothing => !maybe.is;

/**
 * Type guard which detects whether a given {@link Maybe} is {@link Something}.
 * @param maybe A {@link Maybe}.
 * @returns True if {@link Something}, false otherwise.
 */
export const isSomething = <TValue extends Defined>(maybe: Maybe<TValue>): maybe is Something<TValue> => maybe.is;

/**
 * Type guard which detects whether every {@link Maybe} in a given array is {@link Nothing}.
 * @param maybes An array of {@link Maybe}s.
 * @returns True if all {@link Maybe}s are {@link Nothing}, false otherwise.
 */
export const isVacant = <TValue extends Defined>(maybes: Maybe<TValue>[]): maybes is Nothing[] =>
    maybes.every(isNothing);

/**
 * Gets the number of {@link Nothing}s in an array of {@link Maybe}s.
 * @param maybes An array of {@link Maybe}s.
 * @returns The number of {@link Nothing}s in the given array.
 */
export const sparsity = <TValue extends Defined>(maybes: Maybe<TValue>[]): number => maybes.filter(isNothing).length;

/**
 * Tries to get the value within the given {@link Maybe}.
 * @param maybe A {@link Maybe}.
 * @returns The value if {@link Something}, undefined otherwise.
 */
export const tryToUnwrap = <TValue extends Defined>(maybe: Maybe<TValue>): TValue | undefined => {
    if (isSomething(maybe)) {
        return maybe.value;
    }

    return undefined;
};

/**
 * Tries to get the values within the given {@link Maybe}s.
 * @param maybes One or more {@link Maybe}s.
 * @returns A parallel array where each item is either the corresponding {@link Maybe}'s value or undefined if
 * {@link Nothing}.
 */
export const tryToUnwrapMany = <TValue extends Defined>(...maybes: Maybe<TValue>[]): (TValue | undefined)[] =>
    maybes.map(tryToUnwrap);

/**
 * Gets the value within the given {@link Maybe} or throws if it's {@link Nothing}.
 * @param maybe A {@link Maybe}.
 * @returns The value inside the {@link Maybe}, if one exists.
 */
export const unwrap = <TValue extends Defined>(maybe: Maybe<TValue>): TValue => {
    if (isSomething(maybe)) {
        return maybe.value;
    }

    throw new CoreError('Expected maybe to be something, but was nothing.');
};

/**
 * Gets the values within the given {@link Maybe}s or throws if there are any {@link Nothing}s.
 * @param maybes One or more {@link Maybe}s.
 * @returns A parallel array where each item is the corresponding {@link Maybe}'s value.
 */
export const unwrapMany = <TValue extends Defined>(...maybes: Maybe<TValue>[]): TValue[] => maybes.map(unwrap);

/**
 * Creates a new {@link Maybe} from a given value.
 * @param value Value, possibly undefined.
 * @returns A {@link Something} if value is defined, {@link Nothing} otherwise.
 */
export const wrap = <TValue extends Defined>(value: TValue | undefined): Maybe<TValue> => Maybe(value);

/**
 * Creates new {@link Maybe}s from given values.
 * @param values One or more values, possibly undefined.
 * @returns A parallel array where each item is {@link Something} if value is defined, {@link Nothing} otherwise.
 */
export const wrapMany = <TValue extends Defined>(...values: (TValue | undefined)[]): Maybe<TValue>[] =>
    values.map(wrap);
