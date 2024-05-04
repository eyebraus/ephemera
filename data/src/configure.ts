import {
    TemplateFieldId,
    TemplateFieldModel,
    TemplateId,
    TemplateModel,
    TemplateVersionId,
    TemplateVersionModel,
} from '@ephemera/model';
import { Factory, Lifetime, Profile } from '@ephemera/provide';
import { createClient } from 'redis';
import { RedisRepository, RedisRepositoryBuilder, redisRepositoryBuilder } from './access/redis-repository';
import { templateRepository } from './object-model/template';
import { templateFieldRepository } from './object-model/template-field';
import { templateVersionRepository } from './object-model/template-version';

const redisClient: Factory<DataProfile, ReturnType<typeof createClient>> = (_, getSetting) => {
    const url = getSetting('redis/url').asRequiredValue();

    return createClient({ url });
};

export interface DataProfile {
    redisClient: ReturnType<typeof createClient>;
    redisRepositoryBuilder: RedisRepositoryBuilder;
    templateFieldRepository: RedisRepository<TemplateFieldModel, TemplateFieldId>;
    templateRepository: RedisRepository<TemplateModel, TemplateId>;
    templateVersionRepository: RedisRepository<TemplateVersionModel, TemplateVersionId>;
}

export const dataProfile: Profile<DataProfile> = {
    redisClient: [Lifetime.Static, redisClient],
    redisRepositoryBuilder,
    templateFieldRepository,
    templateRepository,
    templateVersionRepository,
};
