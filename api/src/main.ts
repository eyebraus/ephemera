import { createProvider } from '@ephemera/provide';
import express from 'express';
import { apiConfiguration } from './configure';

const provide = createProvider(apiConfiguration);

const app = express();
app.use(express.json());

const port = process.env.PORT || 3333;

app.use('/templates', provide('templateRouter'));
app.use('/templates/:template/versions', provide('templateVersionRouter'));

const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);
