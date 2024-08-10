/**
 * Type guard which checks whether a given value is a number.
 * @param maybes An unknown value.
 * @returns True if the given value is a number, false otherwise.
 */
export const isNumber = (value: unknown): value is number => typeof value === 'number';
