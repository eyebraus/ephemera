import { Dict, Fault, Result } from '@ephemera/stdlib';
import { ErrorCode } from '../../constants/error';
import { FieldBuilder } from './field-builder';
import { ValidationOptions, mergeOptions } from './options';
import { validateFieldBuilder } from './validate';

export class ItemBuilder<TCode extends string | ErrorCode> {
    options?: ValidationOptions<TCode>;
    predicates: ((value: Dict) => Result<void, Fault<TCode>>)[];

    constructor(options?: ValidationOptions<TCode>) {
        this.options = options;
        this.predicates = [];
    }

    addField(
        name: string,
        configure: (builder: FieldBuilder<TCode>) => void,
        options?: ValidationOptions<TCode>,
    ): this {
        // Initialize and configure the field builder
        const fieldBuilder = new FieldBuilder(name, mergeOptions(this.options, options));
        configure(fieldBuilder);

        // Chain validation for this field into predicates
        this.predicates.push((value) => validateFieldBuilder(fieldBuilder, value[name]));

        return this;
    }
}
