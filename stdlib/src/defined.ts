/**
 * A utility type aliasing the common case for {@link NonNullable}, which expresses "I want something non-nullish."
 */
export type Defined = NonNullable<unknown>;

/**
 * Type guard which detects whether a given value is {@link Defined}.
 * @param value Possibly undefined value.
 * @returns True if {@link Defined}, false otherwise.
 */
export const isDefined = <T extends Defined>(value: T | undefined): value is T => value !== undefined;
