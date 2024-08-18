import {
    compact,
    density,
    isFull,
    isNothing,
    isSomething,
    isVacant,
    Maybe,
    Nothing,
    Something,
    sparsity,
    tryToUnwrap,
    tryToUnwrapMany,
    unwrap,
    unwrapMany,
    wrap,
    wrapMany,
} from '../src';

describe('Maybe', () => {
    it('should return Nothing when not given a value', () => {
        const maybe = Maybe();

        expect(isNothing(maybe)).toBe(true);
        expect(isSomething(maybe)).toBe(false);
    });

    it('should return Nothing when given undefined as a value', () => {
        const maybe = Maybe(undefined);

        expect(isNothing(maybe)).toBe(true);
        expect(isSomething(maybe)).toBe(false);
    });

    it('should return Something when given a defined value', () => {
        const maybe = Maybe(42);

        expect(isNothing(maybe)).toBe(false);
        expect(isSomething(maybe)).toBe(true);
    });
});

describe('Nothing', () => {
    it('should return Nothing', () => {
        const nothing = Nothing();

        expect(isNothing(nothing)).toBe(true);
    });
});

describe('Something', () => {
    it('should return Something', () => {
        const something = Something(42);

        expect(isSomething(something)).toBe(true);
    });
});

describe('compact', () => {
    it('should return an empty array when given an empty array', () => {
        const result = compact([]);

        expect(result).toEqual([]);
    });

    it('should return an array containing the Somethings in the original array', () => {
        const result = compact([Maybe(42), Maybe(69), Maybe<number>(), Maybe(420), Maybe<number>(undefined)]);

        expect(result.length).toBe(3);
        expect(result).toContainEqual(Something(42));
        expect(result).toContainEqual(Something(69));
        expect(result).toContainEqual(Something(420));
    });
});

describe('density', () => {
    it('should return 0 when given an empty array', () => {
        const result = density([]);

        expect(result).toBe(0);
    });

    it('should return the number of Somethings in the original array', () => {
        const result = density([Maybe(42), Maybe(69), Maybe<number>(), Maybe(420), Maybe<number>(undefined)]);

        expect(result).toBe(3);
    });
});

describe('isFull', () => {
    it('should return false when given an empty array', () => {
        const result = isFull([]);

        expect(result).toBe(false);
    });

    it('should return false when given an array that has one or more Nothings', () => {
        const result = isFull([Maybe(42), Maybe(69), Maybe(), Maybe(420), Maybe(undefined)]);

        expect(result).toBe(false);
    });

    it('should return true when given an array that has only Somethings', () => {
        const result = isFull([Maybe(42), Maybe(69), Maybe(420)]);

        expect(result).toBe(true);
    });
});

describe('isVacant', () => {
    it('should return true when given an empty array', () => {
        const result = isVacant([]);

        expect(result).toBe(true);
    });

    it('should return false when given an array that has one or more Somethings', () => {
        const result = isVacant([Maybe(42), Maybe(69), Maybe(), Maybe(420), Maybe(undefined)]);

        expect(result).toBe(false);
    });

    it('should return true when given an array that has only Nothings', () => {
        const result = isVacant([Maybe(), Maybe(undefined)]);

        expect(result).toBe(true);
    });
});

describe('sparsity', () => {
    it('should return 0 when given an empty array', () => {
        const result = sparsity([]);

        expect(result).toBe(0);
    });

    it('should return the number of Nothings in the original array', () => {
        const result = sparsity([Maybe(42), Maybe(69), Maybe<number>(), Maybe(420), Maybe<number>(undefined)]);

        expect(result).toBe(2);
    });
});

describe('tryToUnwrap', () => {
    it('should return the contained value when given a Something', () => {
        const value = tryToUnwrap(Maybe(42));

        expect(value).toBe(42);
    });

    it('should return undefined when given a Nothing', () => {
        const value = tryToUnwrap(Maybe());

        expect(value).toBeUndefined();
    });
});

describe('tryToUnwrapMany', () => {
    it('should return an empty array when given no arguments', () => {
        const result = tryToUnwrapMany();

        expect(result).toEqual([]);
    });

    it('should return an array of values or undefineds', () => {
        const result = tryToUnwrapMany(Maybe(42), Maybe(69), Maybe<number>(), Maybe(420), Maybe<number>(undefined));

        expect(result).toEqual([42, 69, undefined, 420, undefined]);
    });
});

describe('unwrap', () => {
    it('should return the contained value when given a Something', () => {
        const value = unwrap(Maybe(42));

        expect(value).toBe(42);
    });

    it('should throw when given a Nothing', () => {
        expect(() => unwrap(Maybe())).toThrow();
    });
});

describe('unwrapMany', () => {
    it('should return an empty array when given no arguments', () => {
        const result = unwrapMany();

        expect(result).toEqual([]);
    });

    it('should return an array of unwrapped values when given Somethings', () => {
        const result = unwrapMany(Maybe(42), Maybe(69), Maybe(420));

        expect(result).toEqual([42, 69, 420]);
    });

    it('should throw if any Nothings are given', () => {
        expect(() => unwrapMany(Maybe(42), Maybe(69), Maybe<number>(), Maybe(420), Maybe<number>(undefined)));
    });
});

describe('wrap', () => {
    it('should return Nothing when given undefined as a value', () => {
        const maybe = wrap(undefined);

        expect(isNothing(maybe)).toBe(true);
        expect(isSomething(maybe)).toBe(false);
    });

    it('should return Something when given a defined value', () => {
        const maybe = wrap(42);

        expect(isNothing(maybe)).toBe(false);
        expect(isSomething(maybe)).toBe(true);
    });
});

describe('wrapMany', () => {
    it('should return an empty array when given no arguments', () => {
        const result = wrapMany();

        expect(result).toEqual([]);
    });

    it('should return an array of wrapped values when given arguments', () => {
        const result = wrapMany(42, 69, undefined, 420, undefined);

        expect(result).toEqual([Something(42), Something(69), Nothing(), Something(420), Nothing()]);
    });
});
