import { TicketEntity, TicketProperties } from '@ephemera/model';
import { ErrorBody, ErrorCode, PagedResponseBody, ResponseBody } from '@ephemera/services';
import { Union } from '@ephemera/stdlib';

type CoreTicketResponse = TicketEntity & { url: string };

export type TicketErrorCode =
    | ErrorCode
    | 'InvalidTemplate'
    | 'InvalidTemplateVersion'
    | 'InvalidTitle'
    | 'InvalidValueField'
    | 'InvalidValues'
    | 'InvalidValueValue'
    | 'MissingTemplate'
    | 'MissingTitle'
    | 'MissingValueField'
    | 'MissingValues'
    | 'MissingValueValue';

export const TicketErrorCode: Union<TicketErrorCode> = {
    ...ErrorCode,
    InvalidTemplate: 'InvalidTemplate',
    InvalidTemplateVersion: 'InvalidTemplateVersion',
    InvalidTitle: 'InvalidTitle',
    InvalidValueField: 'InvalidValueField',
    InvalidValues: 'InvalidValues',
    InvalidValueValue: 'InvalidValueValue',
    MissingTemplate: 'MissingTemplate',
    MissingTitle: 'MissingTitle',
    MissingValueField: 'MissingValueField',
    MissingValues: 'MissingValues',
    MissingValueValue: 'MissingValueValue',
};

export type DeleteTicketResponseBody = ErrorBody<TicketErrorCode>;
export type GetTicketResponseBody = ResponseBody<CoreTicketResponse, TicketErrorCode>;
export type ListTicketsResponseBody = PagedResponseBody<CoreTicketResponse, TicketErrorCode>;
export type PatchTicketRequestBody = Partial<TicketProperties>;
export type PatchTicketResponseBody = ResponseBody<CoreTicketResponse, TicketErrorCode>;
export type PostTicketRequestBody = TicketProperties;
export type PostTicketResponseBody = ResponseBody<CoreTicketResponse, TicketErrorCode>;
export type PutTicketRequestBody = TicketProperties;
export type PutTicketResponseBody = ResponseBody<CoreTicketResponse, TicketErrorCode>;
