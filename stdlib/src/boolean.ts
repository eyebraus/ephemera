/**
 * Type guard which detects whether a given value is boolean.
 * @param value Value.
 * @returns True if the value is boolean, false otherwise.
 */
export const isBoolean = (value: unknown): value is boolean => value === false || value === true;
