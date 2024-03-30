import { Union } from '@ephemera/stdlib';

export type ErrorCode = 'InvalidRequest' | 'NotFound';

export const ErrorCode: Union<ErrorCode> = {
    InvalidRequest: 'InvalidRequest',
    NotFound: 'NotFound',
};

export const ErrorMessage: { [key in ErrorCode]: string } = {
    InvalidRequest: 'Request is not valid.',
    NotFound: 'Resource not found.',
};
