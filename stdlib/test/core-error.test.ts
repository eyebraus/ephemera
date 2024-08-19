import { CoreError, FaultCode, isCoreError, isCoreErrorProperties, Union } from '../src';

type TestCode = 'Bar' | 'Foo' | FaultCode;

const TestCode: Union<TestCode> = {
    ...FaultCode,
    Bar: 'Bar',
    Foo: 'Foo',
};

describe('CoreError', () => {
    describe('constructor', () => {
        it('should correctly initialize when given a message', () => {
            const { code, inner, message, stack } = new CoreError('hello');

            expect(code).toBe(FaultCode.Unknown);
            expect(inner).toBeUndefined();
            expect(message).toBe('hello');
            expect(stack).toBeDefined();
        });

        it('should correctly initialize when given a code and message', () => {
            const { code, inner, message, stack } = new CoreError(TestCode.Foo, 'hello');

            expect(code).toBe(TestCode.Foo);
            expect(inner).toBeUndefined();
            expect(message).toBe('hello');
            expect(stack).toBeDefined();
        });

        it('should correctly initialize when given a code, message, and inner fault', () => {
            const { code, inner, message, stack } = new CoreError(TestCode.Foo, 'hello', {
                code: TestCode.Bar,
                message: 'goodbye',
            });

            expect(code).toBe(TestCode.Foo);
            expect(inner).toBeDefined();
            expect(inner?.code).toBe(TestCode.Bar);
            expect(inner?.message).toBe('goodbye');
            expect(message).toBe('hello');
            expect(stack).toBeDefined();
        });
    });

    describe('toObject', () => {
        it('should correctly copy the error into an object when error is only given a message', () => {
            const { code, inner, message, stack } = new CoreError('hello').toObject();

            expect(code).toBe(FaultCode.Unknown);
            expect(inner).toBeUndefined();
            expect(message).toBe('hello');
            expect(stack).toBeDefined();
        });

        it('should correctly copy the error into an object when error is given a code and message', () => {
            const { code, inner, message, stack } = new CoreError(TestCode.Foo, 'hello').toObject();

            expect(code).toBe(TestCode.Foo);
            expect(inner).toBeUndefined();
            expect(message).toBe('hello');
            expect(stack).toBeDefined();
        });

        it('should correctly copy the error into an object when error is given a code, message, and inner fault', () => {
            const { code, inner, message, stack } = new CoreError(TestCode.Foo, 'hello', {
                code: TestCode.Bar,
                message: 'goodbye',
            }).toObject();

            expect(code).toBe(TestCode.Foo);
            expect(inner).toBeDefined();
            expect(inner?.code).toBe(TestCode.Bar);
            expect(inner?.message).toBe('goodbye');
            expect(message).toBe('hello');
            expect(stack).toBeDefined();
        });
    });
});

describe('isCoreError', () => {
    it('should return true for something created via the CoreError constructor', () => {
        const error = new CoreError('hello');

        expect(isCoreError(error)).toBe(true);
    });

    it('should return false for something that is CoreErrorProperties but was not created via the CoreError constructor', () => {
        const error = new CoreError(TestCode.Foo, 'hello', { code: TestCode.Bar, message: 'goodbye' }).toObject();

        expect(isCoreError(error)).toBe(false);
    });

    it('should return false for unrelated types', () => {
        expect(isCoreError(false)).toBe(false);
        expect(isCoreError(123456)).toBe(false);
        expect(isCoreError('error')).toBe(false);
        expect(isCoreError([123456])).toBe(false);
        expect(isCoreError({ error: 123456 })).toBe(false);
    });
});

