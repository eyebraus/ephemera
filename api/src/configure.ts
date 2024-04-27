import { DataProfile, dataProfile } from '@ephemera/data';
import { Profile } from '@ephemera/provide';
import { Router } from 'express';
import { templateRouter } from './routes/template';
import { templateVersionRouter } from './routes/template-version';

export interface ApiProfile extends DataProfile {
    templateRouter: Router;
    templateVersionRouter: Router;
}

export const apiProfile: Profile<ApiProfile> = {
    ...dataProfile,
    templateRouter,
    templateVersionRouter,
};
