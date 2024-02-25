import { isFault } from '../src';

describe('isFault', () => {
    test('should return false if code is missing', () => {
        const value = { message: 'hello' };
        const result = isFault(value);

        expect(result).toBe(false);
    });

    test('should return false if code is not a string', () => {
        const value = { code: 69, message: 'hello' };
        const result = isFault(value);

        expect(result).toBe(false);
    });

    test('should return false if message is missing', () => {
        const value = { code: 'foo' };
        const result = isFault(value);

        expect(result).toBe(false);
    });

    test('should return false if message is not a string', () => {
        const value = { code: 'foo', message: 69 };
        const result = isFault(value);

        expect(result).toBe(false);
    });

    test('should return true if required properties are given of the correct types', () => {
        const value = { code: 'foo', message: 'hello' };
        const result = isFault(value);

        expect(result).toBe(true);
    });

    test('should return true if there are additional properties of any kind', () => {
        const value = { code: 'foo', message: 'hello', nort: 'lort' };
        const result = isFault(value);

        expect(result).toBe(true);
    });
});
