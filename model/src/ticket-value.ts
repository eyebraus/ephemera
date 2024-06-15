import { Doc, HiddenDocKeys, ImmutableDocKeys } from './doc';
import { IdTokenSet } from './id';

export type TicketValueDoc = Doc & {
    field: string;
    value: string;
};

export type TicketValueEntity = Omit<TicketValueDoc, HiddenDocKeys>;
export type TicketValueId = IdTokenSet<'field' | 'organization' | 'ticket'>;
export type TicketValueProperties = Omit<TicketValueEntity, ImmutableDocKeys>;
