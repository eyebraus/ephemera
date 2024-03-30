import { TemplateFieldModel, TemplateVersionModel } from '@ephemera/model';
import { ErrorBody, ErrorCode, PagedResponseBody, ResponseBody } from '@ephemera/services';
import { Union } from '@ephemera/stdlib';

type CoreTemplateFieldProperties = Omit<TemplateFieldModel, 'entityId'>;

interface TemplateVersionRequestProperties extends Omit<TemplateVersionModel, 'createdAt' | 'entityId' | 'modifiedAt'> {
    fields: CoreTemplateFieldProperties[];
}

interface TemplateVersionResponseProperties extends TemplateVersionRequestProperties {
    url: string;
}

export type TemplateVersionErrorCode =
    | ErrorCode
    | 'InvalidFieldAllowed'
    | 'InvalidFieldDescription'
    | 'InvalidFieldId'
    | 'InvalidFieldKind'
    | 'InvalidFieldName'
    | 'InvalidFieldRequired'
    | 'InvalidVersionNumber'
    | 'MissingFieldAllowed'
    | 'MissingFieldDescription'
    | 'MissingFieldId'
    | 'MissingFieldKind'
    | 'MissingFieldName'
    | 'MissingFieldRequired'
    | 'MissingFields'
    | 'MissingVersionNumber';

export const TemplateVersionErrorCode: Union<TemplateVersionErrorCode> = {
    ...ErrorCode,
    InvalidFieldAllowed: 'InvalidFieldAllowed',
    InvalidFieldDescription: 'InvalidFieldDescription',
    InvalidFieldId: 'InvalidFieldId',
    InvalidFieldKind: 'InvalidFieldKind',
    InvalidFieldName: 'InvalidFieldName',
    InvalidFieldRequired: 'InvalidFieldRequired',
    InvalidVersionNumber: 'InvalidVersionNumber',
    MissingFieldAllowed: 'MissingFieldAllowed',
    MissingFieldDescription: 'MissingFieldDescription',
    MissingFieldId: 'MissingFieldId',
    MissingFieldKind: 'MissingFieldKind',
    MissingFieldName: 'MissingFieldName',
    MissingFieldRequired: 'InvalidFieldRequired',
    MissingFields: 'MissingFields',
    MissingVersionNumber: 'MissingVersionNumber',
};

export type DeleteTemplateVersionResponseBody = ErrorBody<TemplateVersionErrorCode>;
export type GetTemplateVersionResponseBody = ResponseBody<TemplateVersionResponseProperties, TemplateVersionErrorCode>;

export type ListTemplateVersionsResponseBody = PagedResponseBody<
    TemplateVersionResponseProperties,
    TemplateVersionErrorCode
>;

export type PutTemplateVersionRequestBody = Omit<TemplateVersionRequestProperties, 'id'>;
export type PutTemplateVersionResponseBody = ResponseBody<TemplateVersionResponseProperties, TemplateVersionErrorCode>;
