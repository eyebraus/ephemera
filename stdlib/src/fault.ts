import { isString } from './string';

/**
 * Core type for a failure. This can be a handled failure or an unhandled one, such as an {@link Error}.
 */
export interface Fault<TCode extends string = string> {
    /**
     * Failure code.
     */
    code: TCode | 'Unknown';

    /**
     * Failure which caused this failure to occur.
     */
    inner?: Fault;

    /**
     * Description of the failure.
     */
    message: string;
}

/**
 * Checks whether a value is a {@link Fault}.
 * @param value Value.
 * @returns True if value can be assigned to {@link Fault}; false otherwise
 */
export const isFault = (value: unknown): value is Fault => {
    const { code, message } = value as Fault;

    // Note: purposefully not recursive-checking inner here.
    return isString(code) && isString(message);
};
