import { HiddenDocKeys, ImmutableVersionedDocKeys, LinkedToDocVersion, VersionedDoc } from './doc';
import { IdTokenSet } from './id';
import { TicketValueEntity, TicketValueProperties } from './ticket-value';

export type TicketDoc = LinkedToDocVersion<'template'> &
    VersionedDoc & {
        title: string;
    };

export type TicketEntity = Omit<TicketDoc, HiddenDocKeys | 'templateDocId'> & {
    templateId: string;
    values: TicketValueEntity[];
};

export type TicketId = IdTokenSet<'organization' | 'ticket'>;

export type TicketProperties = Omit<TicketEntity, ImmutableVersionedDocKeys> & {
    values: TicketValueProperties[];
};
