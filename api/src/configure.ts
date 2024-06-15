import { DataProfile, dataProfile } from '@ephemera/data';
import { Profile } from '@ephemera/provide';
import { Router } from 'express';
import { organizationRouter } from './routes/organization';
import { templateRouter } from './routes/template';
import { ticketRouter } from './routes/ticket';

export interface ApiProfile extends DataProfile {
    organizationRouter: Router;
    templateRouter: Router;
    ticketRouter: Router;
}

export const apiProfile: Profile<ApiProfile> = {
    ...dataProfile,
    organizationRouter,
    templateRouter,
    ticketRouter,
};
