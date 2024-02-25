import { Box, SxProps, Theme } from '@mui/material';
import { Metadata } from 'next';
import React from 'react';
import Nav from '../components/chrome/nav';
import TitleBar from '../components/chrome/title-bar';
import ThemeProvider from '../components/theme/theme-provider';

const frameStyles: SxProps<Theme> = {
    left: 240,
    position: 'fixed',
    top: 64,
};

/**
 * Properties for {@link RootLayout}.
 */
export interface RootLayoutProps {
    children: React.ReactNode;
}

/**
 * Root layout of the Ephemera portal.
 * @param props properties
 * @returns Root layout
 */
const RootLayout: React.FC<RootLayoutProps> = (props: RootLayoutProps) => {
    const { children } = props;

    return (
        <html lang="en">
            <body>
                <ThemeProvider>
                    <TitleBar />
                    <Nav />
                    <Box sx={frameStyles}>{children}</Box>
                </ThemeProvider>
            </body>
        </html>
    );
};

export default RootLayout;

export const metadata: Metadata = {
    description: 'Build your world for your tabletop RPG',
    title: 'Ephemera',
};
