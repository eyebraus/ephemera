const { NxWebpackPlugin } = require('@nx/webpack');
const { join } = require('path');

module.exports.output = {
    path: join(__dirname, '../dist/api'),
};

module.exports.plugins = [
    new NxWebpackPlugin({
        compiler: 'tsc',
        main: './src/main.ts',
        optimization: false,
        outputHashing: 'none',
        target: 'node',
        tsConfig: './tsconfig.app.json',
    }),
];
