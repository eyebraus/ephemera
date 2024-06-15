import { OrganizationEntity, OrganizationProperties } from '@ephemera/model';
import { ErrorBody, ErrorCode, PagedResponseBody, ResponseBody } from '@ephemera/services';
import { Union } from '@ephemera/stdlib';

type CoreOrganizationResponse = OrganizationEntity & { url: string };

export type OrganizationErrorCode =
    | ErrorCode
    | 'InvalidDescription'
    | 'InvalidName'
    | 'MissingDescription'
    | 'MissingName';

export const OrganizationErrorCode: Union<OrganizationErrorCode> = {
    ...ErrorCode,
    InvalidDescription: 'InvalidDescription',
    InvalidName: 'InvalidName',
    MissingDescription: 'MissingDescription',
    MissingName: 'MissingName',
};

export type DeleteOrganizationResponseBody = ErrorBody<OrganizationErrorCode>;
export type GetOrganizationResponseBody = ResponseBody<CoreOrganizationResponse, OrganizationErrorCode>;
export type ListOrganizationsResponseBody = PagedResponseBody<CoreOrganizationResponse, OrganizationErrorCode>;
export type PatchOrganizationRequestBody = Partial<OrganizationProperties>;
export type PatchOrganizationResponseBody = ResponseBody<CoreOrganizationResponse, OrganizationErrorCode>;
export type PutOrganizationRequestBody = OrganizationProperties;
export type PutOrganizationResponseBody = ResponseBody<CoreOrganizationResponse, OrganizationErrorCode>;
