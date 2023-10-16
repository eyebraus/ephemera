'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MaterialThemeProvider } from '@mui/material/styles';
import * as React from 'react';
import darkTheme from '../../theme/dark';
import EmotionCacheProvider, { EmotionCacheOptions } from './emotion-cache-provider';

const cacheProviderOptions: EmotionCacheOptions = {
    key: 'mui',
};

/**
 * Properties for {@link ThemeProvider}.
 */
export interface ThemeProviderProps {
    children: React.ReactNode;
}

/**
 * Provides Material UI theming information to application.
 * @param props properties
 * @returns Theme provider
 */
const ThemeProvider: React.FC<ThemeProviderProps> = (props) => {
    const { children } = props;

    return (
        <EmotionCacheProvider options={cacheProviderOptions}>
            <MaterialThemeProvider theme={darkTheme}>
                <CssBaseline />
                {children}
            </MaterialThemeProvider>
        </EmotionCacheProvider>
    );
};

export default ThemeProvider;
