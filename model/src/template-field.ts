import { IdTokenSet } from './id';

export type TemplateFieldId = IdTokenSet<'field' | 'template' | 'versionNumber'>;

export interface TemplateFieldModel {
    allowed?: string[];
    description: string;
    entityId: string;
    id: string;
    kind: string;
    name: string;
    required: boolean;
}
