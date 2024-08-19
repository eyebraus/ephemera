import {
    Defined,
    FailureWithContent,
    Fault,
    Result,
    SuccessWithoutContent,
    isArray,
    isBoolean,
    isFailure,
    isNotUndefinedOrEmpty,
    isNumber,
    isString,
    isSuccess,
} from '@ephemera/stdlib';
import { ErrorCode } from '../../constants/error';
import { ItemBuilder } from './item-builder';
import { ValidationOptions, getFault, mergeOptions } from './options';
import { validateItemBuilder } from './validate';

export class FieldBuilder<TCode extends string | ErrorCode> {
    name: string;
    options?: ValidationOptions<TCode>;
    predicates: ((value: unknown) => Result<void, Fault<TCode>>)[];

    constructor(name: string, options?: ValidationOptions<TCode>) {
        this.name = name;
        this.options = options;
        this.predicates = [];
    }

    everyItemShouldPass(
        this: FieldBuilder<TCode>,
        configure: (builder: ItemBuilder<TCode>) => void,
        options?: ValidationOptions<TCode>,
    ): FieldBuilder<TCode> {
        // Initialize and configure the item builder
        const mergedOptions = mergeOptions(this.options, options);
        const itemBuilder = new ItemBuilder(mergedOptions);
        configure(itemBuilder);

        // Chain validation for all items into predicates
        this.predicates.push((value) => {
            if (!isArray(value)) {
                return FailureWithContent(getFault(mergedOptions));
            }

            const results = value.map((item) => validateItemBuilder(itemBuilder, item as Defined));

            return results.find(isFailure) ?? SuccessWithoutContent();
        });

        return this;
    }

    isRequired(this: FieldBuilder<TCode>, options?: ValidationOptions<TCode>): FieldBuilder<TCode> {
        this.predicates.push((value: unknown) =>
            !!value ? SuccessWithoutContent() : FailureWithContent(getFault(this.options, options)),
        );

        return this;
    }

    shouldBeArray(this: FieldBuilder<TCode>, options?: ValidationOptions<TCode>): FieldBuilder<TCode> {
        this.predicates.push((value: unknown) =>
            isArray(value) ? SuccessWithoutContent() : FailureWithContent(getFault(this.options, options)),
        );

        return this;
    }

    shouldBeBoolean(this: FieldBuilder<TCode>, options?: ValidationOptions<TCode>): FieldBuilder<TCode> {
        this.predicates.push((value: unknown) =>
            isBoolean(value) ? SuccessWithoutContent() : FailureWithContent(getFault(this.options, options)),
        );

        return this;
    }

    shouldBeGreaterThan(
        this: FieldBuilder<TCode>,
        bound: number,
        options?: ValidationOptions<TCode>,
    ): FieldBuilder<TCode> {
        this.predicates.push((value: unknown) =>
            isNumber(value) && value > bound
                ? SuccessWithoutContent()
                : FailureWithContent(getFault(this.options, options)),
        );

        return this;
    }

    shouldBeGreaterThanOrEqualTo(
        this: FieldBuilder<TCode>,
        bound: number,
        options?: ValidationOptions<TCode>,
    ): FieldBuilder<TCode> {
        this.predicates.push((value: unknown) =>
            isNumber(value) && value >= bound
                ? SuccessWithoutContent()
                : FailureWithContent(getFault(this.options, options)),
        );

        return this;
    }

    shouldBeIn(this: FieldBuilder<TCode>, values: unknown[], options?: ValidationOptions<TCode>): FieldBuilder<TCode> {
        this.predicates.push((value: unknown) =>
            values.some((otherValue) => value === otherValue)
                ? SuccessWithoutContent()
                : FailureWithContent(getFault(this.options, options)),
        );

        return this;
    }

