import { CoreError } from './core-error';

/**
 * A value representing either the presence or absence of a value. This is useful in contexts when you want semantics
 * like ____ | undefined but a given type must be non-nullable.
 */
export type Maybe<TValue extends NonNullable<unknown>> = Something<TValue> | Nothing;

/**
 * Creates a {@link Maybe}.
 * @param value Optional value.
 * @returns A {@link Something} if value is given; {@link Nothing} otherwise.
 */
export const Maybe = <TValue extends NonNullable<unknown>>(value?: TValue): Maybe<TValue> =>
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
export type Something<TValue extends NonNullable<unknown>> = { is: true; value: TValue };

/**
 * Creates a {@link Maybe}.
 * @param value Optional value.
 * @returns A {@link Something} if value is given; {@link Nothing} otherwise.
 */
export const Something = <TValue extends NonNullable<unknown>>(value: TValue): Something<TValue> => ({
    is: true,
    value,
});

/**
 * Type guard which detects whether a given "maybe" is nothing.
 * @param maybe Maybe
 * @returns True if {@link Nothing}, false otherwise.
 */
export const isNothing = <TValue extends NonNullable<unknown>>(maybe: Maybe<TValue>): maybe is Nothing => !maybe.is;

/**
 * Type guard which detects whether a given "maybe" is something.
 * @param maybe Maybe
 * @returns True if {@link Something}, false otherwise.
 */
export const isSomething = <TValue extends NonNullable<unknown>>(maybe: Maybe<TValue>): maybe is Something<TValue> =>
    maybe.is;

/**
 * Gets the value within the {@link Maybe} or throws if it's {@link Nothing}.
 * @param maybe Maybe
 * @returns The value inside the {@link Maybe}, if one exists.
 */
export const open = <TValue extends NonNullable<unknown>>(maybe: Maybe<TValue>): TValue => {
    if (isSomething(maybe)) {
        return maybe.value;
    }

    throw new CoreError('Expected maybe to be something, but was nothing.');
};

/**
 * Gets the value within the {@link Maybe} or returns undefined if it's {@link Nothing}.
 * @param maybe Maybe
 * @returns The value if {@link Something}, undefined otherwise.
 */
export const tryToOpen = <TValue extends NonNullable<unknown>>(maybe: Maybe<TValue>): TValue | undefined => {
    if (isSomething(maybe)) {
        return maybe.value;
    }

    return undefined;
};
