/**
 * Checks whether an object contains no defined items.
 * @param value An object.
 * @returns True if the given object contains no defined items, false otherwise.
 */
export const isBlank = (value: { [key: string]: unknown }): boolean =>
    Object.values(value).every((value) => value === undefined);

/**
 * Checks whether an object contains at least one defined item.
 * @param value An object.
 * @returns True if the given object contains at least one defined item, false otherwise.
 */
export const isNotBlank = (value: { [key: string]: unknown }): boolean => !isBlank(value);

/**
 * Type guard that checks whether a value is a non-null object.
 * @param value An unknown value.
 * @returns True if given value is a non-null object, false otherwise.
 */
export const isObject = (value: unknown): value is { [key: string]: unknown } =>
    typeof value === 'object' && value !== null;
