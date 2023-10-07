/**
 * A utility type for mapping a union type of string literals, called names, to values of another string union type. In
 * the default case, names and values are the same union type, which is frequently used as an alternative to enums.
 */
export type Union<TName extends string, TValue extends string = TName> = { [value in TName]: TValue };

/**
 * A union where the values are capitalized versions of the names.
 */
export type CapitalizedUnion<TName extends string, TValue extends string = TName> = Union<TName, Capitalize<TValue>>;

/**
 * A union where the values are lower-cased versions of the names.
 */
export type LowercasedUnion<TName extends string, TValue extends string = TName> = Union<TName, Lowercase<TValue>>;

/**
 * A union where the values are uncapitalized versions of the names.
 */
export type UncapitalizedUnion<TName extends string, TValue extends string = TName> = Union<
    TName,
    Uncapitalize<TValue>
>;

/**
 * A union where the values are upper-cased versions of the names.
 */
export type UppercasedUnion<TName extends string, TValue extends string = TName> = Union<TName, Uppercase<TValue>>;
