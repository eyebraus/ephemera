import { HiddenDocKeys, ImmutableVersionedDocKeys, VersionedDoc } from './doc';
import { IdTokenSet } from './id';
import { TemplateFieldEntity, TemplateFieldProperties } from './template-field';

export type TemplateDoc = VersionedDoc & {
    description: string;
    name: string;
};

export type TemplateEntity = Omit<TemplateDoc, HiddenDocKeys> & { fields: TemplateFieldEntity[] };
export type TemplateId = IdTokenSet<'organization' | 'template'>;

export type TemplateProperties = Omit<TemplateEntity, ImmutableVersionedDocKeys | 'fields'> & {
    fields: TemplateFieldProperties[];
};
