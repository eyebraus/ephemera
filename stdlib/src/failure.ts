import { isString } from './string';

/**
 * Core type for a failure. This can be a handled failure or an unhandled one, such as an {@link Error}.
 */
export interface Failure<TCode extends string = string> {
    /**
     * Failure code.
     */
    code: TCode | 'Unknown';

    /**
     * Failure which caused this failure to occur.
     */
    inner?: Failure;

    /**
     * Description of the failure.
     */
    message: string;
}

/**
 * Checks whether a value is a {@link Failure}.
 * @param value value
 * @returns True if value can be assigned to {@link Failure}; false otherwise
 */
export const isFailure = (value: unknown): value is Failure => {
    const { code, message } = value as Failure;

    // Note: purposefully not recursive-checking inner here.
    return isString(code) && isString(message);
};
