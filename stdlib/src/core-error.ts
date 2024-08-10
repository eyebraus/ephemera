import { Fault, isFault } from './fault';
import { isString } from './string';

const convertInnerFaultToObject = (inner: Fault | undefined): Fault | undefined => {
    if (inner === undefined) {
        return undefined;
    }

    if (isCoreError(inner)) {
        return inner.toObject();
    }

    return inner;
};

/**
 * Core implementation of an error. Enriches {@link Error} with additional information and provides constructors for
 * conveniently building errors adhering to the enriched schema.
 */
export class CoreError<TCode extends string = string> extends Error implements Fault<TCode> {
    /**
     * Error code.
     */
    code: TCode | 'Unknown';

    /**
     * Failure which caused this error to occur.
     */
    inner?: Fault;

    /**
     * Constructs a {@link CoreError}.
     * @param message Description of the error
     */
    constructor(message: string);

    /**
     * Constructs a {@link CoreError}.
     * @param code Error code.
     * @param message Description of the error.
     * @param inner Failure which caused this error to occur.
     */
    constructor(code: TCode, message: string, inner?: Fault);

    constructor(codeOrMessage: TCode | string, message?: string, inner?: Fault) {
        super(isString(message) ? message : codeOrMessage);

        this.code = isString(message) ? (codeOrMessage as TCode) : 'Unknown';
        this.inner = inner;
    }

    /**
     * Serializes the {@link CoreError} into an object.
     * @returns Object representation of the error.
     */
    toObject(): CoreErrorProperties<TCode> {
        return {
            code: this.code,
            inner: convertInnerFaultToObject(this.inner),
            message: this.message,
            stack: this.stack,
        };
    }
}

/**
 * Object representation of a {@link CoreError}.
 */
export interface CoreErrorProperties<TCode extends string = string> extends ErrorProperties, Fault<TCode> {
    code: TCode | 'Unknown';
    inner?: Fault;
}

/**
 * Object representation of an {@link Error}.
 */
export interface ErrorProperties {
    message: string;
    stack?: string;
}

/**
 * Checks whether a value is a {@link CoreError}.
 * @param value Value.
 * @returns True if value is an instance of {@link CoreError}; false otherwise.
 */
export const isCoreError = (value: unknown): value is CoreError => value instanceof CoreError;

/**
 * Checks whether a value is a {@link CoreErrorProperties}.
 * @param value Value.
 * @returns True if value can be assigned to {@link CoreErrorProperties}; false otherwise.
 */
export const isCoreErrorProperties = (value: unknown): value is CoreErrorProperties => {
    if (!isErrorProperties(value)) {
        return false;
    }

    const { code, inner } = value as CoreErrorProperties;

    return isString(code) && (inner === undefined || isFault(inner));
};

/**
 * Checks whether a value is an {@link ErrorProperties}.
 * @param value Value.
 * @returns True if value can be assigned to {@link ErrorProperties}; false otherwise.
 */
export const isErrorProperties = (value: unknown): value is ErrorProperties => {
    const { message, stack } = value as ErrorProperties;

    return isString(message) && (stack === undefined || isString(stack));
};
