import { TemplateFieldModel, TemplateVersionModel } from '@ephemera/data';
import { PagedResponseBody } from './common';

type CoreTemplateFieldProperties = Omit<TemplateFieldModel, 'entityId'>;

interface CoreTemplateVersionProperties extends Omit<TemplateVersionModel, 'createdAt' | 'entityId' | 'modifiedAt'> {
    fields: CoreTemplateFieldProperties[];
}

type CoreTemplateVersionResponse = CoreTemplateVersionProperties & { url: string };

export type GetTemplateVersionResponseBody = CoreTemplateVersionResponse;
export type ListTemplateVersionsResponseBody = PagedResponseBody<CoreTemplateVersionResponse>;
export type PutTemplateVersionRequestBody = Omit<CoreTemplateVersionProperties, 'id'>;
export type PutTemplateVersionResponseBody = CoreTemplateVersionResponse;
