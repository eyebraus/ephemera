import { CoreError, OneOrMany, Union, isArray, isObject, isString } from '@ephemera/stdlib';

/**
 * Types
 */

export type Configuration = {
    [key: string]: ConfigurationEntry;
};

export type ConfigurationEntry = OneOrMany<Configuration> | string;

export type ConfigurationSetting = {
    asOptionalSection: () => Exclude<ConfigurationEntry, string> | undefined;
    asOptionalValue: () => string | undefined;
    asRequiredSection: () => Exclude<ConfigurationEntry, string>;
    asRequiredValue: () => string;
};

export type Factory<TProfileInstance extends NonNullable<unknown>, TReturn> = (
    getUnit: <TKey extends keyof TProfileInstance>(key: TKey) => TProfileInstance[TKey],
    getSetting: (key: string) => ConfigurationSetting,
) => TReturn;

export type Lifetime = 'Static' | 'Transient';

export const Lifetime: Union<Lifetime> = {
    Static: 'Static',
    Transient: 'Transient',
};

export type Profile<TProfileInstance extends NonNullable<unknown>> = {
    [name in keyof TProfileInstance]: ProfileEntry<TProfileInstance, TProfileInstance[name]>;
};

export type ProfileEntry<TProfileInstance extends NonNullable<unknown>, TReturn> =
    | Factory<TProfileInstance, TReturn>
    | [Lifetime, Factory<TProfileInstance, TReturn>];

export type Task<TProfileInstance extends NonNullable<unknown>> = (
    getUnit: <TKey extends keyof TProfileInstance>(key: TKey) => TProfileInstance[TKey],
    getSetting: (key: string) => ConfigurationSetting,
) => Promise<void>;

/**
 * Initializers
 */

export const ConfigurationSetting = (entry: ConfigurationEntry, key: string): ConfigurationSetting => {
    const asSection = isArray(entry) || isObject(entry) ? entry : undefined;
    const asValue = isString(entry) ? entry : undefined;

    return {
        asOptionalSection: () => asSection,
        asOptionalValue: () => asValue,

        asRequiredSection: () => {
            if (!asSection) {
                throw new CoreError(`Could not find configuration section with key "${key}".`);
            }

            return asSection;
        },

        asRequiredValue: () => {
            if (!asValue) {
                throw new CoreError(`Could not find configuration value with key "${key}".`);
            }

            return asValue;
        },
    };
};

/**
 * Type guards
 */

export const isLifetime = (value: unknown): value is Lifetime =>
    value === Lifetime.Static || value === Lifetime.Transient;
