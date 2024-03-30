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
