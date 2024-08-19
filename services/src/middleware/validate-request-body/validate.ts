import { Defined, Dict, Fault, Result, SuccessWithoutContent, isFailure } from '@ephemera/stdlib';
import { ErrorCode } from '../../constants/error';
import { FieldBuilder } from './field-builder';
import { ItemBuilder } from './item-builder';

export const validateFieldBuilder = <TCode extends string | ErrorCode>(
    builder: FieldBuilder<TCode>,
    value: unknown,
): Result<void, Fault<TCode>> => {
    const results = builder.predicates.map((predicate) => predicate(value));

    return results.find(isFailure) ?? SuccessWithoutContent();
};

export const validateItemBuilder = <TCode extends string | ErrorCode>(
    builder: ItemBuilder<TCode>,
    value: Dict<Defined>,
): Result<void, Fault<TCode>> => {
    const results = builder.predicates.map((predicate) => predicate(value));

    return results.find(isFailure) ?? SuccessWithoutContent();
};