    shouldBeLessThan(
        this: FieldBuilder<TCode>,
        bound: number,
        options?: ValidationOptions<TCode>,
    ): FieldBuilder<TCode> {
        this.predicates.push((value: unknown) =>
            isNumber(value) && value < bound
                ? SuccessWithoutContent()
                : FailureWithContent(getFault(this.options, options)),
        );

        return this;
    }

    shouldBeLessThanOrEqualTo(
        this: FieldBuilder<TCode>,
        bound: number,
        options?: ValidationOptions<TCode>,
    ): FieldBuilder<TCode> {
        this.predicates.push((value: unknown) =>
            isNumber(value) && value <= bound
                ? SuccessWithoutContent()
                : FailureWithContent(getFault(this.options, options)),
        );

        return this;
    }

    shouldBeLongerThan(
        this: FieldBuilder<TCode>,
        bound: number,
        options?: ValidationOptions<TCode>,
    ): FieldBuilder<TCode> {
        this.predicates.push((value: unknown) =>
            (isArray(value) || isString(value)) && value.length < bound
                ? SuccessWithoutContent()
                : FailureWithContent(getFault(this.options, options)),
        );

        return this;
    }

    shouldBeNumber(this: FieldBuilder<TCode>, options?: ValidationOptions<TCode>): FieldBuilder<TCode> {
        this.predicates.push((value: unknown) =>
            isNumber(value) ? SuccessWithoutContent() : FailureWithContent(getFault(this.options, options)),
        );

        return this;
    }

    shouldBeShorterThan(
        this: FieldBuilder<TCode>,
        bound: number,
        options?: ValidationOptions<TCode>,
    ): FieldBuilder<TCode> {
        this.predicates.push((value: unknown) =>
            (isArray(value) || isString(value)) && value.length > bound
                ? SuccessWithoutContent()
                : FailureWithContent(getFault(this.options, options)),
        );

        return this;
    }

    shouldBeString(this: FieldBuilder<TCode>, options?: ValidationOptions<TCode>): FieldBuilder<TCode> {
        this.predicates.push((value: unknown) =>
            isString(value) ? SuccessWithoutContent() : FailureWithContent(getFault(this.options, options)),
        );

        return this;
    }

    shouldEqual(this: FieldBuilder<TCode>, expected: unknown, options?: ValidationOptions<TCode>): FieldBuilder<TCode> {
        this.predicates.push((value: unknown) =>
            value === expected ? SuccessWithoutContent() : FailureWithContent(getFault(this.options, options)),
        );

        return this;
    }

    shouldMatch(this: FieldBuilder<TCode>, pattern: RegExp, options?: ValidationOptions<TCode>): FieldBuilder<TCode> {
        this.predicates.push((value: unknown) =>
            isString(value) && pattern.test(value)
                ? SuccessWithoutContent()
                : FailureWithContent(getFault(this.options, options)),
        );

        return this;
    }

    shouldNotBeBlank(this: FieldBuilder<TCode>, options?: ValidationOptions<TCode>): FieldBuilder<TCode> {
        this.predicates.push((value: unknown) =>
            isString(value) && isNotUndefinedOrEmpty(value)
                ? SuccessWithoutContent()
                : FailureWithContent(getFault(this.options, options)),
        );

        return this;
    }

    someItemShouldPass(
        this: FieldBuilder<TCode>,
        configure: (builder: ItemBuilder<TCode>) => void,
        options?: ValidationOptions<TCode>,
    ): FieldBuilder<TCode> {
        // Initialize and configure the item builder
        const mergedOptions = mergeOptions(this.options, options);
        const itemBuilder = new ItemBuilder(mergedOptions);
        configure(itemBuilder);

        // Chain validation for all items into predicates
        this.predicates.push((value) => {
            if (!isArray(value)) {
                return FailureWithContent(getFault(mergedOptions));
            }

            const results = value.map((item) => validateItemBuilder(itemBuilder, item as Defined));

            return results.find(isSuccess) ?? FailureWithContent(getFault(mergedOptions));
        });

        return this;
    }
}
