import { TemplateEntity, TemplateProperties } from '@ephemera/model';
import { ErrorBody, ErrorCode, PagedResponseBody, ResponseBody } from '@ephemera/services';
import { Union } from '@ephemera/stdlib';

type CoreTemplateResponse = TemplateEntity & { url: string };

export type TemplateErrorCode =
    | ErrorCode
    | 'InvalidDescription'
    | 'InvalidFieldAllowed'
    | 'InvalidFieldDescription'
    | 'InvalidFieldId'
    | 'InvalidFieldKind'
    | 'InvalidFieldName'
    | 'InvalidFieldRequired'
    | 'InvalidName'
    | 'MissingDescription'
    | 'MissingFieldAllowed'
    | 'MissingFieldDescription'
    | 'MissingFieldId'
    | 'MissingFieldKind'
    | 'MissingFieldName'
    | 'MissingFieldRequired'
    | 'MissingFields'
    | 'MissingName';

export const TemplateErrorCode: Union<TemplateErrorCode> = {
    ...ErrorCode,
    InvalidDescription: 'InvalidDescription',
    InvalidFieldAllowed: 'InvalidFieldAllowed',
    InvalidFieldDescription: 'InvalidFieldDescription',
    InvalidFieldId: 'InvalidFieldId',
    InvalidFieldKind: 'InvalidFieldKind',
    InvalidFieldName: 'InvalidFieldName',
    InvalidFieldRequired: 'InvalidFieldRequired',
    InvalidName: 'InvalidName',
    MissingDescription: 'MissingDescription',
    MissingFieldAllowed: 'MissingFieldAllowed',
    MissingFieldDescription: 'MissingFieldDescription',
    MissingFieldId: 'MissingFieldId',
    MissingFieldKind: 'MissingFieldKind',
    MissingFieldName: 'MissingFieldName',
    MissingFieldRequired: 'InvalidFieldRequired',
    MissingFields: 'MissingFields',
    MissingName: 'MissingName',
};

export type DeleteTemplateResponseBody = ErrorBody<TemplateErrorCode>;
export type GetTemplateResponseBody = ResponseBody<CoreTemplateResponse, TemplateErrorCode>;
export type ListTemplatesResponseBody = PagedResponseBody<CoreTemplateResponse, TemplateErrorCode>;
export type PatchTemplateRequestBody = Partial<TemplateProperties>;
export type PatchTemplateResponseBody = ResponseBody<CoreTemplateResponse, TemplateErrorCode>;
export type PutTemplateRequestBody = TemplateProperties;
export type PutTemplateResponseBody = ResponseBody<CoreTemplateResponse, TemplateErrorCode>;
