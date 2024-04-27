import { provide } from '@ephemera/provide';
import express from 'express';
import { apiProfile } from './configure';

const { getUnit } = await provide(apiProfile, (builder) => {
    builder.addYamlFile('/config.yaml').addYamlFile(`/config.${process.env.NODE_ENV}.yaml`);
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
