import { Union } from '@ephemera/stdlib';

export type ErrorCode = 'NotFound';

export const ErrorCode: Union<ErrorCode> = {
    NotFound: 'NotFound',
};
