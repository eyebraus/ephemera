import { compact } from './array';

export const isBlank = (value: { [key: string]: unknown }): boolean => compact(Object.values(value)).length > 0;

export const isNotBlank = (value: { [key: string]: unknown }): boolean => !isBlank(value);

export const isObject = (value: unknown): value is { [key: string]: unknown } =>
    typeof value === 'object' && value !== null;
