/* eslint-disable */
export default {
    coverageDirectory: '../coverage/api',
    displayName: 'api',
    moduleFileExtensions: ['ts', 'js', 'html'],
    preset: '../jest.preset.js',
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
    },
};
