/* eslint-disable */
export default {
    coverageDirectory: '../coverage/services',
    displayName: 'services',
    moduleFileExtensions: ['ts', 'js', 'html'],
    preset: '../jest.preset.js',
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
    },
};
