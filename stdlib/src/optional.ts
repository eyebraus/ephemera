/**
 * A utility type that marks properties of an original type as optional.
 */
export type Optional<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> & Partial<Pick<TValue, TKey>>;
