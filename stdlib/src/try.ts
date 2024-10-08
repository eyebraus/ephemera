import { Defined } from './defined';
import { Maybe, Nothing, Something } from './maybe';

/**
 * Wraps a function that may throw an error. If it throws, the error is swallowed and a given default value is returned
 * instead.
 * @param fn Function to wrap
 * @param defaultValue Value to return if function throws
 * @returns Wrapped function that will return given default value if original function threw
 */
export const tryOrDefault =
    <TFn extends (...params: Parameters<TFn>) => ReturnType<TFn>, TDefault = ReturnType<TFn>>(
        fn: TFn,
        defaultValue: TDefault,
    ): ((...params: Parameters<TFn>) => ReturnType<TFn> | TDefault) =>
    (...params: Parameters<TFn>) => {
        try {
            return fn(...params);
        } catch {
            return defaultValue;
        }
    };

/**
 * Wraps a function that may throw an error. If it throws, the error is swallowed and {@link Nothing} is returned
 * instead.
 * @param fn Function to wrap
 * @returns Wrapped function that will return {@link Nothing} if original function threw
 */
export const tryOrNothing =
    <TReturn extends Defined, TFn extends (...params: Parameters<TFn>) => TReturn>(
        fn: TFn,
    ): ((...params: Parameters<TFn>) => Maybe<TReturn>) =>
    (...params: Parameters<TFn>) => {
        try {
            return Something(fn(...params));
        } catch {
            return Nothing();
        }
    };

/**
 * Wraps a function that may throw an error. If it throws, the error is swallowed and undefined is returned instead.
 * @param fn Function to wrap
 * @returns Wrapped function that will return undefined if original function threw
 */
export const tryOrUndefined = <TFn extends (...params: Parameters<TFn>) => ReturnType<TFn>>(
    fn: TFn,
): ((...params: Parameters<TFn>) => ReturnType<TFn> | undefined) => tryOrDefault(fn, undefined);
