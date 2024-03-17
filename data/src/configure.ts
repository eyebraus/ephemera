import { TemplateFieldId, TemplateId, TemplateVersionId } from '@ephemera/model';
import { Lifetime, ProviderConfiguration } from '@ephemera/provide';
import { createClient } from 'redis';
import { RedisRepository, RedisRepositoryBuilder, redisRepositoryBuilder } from './access/redis-repository';
import { TemplateModel, templateRepository } from './object-model/template';
import { TemplateFieldModel, templateFieldRepository } from './object-model/template-field';
import { TemplateVersionModel, templateVersionRepository } from './object-model/template-version';

export interface DataProfile {
    redisClient: ReturnType<typeof createClient>;
    redisRepositoryBuilder: RedisRepositoryBuilder;
    templateFieldRepository: RedisRepository<TemplateFieldModel, TemplateFieldId>;
    templateRepository: RedisRepository<TemplateModel, TemplateId>;
    templateVersionRepository: RedisRepository<TemplateVersionModel, TemplateVersionId>;
}

export const dataConfiguration: ProviderConfiguration<DataProfile> = {
    redisClient: [Lifetime.Static, (): ReturnType<typeof createClient> => createClient()],
    redisRepositoryBuilder,
    templateFieldRepository,
    templateRepository,
    templateVersionRepository,
};
