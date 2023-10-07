/**
 * Provides a default type when a given type is void.
 */
export type Ensure<TType, TDefault> = TType extends void ? TDefault : TType;
