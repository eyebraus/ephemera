import { TemplateModel } from '@ephemera/model';
import { ErrorBody, ErrorCode, PagedResponseBody, ResponseBody } from '@ephemera/services';
import { Union } from '@ephemera/stdlib';

type CoreTemplateProperties = Omit<TemplateModel, 'createdAt' | 'entityId' | 'modifiedAt'>;
type CoreTemplateResponse = CoreTemplateProperties & { url: string };

export type TemplateErrorCode = ErrorCode | 'InvalidDescription' | 'InvalidName' | 'MissingDescription' | 'MissingName';

export const TemplateErrorCode: Union<TemplateErrorCode> = {
    ...ErrorCode,
    InvalidDescription: 'InvalidDescription',
    InvalidName: 'InvalidName',
    MissingDescription: 'MissingDescription',
    MissingName: 'MissingName',
};

export type DeleteTemplateResponseBody = ErrorBody<TemplateErrorCode>;
export type GetTemplateResponseBody = ResponseBody<CoreTemplateResponse, TemplateErrorCode>;
export type ListTemplatesResponseBody = PagedResponseBody<CoreTemplateResponse, TemplateErrorCode>;
export type PatchTemplateRequestBody = Omit<CoreTemplateProperties, 'id'>;
export type PatchTemplateResponseBody = ResponseBody<CoreTemplateResponse, TemplateErrorCode>;
export type PutTemplateRequestBody = Omit<CoreTemplateProperties, 'id'>;
export type PutTemplateResponseBody = ResponseBody<CoreTemplateResponse, TemplateErrorCode>;
