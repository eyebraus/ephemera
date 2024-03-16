import { TemplateModel } from '@ephemera/data';
import { PagedResponseBody } from './common';

type CoreTemplateProperties = Omit<TemplateModel, 'createdAt' | 'entityId' | 'modifiedAt'>;
type CoreTemplateResponse = CoreTemplateProperties & { url: string };

export type GetTemplateResponseBody = CoreTemplateResponse;
export type ListTemplatesResponseBody = PagedResponseBody<CoreTemplateResponse>;
export type PutTemplateRequestBody = Omit<CoreTemplateProperties, 'id'>;
export type PutTemplateResponseBody = CoreTemplateResponse;
