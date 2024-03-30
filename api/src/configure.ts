import { DataProfile, dataConfiguration } from '@ephemera/data';
import { ProviderConfiguration } from '@ephemera/provide';
import { Router } from 'express';
import { templateRouter } from './routes/template';
import { templateVersionRouter } from './routes/template-version';

export interface ApiProfile extends DataProfile {
    templateRouter: Router;
    templateVersionRouter: Router;
}

export const apiConfiguration: ProviderConfiguration<ApiProfile> = {
    ...dataConfiguration,
    templateRouter,
    templateVersionRouter,
};
