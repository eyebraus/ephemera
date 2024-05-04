const { NxWebpackPlugin } = require('@nx/webpack');
const { join } = require('path');

module.exports.output = {
    path: join(__dirname, '../dist/api'),
};

module.exports.plugins = [
    new NxWebpackPlugin({
        assets: ['api/config.yaml', 'api/config.local.yaml'],
        compiler: 'tsc',
        main: './src/main.ts',
        optimization: false,
        outputHashing: 'none',
        sourceMap: true,
        target: 'node',
        tsConfig: './tsconfig.app.json',
    }),
];
