import { isBoolean } from '../src';

describe('isBoolean', () => {
    test('return false for non-boolean values', () => {
        expect(isBoolean(1)).toBe(false);
        expect(isBoolean('hello')).toBe(false);
        expect(isBoolean([])).toBe(false);
        expect(isBoolean({})).toBe(false);
    });

    test('return true for boolean values', () => {
        expect(isBoolean(false)).toBe(true);
        expect(isBoolean(true)).toBe(true);
    });
});
