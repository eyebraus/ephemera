'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MaterialThemeProvider } from '@mui/material/styles';
import * as React from 'react';
import darkTheme from '../../theme/dark';

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
        <AppRouterCacheProvider>
            <MaterialThemeProvider theme={darkTheme}>
                <CssBaseline />
                {children}
            </MaterialThemeProvider>
        </AppRouterCacheProvider>
    );
};

export default ThemeProvider;
