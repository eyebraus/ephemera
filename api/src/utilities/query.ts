import { isString } from '@ephemera/stdlib';
import { Request } from 'express';
import { DefaultPageSize, QueryParameter } from '../constants/query';

export const getCountFromQuery = (request: Request): number => {
    const stringValue = request.query[QueryParameter.Count];

    if (!isString(stringValue)) {
        return DefaultPageSize;
    }

    const value = parseInt(stringValue);

    if (isNaN(value)) {
        return DefaultPageSize;
    }

    return value;
};

export const getSkipFromQuery = (request: Request): number => {
    const stringValue = request.query[QueryParameter.Skip];

    if (!isString(stringValue)) {
        return 0;
    }

    const value = parseInt(stringValue);

    if (isNaN(value)) {
        return 0;
    }

    return value;
};
