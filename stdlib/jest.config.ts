/* eslint-disable */
export default {
    coverageDirectory: '../coverage/stdlib',
    displayName: 'stdlib',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    preset: '../jest.preset.js',
    reporters: [['jest-junit', { outputDirectory: './dist/stdlib' }], 'summary'],
    transform: {
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
        '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
    },
};
