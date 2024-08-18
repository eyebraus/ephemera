import {
    Dict,
    entries,
    every,
    filter,
    forEach,
    get,
    has,
    isEmpty,
    isNothing,
    isSomething,
    isString,
    keys,
    map,
    merge,
    mergeLeft,
    Pair,
    reduce,
    remove,
    set,
    size,
    some,
    unwrap,
    values,
} from '../src';

describe('Dict', () => {
    it('should create an empty object when not given any arguments', () => {
        const dict = Dict();

        expect(dict).toEqual({});
    });

    it('should create a Dict representation of a string-value pair array when given one as an argument', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);

        expect(dict).toEqual({ foo: 42, bar: 69, baz: 420 });
    });

    it('should create a copy of an existing Dict when given one as an argument', () => {
        const dict1 = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);
        const dict2 = Dict(dict1);

        expect(dict2).toEqual({ foo: 42, bar: 69, baz: 420 });
        expect(dict2).not.toBe(dict1);
    });
});

describe('entries', () => {
    it('should create an empty array when given an empty Dict', () => {
        const dict = Dict();

        expect(entries(dict)).toEqual([]);
    });

    it('should create an array containing a pair for all key-value pairs in the Dict', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);
        const result = entries(dict);

        expect(result.length).toBe(3);
        expect(result).toContainEqual(Pair('foo', 42));
        expect(result).toContainEqual(Pair('bar', 69));
        expect(result).toContainEqual(Pair('baz', 420));
    });
});

describe('every', () => {
    it('should return true when given an empty Dict', () => {
        const dict = Dict();

        expect(every(dict, () => false)).toBe(true);
    });

    it('should return false if any one of the elements returns false', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);

        expect(every(dict, (value) => value < 100)).toBe(false);
    });

    it('should return true if every one of the elements returns true', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);

        expect(every(dict, (_value, key) => isString(key))).toBe(true);
    });
});

describe('forEach', () => {
    it('should not perform the function when given an empty Dict', () => {
        const dict = Dict();
        const stringifiedEntries: string[] = [];

        forEach(dict, (value, key) => {
            stringifiedEntries.push(`${key}-${value}`);
        });

        expect(stringifiedEntries.length).toBe(0);
    });

    it('should perform the function for each entry when given a non-empty Dict', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);
        const stringifiedEntries: string[] = [];

        forEach(dict, (value, key) => {
            stringifiedEntries.push(`${key}-${value}`);
        });

        expect(stringifiedEntries.length).toBe(3);
        expect(stringifiedEntries).toContain('foo-42');
        expect(stringifiedEntries).toContain('bar-69');
        expect(stringifiedEntries).toContain('baz-420');
    });
});

describe('filter', () => {
    it('should return a new empty Dict when given an empty Dict', () => {
        const dict = Dict();
        const filtered = filter(dict, () => false);

        expect(filtered).toEqual(dict);
        expect(filtered).not.toBe(dict);
    });

    it('should return a new Dict with only entries that return true when given a non-empty Dict', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);
        const filtered = filter(dict, (value) => value < 100);

        expect(filtered).toEqual({ foo: 42, bar: 69 });
    });

    it('should return an equivalent, but not the same, Dict when given a non-empty Dict and a function that filters nothing', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);
        const filtered = filter(dict, (_value, key) => isString(key));

        expect(filtered).toEqual(dict);
        expect(filtered).not.toBe(dict);
    });
});

describe('get', () => {
    it('should return Nothing when given an empty Dict', () => {
        const dict = Dict();
        const value = get(dict, 'foo');

        expect(isNothing(value)).toBe(true);
    });

    it('should return Nothing when given a non-empty Dict and a key that is not included in it', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);
        const value = get(dict, 'hello');

        expect(isNothing(value)).toBe(true);
    });

    it('should return Something containing the requested value when given a non-empty Dict and a key that is included in it', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);
        const value = get(dict, 'foo');

        expect(isSomething(value)).toBe(true);
        expect(unwrap(value)).toBe(42);
    });
});

describe('has', () => {
    it('should return false when given an empty Dict', () => {
        const dict = Dict();

        expect(has(dict, 'foo')).toBe(false);
    });

    it('should return false when given a non-empty Dict and a key that is not included in it', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);

        expect(has(dict, 'hello')).toBe(false);
    });

    it('should return true when given a non-empty Dict and a key that is included in it', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);

        expect(has(dict, 'foo')).toBe(true);
    });
});

describe('isEmpty', () => {
    it('should return true when given an empty Dict', () => {
        const dict = Dict();

        expect(isEmpty(dict)).toBe(true);
    });

    it('should return false when given a non-empty Dict', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);

        expect(isEmpty(dict)).toBe(false);
    });
});

describe('keys', () => {
    it('should create an empty array when given an empty Dict', () => {
        const dict = Dict();

        expect(keys(dict)).toEqual([]);
    });

    it('should create an array containing each key in the Dict', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);
        const result = keys(dict);

        expect(result.length).toBe(3);
        expect(result).toContain('foo');
        expect(result).toContain('bar');
        expect(result).toContain('baz');
    });
});

describe('map', () => {
    it('should create a new empty Dict when given an empty Dict', () => {
        const dict = Dict();
        const result = map(dict, (value, key) => `${key}-${value}`);

        expect(result).toEqual({});
        expect(result).not.toBe(dict);
    });

    it('should create a new Dict with the previous values from the given Dict mapped according to the given function', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);
        const result = map(dict, (value, key) => `${key}-${value}`);

        expect(result).toEqual({ foo: 'foo-42', bar: 'bar-69', baz: 'baz-420' });
        expect(result).not.toBe(dict);
    });
});

