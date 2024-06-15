import { LowercasedUnion } from '@ephemera/stdlib';
import { Doc, HiddenDocKeys, ImmutableDocKeys } from './doc';
import { IdTokenSet } from './id';

/**
 * Types
 */

export type TemplateFieldDoc = Doc & {
    allowed?: string[];
    description: string;
    id: string;
    kind: TemplateFieldKind;
    name: string;
    required: boolean;
};

export type TemplateFieldEntity = Omit<TemplateFieldDoc, HiddenDocKeys>;

export type TemplateFieldId = IdTokenSet<'field' | 'organization' | 'template'>;

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

export type TemplateFieldProperties = Omit<TemplateFieldEntity, ImmutableDocKeys> & { id: string };

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
