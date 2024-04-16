import {
    TemplateFieldId,
    TemplateFieldModel,
    TemplateId,
    TemplateModel,
    TemplateVersionId,
    TemplateVersionModel,
} from '@ephemera/model';
import { Lifetime, ProviderConfiguration } from '@ephemera/provide';
import { createClient } from 'redis';
import { RedisRepository, RedisRepositoryBuilder, redisRepositoryBuilder } from './access/redis-repository';
import { templateRepository } from './object-model/template';
import { templateFieldRepository } from './object-model/template-field';
import { templateVersionRepository } from './object-model/template-version';

export interface DataProfile {
    redisClient: ReturnType<typeof createClient>;
    redisRepositoryBuilder: RedisRepositoryBuilder;
    templateFieldRepository: RedisRepository<TemplateFieldModel, TemplateFieldId>;
    templateRepository: RedisRepository<TemplateModel, TemplateId>;
    templateVersionRepository: RedisRepository<TemplateVersionModel, TemplateVersionId>;
}

export const dataConfiguration: ProviderConfiguration<DataProfile> = {
    // TODO: make Redis URL configurable
    redisClient: [Lifetime.Static, (): ReturnType<typeof createClient> => createClient({ url: 'redis://redis:6379' })],
    // redisClient: [Lifetime.Static, (): ReturnType<typeof createClient> => createClient()],
    redisRepositoryBuilder,
    templateFieldRepository,
    templateRepository,
    templateVersionRepository,
};
