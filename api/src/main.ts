import { provide } from '@ephemera/provide';
import { isUndefinedOrWhiteSpace } from '@ephemera/stdlib';
import express from 'express';
import path from 'path';
import { apiProfile } from './configure';

const environment = isUndefinedOrWhiteSpace(process.env.NODE_ENV) ? 'local' : process.env.NODE_ENV;

const { getUnit } = await provide(apiProfile, (builder) => {
    builder
        .configuration()
        .addYamlFile(path.join(process.env.CONFIG_DIRECTORY ?? __dirname, 'config.yaml'))
        .addYamlFile(path.join(process.env.CONFIG_DIRECTORY ?? __dirname, `config.${environment}.yaml`));

    builder.work().addTask(async (getUnit) => {
        // Reprocess all Redis-based document indices before start serving requests
        const organizationDocRepository = getUnit('organizationDocRepository');
        const templateDocRepository = getUnit('templateDocRepository');
        const templateFieldDocRepository = getUnit('templateFieldDocRepository');
        const ticketDocRepository = getUnit('ticketDocRepository');
        const ticketValueDocRepository = getUnit('ticketValueDocRepository');

        await Promise.all([
            organizationDocRepository.createIndex(),
            templateDocRepository.createIndex(),
            templateFieldDocRepository.createIndex(),
            ticketDocRepository.createIndex(),
            ticketValueDocRepository.createIndex(),
        ]);
    });
});

const app = express();
app.use(express.json());

const port = process.env.PORT || 3333;

app.use('/orgs', getUnit('organizationRouter'));
app.use('/orgs/:organizationId/templates', getUnit('templateRouter'));
app.use('/orgs/:organizationId/tickets', getUnit('ticketRouter'));

const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);
