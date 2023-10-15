/**
 * Checks whether a string value is not undefined nor empty.
 * @param value value
 * @returns True if value is neither undefined nor empty; false otherwise
 */
export const isNotUndefinedOrEmpty = (value: string | undefined): value is string => !isUndefinedOrEmpty(value);

/**
 * Checks whether a string value is not undefined nor white space.
 * @param value value
 * @returns True if value is neither undefined nor white space; false otherwise
 */
export const isNotUndefinedOrWhiteSpace = (value: string | undefined): value is string =>
    !isUndefinedOrWhiteSpace(value);

/**
 * Checks whether a given value is a string.
 * @param value value
 * @returns True if value is a string; false otherwise
 */
export const isString = (value: unknown): value is string => typeof value === 'string';

/**
 * Checks whether a string value is undefined or empty.
 * @param value value
 * @returns True if value is undefined or empty; false otherwise
 */
export const isUndefinedOrEmpty = (value: string | undefined): value is undefined | '' =>
    value === undefined || value === '';

/**
 * Checks whether a string value is undefined or white space.
 * @param value value
 * @returns True if value is undefined or white space; false otherwise
 */
export const isUndefinedOrWhiteSpace = (value: string | undefined): value is undefined | '' =>
    value === undefined || value.trim() === '';
