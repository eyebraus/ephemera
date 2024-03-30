import { Fault } from '@ephemera/stdlib';
import { ErrorCode, ErrorMessage } from '../../constants/error';

export interface ValidationOptions<TCode extends string | ErrorCode> {
    code?: TCode;
    message?: string;
}

export const getFault = <TCode extends string | ErrorCode>(
    option: ValidationOptions<TCode> | undefined,
    ...additionalOptions: (ValidationOptions<TCode> | undefined)[]
): Fault<TCode> => {
    const { code, message } = mergeOptions(option, ...additionalOptions);

    return {
        code: code ?? (ErrorCode.InvalidRequest as TCode),
        message: message ?? ErrorMessage.InvalidRequest,
    };
};

export const mergeOptions = <TCode extends string | ErrorCode>(
    option: ValidationOptions<TCode> | undefined,
    ...additionalOptions: (ValidationOptions<TCode> | undefined)[]
): ValidationOptions<TCode> => ({
    code: additionalOptions
        .map((option) => option?.code)
        .reduce((previousCode, code) => code ?? previousCode, option?.code),
    message: additionalOptions
        .map((option) => option?.message)
        .reduce((previousMessage, message) => message ?? previousMessage, option?.message),
});
