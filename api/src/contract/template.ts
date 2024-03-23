import { TemplateModel } from '@ephemera/model';
import { Union } from '@ephemera/stdlib';
import { ErrorCode } from '../constants/error-code';
import { ErrorBody, PagedResponseBody, ResponseBody } from './common';

type CoreTemplateProperties = Omit<TemplateModel, 'createdAt' | 'entityId' | 'modifiedAt'>;
type CoreTemplateResponse = CoreTemplateProperties & { url: string };

export type TemplateErrorCode = ErrorCode | 'InvalidDescription' | 'InvalidName';

export const TemplateErrorCode: Union<TemplateErrorCode> = {
    ...ErrorCode,
    InvalidDescription: 'InvalidDescription',
    InvalidName: 'InvalidName',
};

export type DeleteTemplateResponseBody = ErrorBody<TemplateErrorCode>;
export type GetTemplateResponseBody = ResponseBody<CoreTemplateResponse, TemplateErrorCode>;
export type ListTemplatesResponseBody = PagedResponseBody<CoreTemplateResponse, TemplateErrorCode>;
export type PatchTemplateRequestBody = Omit<CoreTemplateProperties, 'id'>;
export type PatchTemplateResponseBody = ResponseBody<CoreTemplateResponse, TemplateErrorCode>;
export type PutTemplateRequestBody = Omit<CoreTemplateProperties, 'id'>;
export type PutTemplateResponseBody = ResponseBody<CoreTemplateResponse, TemplateErrorCode>;
