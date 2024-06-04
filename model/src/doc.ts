export type Doc = {
    createdAt: Date;
    deletedAt?: Date;
    docId: string;
    id: string;
    isDeleted?: boolean;
    modifiedAt: Date;
};

export type HiddenDocKeys = Exclude<keyof Doc, 'id'>;
export type ImmutableDocKeys = Exclude<keyof Doc, 'deletedAt' | 'isDeleted' | 'modifiedAt'>;
export type ImmutableVersionedDocKeys = Exclude<keyof VersionedDoc, 'deletedAt' | 'isDeleted' | 'modifiedAt'>;

export type LinkedToDoc<TName extends string> = {
    [name in `${TName}DocId` | `${TName}Id`]: string;
};

export type LinkedToDocVersion<TName extends string> = LinkedToDoc<TName> & {
    [name in `${TName}Version`]: number;
};

export type VersionedDoc = Doc & {
    version: number;
};
