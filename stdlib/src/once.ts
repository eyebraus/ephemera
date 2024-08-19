/**
 * Wraps a function in a memoizer that will be executed at most once. Following the first invocation, all subsequent
 * invocations will Good for lazily-evaluated singleton values.
 * @param fn The function to wrap.
 * @returns A function accepting the same arguments as the given function, but will be executed at most once.
 */
export const once = <TFn extends (...args: Parameters<TFn>) => ReturnType<TFn>>(
    fn: TFn,
): ((...args: Parameters<TFn>) => ReturnType<TFn>) => {
    let executed: boolean = false;
    let value: ReturnType<TFn>;

    return (...args: Parameters<TFn>): ReturnType<TFn> => {
        if (executed) {
            return value;
        }

        value = fn(...args);
        executed = true;

        return value;
    };
};
