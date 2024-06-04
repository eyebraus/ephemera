import { Doc, HiddenDocKeys, ImmutableDocKeys } from './doc';
import { IdTokenSet } from './id';

export type OrganizationDoc = Doc & {
    description: string;
    name: string;
};

export type OrganizationEntity = Omit<OrganizationDoc, HiddenDocKeys>;
export type OrganizationId = IdTokenSet<'organization'>;
export type OrganizationProperties = Omit<OrganizationEntity, ImmutableDocKeys>;
