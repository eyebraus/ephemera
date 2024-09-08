/* eslint-disable */
export default {
    coverageDirectory: '../coverage/portal',
    displayName: 'portal',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    preset: '../jest.preset.js',
    reporters: [['jest-junit', { outputDirectory: './dist/portal' }], 'summary'],
    transform: {
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
        '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/next/babel'] }],
    },
};
