import { IfVoid } from './if';

/**
 * Provides a default type when a given type is void.
 */
export type Ensure<TType, TDefault> = IfVoid<TType, TDefault, TType>;
