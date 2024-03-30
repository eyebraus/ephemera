import { IdTokenSet } from './id';

export type TemplateId = IdTokenSet<'template'>;

export interface TemplateModel {
    createdAt: Date;
    description: string;
    entityId: string;
    id: string;
    modifiedAt: Date;
    name: string;
}
