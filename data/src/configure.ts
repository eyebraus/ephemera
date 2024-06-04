import {
    OrganizationDoc,
    OrganizationId,
    TemplateDoc,
    TemplateFieldDoc,
    TemplateFieldId,
    TemplateId,
    TicketDoc,
    TicketId,
    TicketValueDoc,
    TicketValueId,
} from '@ephemera/model';
import { Factory, Lifetime, Profile } from '@ephemera/provide';
import { createClient } from 'redis';
import { RedisRepository, RedisRepositoryBuilder, redisRepositoryBuilder } from './access/redis-repository';
import { OrganizationEntityRepository, organizationEntityRepository } from './entities/organization';
import { TemplateEntityRepository, templateEntityRepository } from './entities/template';
import { TicketEntityRepository, ticketEntityRepository } from './entities/ticket';
import { organizationDocRepository } from './redis/organization';
import { templateDocRepository } from './redis/template';
import { templateFieldDocRepository } from './redis/template-field';
import { ticketDocRepository } from './redis/ticket';
import { ticketValueDocRepository } from './redis/ticket-value';

const redisClient: Factory<DataProfile, ReturnType<typeof createClient>> = (_, getSetting) => {
    const url = getSetting('redis/url').asRequiredValue();

    return createClient({ url });
};

export interface DataProfile {
    organizationDocRepository: RedisRepository<OrganizationDoc, OrganizationId>;
    organizationEntityRepository: OrganizationEntityRepository;
    redisClient: ReturnType<typeof createClient>;
    redisRepositoryBuilder: RedisRepositoryBuilder;
    templateDocRepository: RedisRepository<TemplateDoc, TemplateId>;
    templateEntityRepository: TemplateEntityRepository;
    templateFieldDocRepository: RedisRepository<TemplateFieldDoc, TemplateFieldId>;
    ticketDocRepository: RedisRepository<TicketDoc, TicketId>;
    ticketEntityRepository: TicketEntityRepository;
    ticketValueDocRepository: RedisRepository<TicketValueDoc, TicketValueId>;
}

export const dataProfile: Profile<DataProfile> = {
    organizationDocRepository: [Lifetime.Static, organizationDocRepository],
    organizationEntityRepository,
    redisClient: [Lifetime.Static, redisClient],
    redisRepositoryBuilder,
    templateDocRepository: [Lifetime.Static, templateDocRepository],
    templateEntityRepository,
    templateFieldDocRepository: [Lifetime.Static, templateFieldDocRepository],
    ticketDocRepository: [Lifetime.Static, ticketDocRepository],
    ticketEntityRepository,
    ticketValueDocRepository: [Lifetime.Static, ticketValueDocRepository],
};