describe('merge', () => {
    it('should create a new empty Dict when given only empty Dicts', () => {
        const dict1 = Dict();
        const dict2 = Dict();
        const dict3 = Dict();
        const result = merge(dict1, dict2, dict3);

        expect(result).toEqual({});
        expect(result).not.toBe(dict1);
        expect(result).not.toBe(dict2);
        expect(result).not.toBe(dict3);
    });

    it('should create a new Dict containing the entries from all the given Dicts', () => {
        const dict1 = Dict({ foo: 42 });
        const dict2 = Dict({ bar: 69, baz: 420 });
        const dict3 = Dict({ hello: -1 });
        const result = merge(dict1, dict2, dict3);

        expect(result).toEqual({ foo: 42, bar: 69, baz: 420, hello: -1 });
        expect(result).not.toBe(dict1);
        expect(result).not.toBe(dict2);
        expect(result).not.toBe(dict3);
    });

    it('should given precedence to the right-most Dict when the same key is in multiple Dicts', () => {
        const dict1 = Dict({ foo: 42, bar: -1 });
        const dict2 = Dict({ bar: 69, baz: 420 });
        const dict3 = Dict({ hello: -1 });
        const result = merge(dict1, dict2, dict3);

        expect(result).toEqual({ foo: 42, bar: 69, baz: 420, hello: -1 });
        expect(result).not.toBe(dict1);
        expect(result).not.toBe(dict2);
        expect(result).not.toBe(dict3);
    });
});

describe('mergeLeft', () => {
    it('should create a new empty Dict when given only empty Dicts', () => {
        const dict1 = Dict();
        const dict2 = Dict();
        const dict3 = Dict();
        const result = mergeLeft(dict1, dict2, dict3);

        expect(result).toEqual({});
        expect(result).not.toBe(dict1);
        expect(result).not.toBe(dict2);
        expect(result).not.toBe(dict3);
    });

    it('should create a new Dict containing the entries from all the given Dicts', () => {
        const dict1 = Dict({ foo: 42 });
        const dict2 = Dict({ bar: 69, baz: 420 });
        const dict3 = Dict({ hello: -1 });
        const result = mergeLeft(dict1, dict2, dict3);

        expect(result).toEqual({ foo: 42, bar: 69, baz: 420, hello: -1 });
        expect(result).not.toBe(dict1);
        expect(result).not.toBe(dict2);
        expect(result).not.toBe(dict3);
    });

    it('should given precedence to the left-most Dict when the same key is in multiple Dicts', () => {
        const dict1 = Dict({ foo: 42, bar: -1 });
        const dict2 = Dict({ bar: 69, baz: 420 });
        const dict3 = Dict({ hello: -1 });
        const result = mergeLeft(dict1, dict2, dict3);

        expect(result).toEqual({ foo: 42, bar: -1, baz: 420, hello: -1 });
        expect(result).not.toBe(dict1);
        expect(result).not.toBe(dict2);
        expect(result).not.toBe(dict3);
    });
});

describe('reduce', () => {
    it('should return the initial value when given an empty Dict', () => {
        const result = reduce(Dict<number>(), (previous, current) => previous + current, 13);

        expect(result).toBe(13);
    });

    it('should return a value resulting from iterative application of the reducer function', () => {
        const result = reduce(Dict({ foo: 42, bar: 69, baz: 420 }), (previous, current) => previous + current, 0);

        expect(result).toBe(531);
    });
});

describe('remove', () => {
    it('should create another empty Dict when given an empty Dict', () => {
        const dict = Dict();
        const result = remove(dict, 'foo');

        expect(result).toEqual({});
        expect(result).not.toBe(dict);
    });

    it('should create a copy of a given Dict when a key not in the Dict is removed', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);
        const result = remove(dict, 'hello');

        expect(result).toEqual(dict);
        expect(result).not.toBe(dict);
    });

    it('should create a copy of a given Dict with the requested entry remove when a key in the Dict', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);
        const result = remove(dict, 'foo');

        expect(result).toEqual({ bar: 69, baz: 420 });
    });
});

describe('set', () => {
    it('should create a new Dict containing a given entry', () => {
        const dict = Dict([Pair('foo', 42)]);
        const result = set(dict, 'bar', 69);

        expect(result).toEqual({ foo: 42, bar: 69 });
        expect(result).not.toBe(dict);
    });

    it('should create a new Dict containing a given entry when given a Dict that already has a value for the key', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);
        const result = set(dict, 'baz', 469);

        expect(result).toEqual({ foo: 42, bar: 69, baz: 469 });
        expect(result).not.toBe(dict);
    });
});

describe('size', () => {
    it('should return 0 when given an empty Dict', () => {
        const dict = Dict();

        expect(size(dict)).toBe(0);
    });

    it('should return the number of entries when given a non-empty Dict', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);

        expect(size(dict)).toBe(3);
    });
});

describe('some', () => {
    it('should return false when given an empty Dict', () => {
        const dict = Dict();

        expect(some(dict, () => false)).toBe(false);
    });

    it('should return true if any one of the elements returns true', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);

        expect(some(dict, (value) => value < 50)).toBe(true);
    });

    it('should return false if every one of the elements returns false', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);

        expect(some(dict, (value) => isString(value))).toBe(false);
    });
});

describe('values', () => {
    it('should create an empty array when given an empty Dict', () => {
        const dict = Dict();

        expect(values(dict)).toEqual([]);
    });

    it('should create an array containing each value in the Dict', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);
        const result = values(dict);

        expect(result.length).toBe(3);
        expect(result).toContain(42);
        expect(result).toContain(69);
        expect(result).toContain(420);
    });
});
