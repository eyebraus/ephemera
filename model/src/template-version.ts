import { IdTokenSet } from './id';

export type TemplateVersionId = IdTokenSet<'template' | 'versionNumber'>;

export interface TemplateVersionModel {
    createdAt: Date;
    entityId: string;
    id: string;
    modifiedAt: Date;
    versionNumber: number;
}
