import {
    end,
    front,
    group,
    groupInto,
    head,
    isArray,
    isNothing,
    isSomething,
    Pair,
    tail,
    unique,
    unwrap,
} from '../src';

describe('end', () => {
    it('should return an empty array when given an empty array', () => {
        const result = end([]);

        expect(isNothing(result)).toBe(true);
    });

    it('should return the only element in an array when given a single element array', () => {
        const result = end([1]);

        expect(isSomething(result)).toBe(true);
        expect(unwrap(result)).toBe(1);
    });

    it('should return the last element in an array when given a multiple element array', () => {
        const result = end([1, 2, 3]);

        expect(isSomething(result)).toBe(true);
        expect(unwrap(result)).toBe(3);
    });
});

describe('front', () => {
    it('should return an empty array when given an empty array', () => {
        const result = front([]);

        expect(result).toEqual([]);
    });

    it('should return an empty array when given a single element array', () => {
        const result = front([1]);

        expect(result).toEqual([]);
    });

    it('should return a non-empty array when given a multiple element array', () => {
        const result = front([1, 2, 3]);

        expect(result).toEqual([1, 2]);
    });
});

describe('group', () => {
    it('should return an empty array when given an empty array', () => {
        const result = group([], () => 'foo');

        expect(result).toEqual([]);
    });

    it('should apply groupBy function to all elements based on values from input', () => {
        const result = group(['foo-la', 'foo-lu', 'bar-bing', 'baz-bolt', 'bar-flute'], (value) => value.split('-')[0]);

        expect(result).toContainEqual(Pair('foo', ['foo-la', 'foo-lu']));
        expect(result).toContainEqual(Pair('bar', ['bar-bing', 'bar-flute']));
        expect(result).toContainEqual(Pair('baz', ['baz-bolt']));
    });

    it('should apply groupBy function to all elements based on indexes from input', () => {
        const result = group(['foo-la', 'foo-lu', 'bar-bing', 'baz-bolt', 'bar-flute'], (_, index) => index % 2);

        expect(result).toContainEqual(Pair(0, ['foo-la', 'bar-bing', 'bar-flute']));
        expect(result).toContainEqual(Pair(1, ['foo-lu', 'baz-bolt']));
    });
});

describe('groupInto', () => {
    it('should return an empty Dict when given an empty array', () => {
        const result = groupInto([], () => 'foo');

        expect(result).toEqual({});
    });

    it('should apply groupBy function to all elements based on values from input', () => {
        const result = groupInto(
            ['foo-la', 'foo-lu', 'bar-bing', 'baz-bolt', 'bar-flute'],
            (value) => value.split('-')[0],
        );

        expect(result).toEqual({
            foo: ['foo-la', 'foo-lu'],
            bar: ['bar-bing', 'bar-flute'],
            baz: ['baz-bolt'],
        });
    });

    it('should apply groupBy function to all elements based on indexes from input', () => {
        const result = groupInto(
            ['foo-la', 'foo-lu', 'bar-bing', 'baz-bolt', 'bar-flute'],
            (_, index) => `${index % 2}`,
        );

        expect(result).toEqual({
            '0': ['foo-la', 'bar-bing', 'bar-flute'],
            '1': ['foo-lu', 'baz-bolt'],
        });
    });
});

describe('head', () => {
    it('should return an empty array when given an empty array', () => {
        const result = head([]);

        expect(isNothing(result)).toBe(true);
    });

    it('should return the only element in an array when given a single element array', () => {
        const result = head([1]);

        expect(isSomething(result)).toBe(true);
        expect(unwrap(result)).toBe(1);
    });

    it('should return the first element in an array when given a multiple element array', () => {
        const result = head([1, 2, 3]);

        expect(isSomething(result)).toBe(true);
        expect(unwrap(result)).toBe(1);
    });
});

describe('isArray', () => {
    it('should return false when given a non-array value', () => {
        expect(isArray(1)).toBe(false);
        expect(isArray(false)).toBe(false);
        expect(isArray('hello')).toBe(false);
        expect(isArray({})).toBe(false);
    });

    it('should return true when given an empty array value', () => {
        expect(isArray([])).toBe(true);
    });

    it('should return true when given a non-empty array value', () => {
        expect(isArray([1, 2, 3])).toBe(true);
    });
});

describe('tail', () => {
    it('should return an empty array when given an empty array', () => {
        const result = tail([]);

        expect(result).toEqual([]);
    });

    it('should return an empty array when given a single element array', () => {
        const result = tail([1]);

        expect(result).toEqual([]);
    });

    it('should return a non-empty array when given a multiple element array', () => {
        const result = tail([1, 2, 3]);

        expect(result).toEqual([2, 3]);
    });
});

describe('unique', () => {
    it('should return an empty array when given an empty array', () => {
        const result = unique([]);

        expect(result).toEqual([]);
    });

    it('should return an equivalent array when all items are unique', () => {
        const result = unique([1, 2, 3]);

        expect(result).toContainEqual(1);
        expect(result).toContainEqual(2);
        expect(result).toContainEqual(3);
    });

    it('should return a non-empty array when given a multiple element array', () => {
        const result = tail([1, 1, 3, 2, 3]);

        expect(result).toContainEqual(1);
        expect(result).toContainEqual(2);
        expect(result).toContainEqual(3);
    });
});
