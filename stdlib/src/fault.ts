import { isString } from './string';
import { Union } from './union';

/**
 * Core type for fault codes.
 */
export type FaultCode = 'Unknown';

/**
 * Core type for fault codes.
 */
export const FaultCode: Union<FaultCode> = {
    Unknown: 'Unknown',
};

/**
 * Core type for a failure. This can be a handled failure or an unhandled one, such as an {@link Error}.
 */
export interface Fault<TCode extends string | FaultCode = FaultCode> {
    /**
     * Failure code.
     */
    code: TCode;

    /**
     * Failure which caused this failure to occur.
     */
    inner?: Fault<string>;

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
