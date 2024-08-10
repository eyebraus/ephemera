import { compact } from '../src';

describe('compact', () => {
    test('should return an empty array when given an empty array', () => {
        const result = compact([]);

        expect(result.length).toBe(0);
    });
});
