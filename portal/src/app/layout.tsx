import { Box, Drawer, SxProps, Theme } from '@mui/material';
import { Metadata } from 'next';
import React from 'react';
import TitleBar from '../components/chrome/title-bar';
import ThemeProvider from '../components/theme/theme-provider';

const drawerStyles: SxProps<Theme> = {
    [`& .MuiDrawer-paper`]: {
        top: 64,
        width: 240,
    },
};

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

                    <Drawer sx={drawerStyles} variant="permanent">
                        aaa
                    </Drawer>

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
