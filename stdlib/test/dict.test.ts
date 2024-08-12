import { Dict, entries, Pair } from '../src';

describe('Dict', () => {
    it('should create an empty object when not given any arguments', () => {
        const dict = Dict();

        expect(dict).toEqual({});
    });

    it('should create a Dict representation of a string-value pair array when given one as an argument', () => {
        const dict = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);

        expect(dict).toEqual({
            foo: 42,
            bar: 69,
            baz: 420,
        });
    });

    it('should create a copy of an existing Dict when given one as an argument', () => {
        const dict1 = Dict([Pair('foo', 42), Pair('bar', 69), Pair('baz', 420)]);
        const dict2 = Dict(dict1);

        expect(dict2).toEqual({
            foo: 42,
            bar: 69,
            baz: 420,
        });

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
