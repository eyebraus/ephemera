import { LowercasedUnion } from '@ephemera/stdlib';
import { IdTokenSet } from './id';

/**
 * Types
 */

export type TemplateFieldId = IdTokenSet<'field' | 'template' | 'versionNumber'>;

type TemplateFieldKindKey = 'Boolean' | 'Date' | 'DateTime' | 'Number' | 'String' | 'Text' | 'Time';

export type TemplateFieldKind = Lowercase<TemplateFieldKindKey>;

export const TemplateFieldKind: LowercasedUnion<TemplateFieldKindKey> = {
    Boolean: 'boolean',
    Date: 'date',
    DateTime: 'datetime',
    Number: 'number',
    String: 'string',
    Text: 'text',
    Time: 'time',
};

export interface TemplateFieldModel {
    allowed?: string[];
    description: string;
    entityId: string;
    id: string;
    kind: TemplateFieldKind;
    name: string;
    required: boolean;
}

/**
 * Type guards
 */

export const isTemplateFieldKind = (value: unknown): value is TemplateFieldKind =>
    value === TemplateFieldKind.Boolean ||
    value === TemplateFieldKind.Date ||
    value === TemplateFieldKind.DateTime ||
    value === TemplateFieldKind.Number ||
    value === TemplateFieldKind.String ||
    value === TemplateFieldKind.Text ||
    value === TemplateFieldKind.Time;
