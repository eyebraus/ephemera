import { Fault } from '@ephemera/stdlib';

/**
 * Body of an error response.
 */
export type ErrorBody<TErrorCode extends string> = Fault<TErrorCode>;

/**
 * Body containing a page of data or an error response.
 */
export type PagedResponseBody<TValue, TErrorCode extends string> =
    | {
          count: number;
          start: number;
          values: TValue[];
      }
    | ErrorBody<TErrorCode>;

/**
 * Body containing data or an error response.
 */
export type ResponseBody<TBody, TErrorCode extends string> = TBody | ErrorBody<TErrorCode>;
