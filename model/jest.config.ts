/* eslint-disable */
export default {
    coverageDirectory: '../coverage/model',
    displayName: 'model',
    moduleFileExtensions: ['ts', 'js', 'html'],
    preset: '../jest.preset.js',
    reporters: [['jest-junit', { outputDirectory: './dist/model' }], 'summary'],
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
    },
};
