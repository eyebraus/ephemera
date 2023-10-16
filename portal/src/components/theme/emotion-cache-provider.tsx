'use client';

import type { EmotionCache, Options as OptionsOfCreateCache } from '@emotion/cache';
import createCache from '@emotion/cache';
import { CacheProvider as DefaultCacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';
import React from 'react';

// Note: all code in this file adapted from:
//      https://github.com/mui/material-ui/blob/master/examples/material-ui-nextjs-ts/src/components/ThemeRegistry/EmotionCache.tsx

/**
 * Type definition for Options passed to createCache() from 'import createCache from "@emotion/cache"'.
 */
export type EmotionCacheOptions = Omit<OptionsOfCreateCache, 'insertionPoint'>;

/**
 * Properties for {@link EmotionCacheProvider}.
 */
export type EmotionCacheProviderProps = React.PropsWithChildren<{
    /**
     * Emotion cache provider implementation to use. When not given, {@link DefaultCacheProvider} is used.
     */
    CacheProvider?: (props: { value: EmotionCache; children: React.ReactNode }) => React.JSX.Element | null;

    /**
     * Options passed to createCache() from 'import createCache from "@emotion/cache"'.
     */
    options: EmotionCacheOptions;
}>;

/**
 * Wrapper around Emotion cache provider.
 * @param props properties.
 * @returns Emotion cache provider
 */
const EmotionCacheProvider: React.FC<EmotionCacheProviderProps> = (props) => {
    const { options, CacheProvider = DefaultCacheProvider, children } = props;

    const [registry] = React.useState(() => {
        const cache = createCache(options);
        cache.compat = true;
        const prevInsert = cache.insert;
        let inserted: { name: string; isGlobal: boolean }[] = [];
        cache.insert = (...args) => {
            const [selector, serialized] = args;
            if (cache.inserted[serialized.name] === undefined) {
                inserted.push({
                    name: serialized.name,
                    isGlobal: !selector,
                });
            }
            return prevInsert(...args);
        };
        const flush = () => {
            const prevInserted = inserted;
            inserted = [];
            return prevInserted;
        };
        return { cache, flush };
    });

    useServerInsertedHTML(() => {
        const inserted = registry.flush();
        if (inserted.length === 0) {
            return null;
        }
        let styles = '';
        let dataEmotionAttribute = registry.cache.key;

        const globals: {
            name: string;
            style: string;
        }[] = [];

        inserted.forEach(({ name, isGlobal }) => {
            const style = registry.cache.inserted[name];

            if (typeof style !== 'boolean') {
                if (isGlobal) {
                    globals.push({ name, style });
                } else {
                    styles += style;
                    dataEmotionAttribute += ` ${name}`;
                }
            }
        });

        return (
            <React.Fragment>
                {globals.map(({ name, style }) => (
                    <style
                        key={name}
                        data-emotion={`${registry.cache.key}-global ${name}`}
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: style }}
                    />
                ))}
                {styles && (
                    <style
                        data-emotion={dataEmotionAttribute}
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{ __html: styles }}
                    />
                )}
            </React.Fragment>
        );
    });

    return <CacheProvider value={registry.cache}>{children}</CacheProvider>;
};

export default EmotionCacheProvider;
