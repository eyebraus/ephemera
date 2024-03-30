import { LowercasedUnion } from '@ephemera/stdlib';

type QueryParameterValue = 'count' | 'skip';

export type QueryParameter = Capitalize<QueryParameterValue>;

export const QueryParameter: LowercasedUnion<QueryParameter> = {
    Count: 'count',
    Skip: 'skip',
};

export const DefaultPageSize = 200;
