import { provide } from '@ephemera/provide';
import { isUndefinedOrWhiteSpace } from '@ephemera/stdlib';
import express from 'express';
import path from 'path';
import { apiProfile } from './configure';

const environment = isUndefinedOrWhiteSpace(process.env.NODE_ENV) ? 'local' : process.env.NODE_ENV;

const { getUnit } = await provide(apiProfile, (builder) => {
    builder
        .addYamlFile(path.join(process.env.CONFIG_DIRECTORY ?? __dirname, 'config.yaml'))
        .addYamlFile(path.join(process.env.CONFIG_DIRECTORY ?? __dirname, `config.${environment}.yaml`));
});

const app = express();
app.use(express.json());

const port = process.env.PORT || 3333;

app.use('/templates', getUnit('templateRouter'));
app.use('/templates/:template/versions', getUnit('templateVersionRouter'));

const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);
