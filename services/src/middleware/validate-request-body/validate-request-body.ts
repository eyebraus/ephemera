import { Defined, Dict, isFailure } from '@ephemera/stdlib';
import { RequestHandler } from 'express';
import { ErrorCode } from '../../constants/error';
import { ErrorBody } from '../../contracts/body';
import { ItemBuilder } from './item-builder';
import { ValidationOptions } from './options';
import { validateItemBuilder } from './validate';

export const validateRequestBody =
    <TCode extends string | ErrorCode>(
        configure: (builder: ItemBuilder<TCode>) => void,
        options?: ValidationOptions<TCode>,
    ): RequestHandler<never, ErrorBody<TCode>, Dict<Defined>, never, never> =>
    (request, response, next) => {
        const { body } = request;

        // Initialize and configure the item builder
        const builder = new ItemBuilder(options);
        configure(builder);

        // Run validation. Fail if failure; continue if not
        const result = validateItemBuilder(builder, body);

        if (isFailure(result)) {
            const { content } = result;
            response.status(400).send(content);

            return;
        }

        next();
    };
