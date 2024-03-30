export type Optional<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> & Partial<Pick<TValue, TKey>>;
