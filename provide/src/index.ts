import { Union, once } from '@ephemera/stdlib';

type ProviderConfigurationEntry<TProfile extends NonNullable<unknown>, TReturn> =
    | Factory<TProfile, TReturn>
    | [Lifetime, Factory<TProfile, TReturn>];

export type Factory<TProfile extends NonNullable<unknown>, TReturn> = (
    provide: <TKey extends keyof TProfile>(key: TKey) => TProfile[TKey],
) => TReturn;

export type Lifetime = 'Static' | 'Transient';

export const Lifetime: Union<Lifetime> = {
    Static: 'Static',
    Transient: 'Transient',
};

export type Provider<TProfile extends NonNullable<unknown>, TKey extends keyof TProfile> = (
    key: TKey,
) => TProfile[TKey];

export type ProviderConfiguration<TProfile extends NonNullable<unknown>> = {
    [name in keyof TProfile]: ProviderConfigurationEntry<TProfile, TProfile[name]>;
};

const getFactory = <TProfile extends NonNullable<unknown>, TReturn>(
    value: ProviderConfigurationEntry<TProfile, TReturn>,
): Factory<TProfile, TReturn> => (isLifetimeSpecified(value) ? value[1] : value);

const getLifetime = <TProfile extends NonNullable<unknown>, TReturn>(
    value: ProviderConfigurationEntry<TProfile, TReturn>,
) => (isLifetimeSpecified(value) ? value[0] : Lifetime.Transient);

// TODO: check for cycles
export const createProvider = <TProfile extends NonNullable<unknown>>(
    configuration: ProviderConfiguration<TProfile>,
): (<TKey extends keyof TProfile>(key: TKey) => TProfile[TKey]) => {
    const provider = <TKey extends keyof TProfile>(key: TKey): TProfile[typeof key] => {
        const entry = configuration[key];
        const lifetime = getLifetime(entry);

        // Make factory singleton if static lifetime was specified
        const factory = lifetime === Lifetime.Static ? once(getFactory(entry)) : getFactory(entry);

        return factory(provider);
    };

    return provider;
};

const isLifetimeSpecified = <TProfile extends NonNullable<unknown>, TReturn>(
    value: ProviderConfigurationEntry<TProfile, TReturn>,
): value is [Lifetime, Factory<TProfile, TReturn>] => Array.isArray(value) && isLifetime(value[0]);

export const isLifetime = (value: unknown): value is Lifetime =>
    value === Lifetime.Static || value === Lifetime.Transient;
