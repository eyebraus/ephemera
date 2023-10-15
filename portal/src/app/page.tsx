import { Grid, Typography } from '@mui/material';
import React from 'react';

/**
 * Index page of the Ephemera portal.
 * @returns Index page
 */
const Index: React.FC = () => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h1">Welcome</Typography>
            </Grid>

            <Grid item xs={12}>
                <Typography variant="body1">You&apos;re in the write place</Typography>
            </Grid>
        </Grid>
    );
};

export default Index;
