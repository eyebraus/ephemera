import { CoreError } from './core-error';
import { IfVoid } from './if';

interface FailureWithContent<TContent> {
    content: TContent;
    successful: false;
}

interface FailureWithoutContent {
    successful: false;
}

/**
 * Unsuccessful result with optional content.
 */
export type Failure<TContent = void> = IfVoid<TContent, FailureWithoutContent, FailureWithContent<TContent>>;

interface SuccessWithContent<TContent> {
    content: TContent;
    successful: true;
}

interface SuccessWithoutContent {
    successful: true;
}

/**
 * Successful result with optional content.
 */
export type Success<TContent = void> = IfVoid<TContent, SuccessWithoutContent, SuccessWithContent<TContent>>;

/**
 * Result of an operation, the outcome of which could be successful or unsuccessful.
 */
export type Result<TOnSuccess = void, TOnFailure = void> = Failure<TOnFailure> | Success<TOnSuccess>;

/**
 * Gets failure content from a result.
 * @param result Result
 * @returns Failure content
 * @throws {CoreError} Expected result to be failure, but was success.
 */
export const failureContent = <TOnFailure extends NonNullable<unknown>, TOnSuccess = void>(
    result: Result<TOnSuccess, TOnFailure>,
): TOnFailure => {
    if (isFailure(result)) {
        return result.content;
    }

    throw new CoreError('Expected result to be failure, but was success.');
};

/**
 * Gets failure content from a result or undefined if result isn't a failure.
 * @param result Result
 * @returns Failure content if {@link Failure}, undefined otherwise
 */
export const failureContentOrUndefined = <TOnFailure extends NonNullable<unknown>, TOnSuccess = void>(
    result: Result<TOnSuccess, TOnFailure>,
): TOnFailure | undefined => {
    if (isFailure(result)) {
        return result.content;
    }

    return undefined;
};

/**
 * Type guard which detects whether a given result is a failure.
 * @param result Result
 * @returns True if {@link Failure}, false otherwise.
 */
export const isFailure = <TOnFailure = void, TOnSuccess = void>(
    result: Result<TOnSuccess, TOnFailure>,
): result is Failure<TOnFailure> => !result.successful;

/**
 * Type guard which detects whether a given result is a success.
 * @param result Result
 * @returns True if {@link Success}, false otherwise.
 */
export const isSuccess = <TOnSuccess = void, TOnFailure = void>(
    result: Result<TOnSuccess, TOnFailure>,
): result is Success<TOnSuccess> => result.successful;

/**
 * Gets success content from a result.
 * @param result Result
 * @returns Failure content
 * @throws {CoreError} Expected result to be failure, but was success.
 */
export const successContent = <TOnSuccess extends NonNullable<unknown>>(
    result: Result<TOnSuccess, unknown>,
): TOnSuccess => {
    if (isSuccess(result)) {
        return result.content;
    }

    throw new CoreError('Expected result to be success, but was failure.');
};

/**
 * Gets success content from a result or undefined if result isn't a success.
 * @param result Result
 * @returns Success content if {@link Success}, undefined otherwise
 */
export const successContentOrUndefined = <TOnSuccess extends NonNullable<unknown>, TOnFailure = void>(
    result: Result<TOnSuccess, TOnFailure>,
): TOnSuccess | undefined => {
    if (isSuccess(result)) {
        return result.content;
    }

    return undefined;
};
