import { Lifetime, ProviderConfiguration } from '@ephemera/provide';
import { createClient } from 'redis';
import { Repository } from 'redis-om';
import { templateRepository } from './object-model/template';
import { templateFieldRepository } from './object-model/template-field';
import { templateVersionRepository } from './object-model/template-version';

export interface DataProfile {
    redisClient: ReturnType<typeof createClient>;
    templateFieldRepository: Repository;
    templateRepository: Repository;
    templateVersionRepository: Repository;
}

export const dataConfiguration: ProviderConfiguration<DataProfile> = {
    redisClient: [Lifetime.Static, (): ReturnType<typeof createClient> => createClient()],
    templateFieldRepository,
    templateRepository,
    templateVersionRepository,
};
