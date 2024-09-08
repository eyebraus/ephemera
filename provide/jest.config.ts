/* eslint-disable */
export default {
    coverageDirectory: '../coverage/provide',
    displayName: 'provide',
    moduleFileExtensions: ['ts', 'js', 'html'],
    preset: '../jest.preset.js',
    reporters: [['jest-junit', { outputDirectory: './dist/provide' }], 'summary'],
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
    },
};
