export interface PagedResponseBody<TValue> {
    count: number;
    start: number;
    value: TValue[];
}
