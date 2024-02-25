/**
 * Conditional type that will be {@link TThen} when {@link TType} extends {@link TTest} and {@link TElse} otherwise.
 */
export type If<TType, TTest, TThen, TElse> = TType extends TTest ? TThen : TElse;

/**
 * Conditional type that will be {@link TThen} when {@link TType} is void and {@link TElse} otherwise.
 */
export type IfVoid<TType, TThen, TElse> = If<TType, void, TThen, TElse>;
