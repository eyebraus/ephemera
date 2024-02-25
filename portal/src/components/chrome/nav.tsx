'use client';

import { Home } from '@mui/icons-material';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, SxProps, Theme } from '@mui/material';
import React from 'react';

const drawerStyles: SxProps<Theme> = {
    [`& .MuiDrawer-paper`]: {
        top: 64,
        width: 240,
    },
};

/**
 * Navigation panel.
 * @returns Navigation panel
 */
const Nav: React.FC = () => {
    return (
        <Drawer sx={drawerStyles} variant="permanent">
            <List>
                <ListItem key="home">
                    <ListItemIcon>
                        <Home />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItem>
            </List>
        </Drawer>
    );
};

export default Nav;
