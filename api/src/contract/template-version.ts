import { TemplateFieldModel, TemplateVersionModel } from '@ephemera/model';
import { Union } from '@ephemera/stdlib';
import { ErrorCode } from '../constants/error-code';
import { ErrorBody, PagedResponseBody, ResponseBody } from './common';

type CoreTemplateFieldProperties = Omit<TemplateFieldModel, 'entityId'>;

interface CoreTemplateVersionProperties extends Omit<TemplateVersionModel, 'createdAt' | 'entityId' | 'modifiedAt'> {
    fields: CoreTemplateFieldProperties[];
}

type CoreTemplateVersionResponse = CoreTemplateVersionProperties & { url: string };

export type TemplateVersionErrorCode = ErrorCode | 'InvalidFields';

export const TemplateVersionErrorCode: Union<TemplateVersionErrorCode> = {
    InvalidFields: 'InvalidFields',
    NotFound: 'NotFound',
};

export type DeleteTemplateVersionResponseBody = ErrorBody<TemplateVersionErrorCode>;
export type GetTemplateVersionResponseBody = ResponseBody<CoreTemplateVersionResponse, TemplateVersionErrorCode>;
export type ListTemplateVersionsResponseBody = PagedResponseBody<CoreTemplateVersionResponse, TemplateVersionErrorCode>;
export type PutTemplateVersionRequestBody = Omit<CoreTemplateVersionProperties, 'id'>;
export type PutTemplateVersionResponseBody = ResponseBody<CoreTemplateVersionResponse, TemplateVersionErrorCode>;
