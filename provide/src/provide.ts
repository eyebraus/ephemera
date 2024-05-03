import { isArray, isObject, isUndefinedOrWhiteSpace, once } from '@ephemera/stdlib';
import { ConfigurationBuilder, build } from './configuration';
import {
    ConfigurationEntry,
    ConfigurationSetting,
    Factory,
    Lifetime,
    Profile,
    ProfileEntry,
    isLifetime,
} from './types';

type ProvideBundle<TProfileInstance extends NonNullable<unknown>> = {
    getSetting: (key: string) => ConfigurationSetting;
    getUnit: <TKey extends keyof TProfileInstance>(key: TKey) => TProfileInstance[TKey];
};

const getFactory = <TProfile extends NonNullable<unknown>, TReturn>(
    value: ProfileEntry<TProfile, TReturn>,
): Factory<TProfile, TReturn> => (isLifetimeSpecified(value) ? value[1] : value);

const getLifetime = <TProfile extends NonNullable<unknown>, TReturn>(value: ProfileEntry<TProfile, TReturn>) =>
    isLifetimeSpecified(value) ? value[0] : Lifetime.Transient;

const getValueFromConfiguration = (
    configuration: ConfigurationEntry,
    key: string,
    originalKey: string,
): ConfigurationSetting => {
    // If we're at the end of the path, create the configuration setting
    if (isUndefinedOrWhiteSpace(key)) {
        return ConfigurationSetting(configuration, originalKey);
    }

    // Otherwise, attempt to index further into the configuration depending on its kind
    const [token, ...remaining] = key.split('/');
    const nextKey = remaining.join('/');

    if (isArray(configuration)) {
        const index = parseInt(token);
        const nextConfiguration = isNaN(index) || !configuration[index] ? {} : configuration[index];

        return getValueFromConfiguration(nextConfiguration, nextKey, originalKey);
    }

    if (isObject(configuration)) {
        return getValueFromConfiguration(configuration[token] ?? {}, nextKey, originalKey);
    }

    return getValueFromConfiguration({}, nextKey, originalKey);
};

const isLifetimeSpecified = <TProfile extends NonNullable<unknown>, TReturn>(
    value: ProfileEntry<TProfile, TReturn>,
): value is [Lifetime, Factory<TProfile, TReturn>] => Array.isArray(value) && isLifetime(value[0]);

// TODO: check for cycles
export const provide = async <TProfileInstance extends NonNullable<unknown>>(
    profile: Profile<TProfileInstance>,
    configure?: (builder: ConfigurationBuilder) => void,
): Promise<ProvideBundle<TProfileInstance>> => {
    // Build configuration based on optional specification
    const configurationBuilder = new ConfigurationBuilder();
    configure?.(configurationBuilder);
    const configuration = await build(configurationBuilder);

    // Create functions to return as bundle
    const getSetting = (key: string): ConfigurationSetting => getValueFromConfiguration(configuration, key, key);

    const getUnit = <TKey extends keyof TProfileInstance>(key: TKey): TProfileInstance[typeof key] => {
        const entry = profile[key];
        const lifetime = getLifetime(entry);

        // Make factory singleton if static lifetime was specified
        const factory = lifetime === Lifetime.Static ? once(getFactory(entry)) : getFactory(entry);

        return factory(getUnit, getSetting);
    };

    return { getSetting, getUnit };
};
