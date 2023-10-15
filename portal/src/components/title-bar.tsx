'use client';
import { AutoStoriesOutlined } from '@mui/icons-material';
import { AppBar, Toolbar, Typography } from '@mui/material';
import React from 'react';

const TitleBar: React.FC = () => {
    return (
        <AppBar position="sticky">
            <Toolbar>
                <AutoStoriesOutlined />
                <Typography variant="h6">Ephemera</Typography>
            </Toolbar>
        </AppBar>
    );
};

export default TitleBar;