describe('isCoreErrorProperties', () => {
    it('should return true for something created via the CoreError constructor', () => {
        const error1 = new CoreError('hello');
        const error2 = new CoreError(TestCode.Foo, 'hello');
        const error3 = new CoreError(TestCode.Foo, 'hello', { code: TestCode.Bar, message: 'goodbye' });

        expect(isCoreErrorProperties(error1)).toBe(true);
        expect(isCoreErrorProperties(error2)).toBe(true);
        expect(isCoreErrorProperties(error3)).toBe(true);
    });

    it('should return true for something that is CoreErrorProperties but was not created via the CoreError constructor', () => {
        const error1 = new CoreError('hello').toObject();
        const error2 = new CoreError(TestCode.Foo, 'hello').toObject();
        const error3 = new CoreError(TestCode.Foo, 'hello', { code: TestCode.Bar, message: 'goodbye' }).toObject();

        expect(isCoreErrorProperties(error1)).toBe(true);
        expect(isCoreErrorProperties(error2)).toBe(true);
        expect(isCoreErrorProperties(error3)).toBe(true);
    });

    it('should return false if code is not defined or of the wrong type', () => {
        const undefinedCode = { inner: { code: TestCode.Bar, message: 'goodbye' }, message: 'hello' };
        const wrongTypeCode1 = { code: false, inner: { code: TestCode.Bar, message: 'goodbye' }, message: 'hello' };
        const wrongTypeCode2 = { code: 123456, inner: { code: TestCode.Bar, message: 'goodbye' }, message: 'hello' };
        const wrongTypeCode3 = { code: [123456], inner: { code: TestCode.Bar, message: 'goodbye' }, message: 'hello' };

        const wrongTypeCode4 = {
            code: { value: TestCode.Bar },
            inner: { code: TestCode.Bar, message: 'goodbye' },
            message: 'hello',
        };

        expect(isCoreErrorProperties(undefinedCode)).toBe(false);
        expect(isCoreErrorProperties(wrongTypeCode1)).toBe(false);
        expect(isCoreErrorProperties(wrongTypeCode2)).toBe(false);
        expect(isCoreErrorProperties(wrongTypeCode3)).toBe(false);
        expect(isCoreErrorProperties(wrongTypeCode4)).toBe(false);
    });

    it('should return false if inner is of the wrong type', () => {
        const wrongTypeInner1 = { code: TestCode.Foo, inner: 123456, message: 'hello' };
        const wrongTypeInner2 = { code: TestCode.Foo, inner: { code: TestCode.Bar }, message: 'hello' };

        expect(isCoreErrorProperties(wrongTypeInner1)).toBe(false);
        expect(isCoreErrorProperties(wrongTypeInner2)).toBe(false);
    });

    it('should return false if message is not defined or of the wrong type', () => {
        const undefinedMessage = { code: TestCode.Foo, inner: { code: TestCode.Bar, message: 'goodbye' } };

        const wrongTypeMessage1 = {
            code: TestCode.Foo,
            inner: { code: TestCode.Bar, message: 'goodbye' },
            message: false,
        };

        const wrongTypeMessage2 = {
            code: TestCode.Foo,
            inner: { code: TestCode.Bar, message: 'goodbye' },
            message: 123456,
        };

        const wrongTypeMessage3 = {
            code: TestCode.Foo,
            inner: { code: TestCode.Bar, message: 'goodbye' },
            message: [123456],
        };

        const wrongTypeMessage4 = {
            code: TestCode.Foo,
            inner: { code: TestCode.Bar, message: 'goodbye' },
            message: { value: TestCode.Bar },
        };

        expect(isCoreErrorProperties(undefinedMessage)).toBe(false);
        expect(isCoreErrorProperties(wrongTypeMessage1)).toBe(false);
        expect(isCoreErrorProperties(wrongTypeMessage2)).toBe(false);
        expect(isCoreErrorProperties(wrongTypeMessage3)).toBe(false);
        expect(isCoreErrorProperties(wrongTypeMessage4)).toBe(false);
    });

    it('should return false if inner is of the wrong type', () => {
        const wrongTypeStack1 = { code: TestCode.Foo, message: 'hello', stack: 123456 };
        const wrongTypeStack2 = { code: TestCode.Foo, message: 'hello', stack: { code: TestCode.Bar } };

        expect(isCoreErrorProperties(wrongTypeStack1)).toBe(false);
        expect(isCoreErrorProperties(wrongTypeStack2)).toBe(false);
    });

    it('should return false for unrelated types', () => {
        expect(isCoreErrorProperties(false)).toBe(false);
        expect(isCoreErrorProperties(123456)).toBe(false);
        expect(isCoreErrorProperties('error')).toBe(false);
        expect(isCoreErrorProperties([123456])).toBe(false);
        expect(isCoreErrorProperties({ error: 123456 })).toBe(false);
    });
});
