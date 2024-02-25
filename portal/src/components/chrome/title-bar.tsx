'use client';

import { AutoStoriesOutlined } from '@mui/icons-material';
import { AppBar, SxProps, Theme, Toolbar, Typography } from '@mui/material';
import React from 'react';

const appBarStyles: SxProps<Theme> = {
    zIndex: (theme) => theme.zIndex.drawer + 1,
};

/**
 * Title bar.
 * @returns Title bar
 */
const TitleBar: React.FC = () => {
    return (
        <AppBar position="sticky" sx={appBarStyles}>
            <Toolbar>
                <AutoStoriesOutlined />
                <Typography variant="h6">Ephemera</Typography>
            </Toolbar>
        </AppBar>
    );
};

export default TitleBar;
