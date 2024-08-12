import { FaultCode, Union } from '@ephemera/stdlib';

export type ErrorCode = 'InvalidRequest' | 'NotFound' | FaultCode;

export const ErrorCode: Union<ErrorCode> = {
    InvalidRequest: 'InvalidRequest',
    NotFound: 'NotFound',
    Unknown: 'Unknown',
};

export const ErrorMessage: { [key in ErrorCode]: string } = {
    InvalidRequest: 'Request is not valid.',
    NotFound: 'Resource not found.',
    Unknown: 'Unknown',
};
