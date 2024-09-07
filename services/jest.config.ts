/* eslint-disable */
export default {
    coverageDirectory: '../coverage/services',
    displayName: 'services',
    moduleFileExtensions: ['ts', 'js', 'html'],
    preset: '../jest.preset.js',
    reporters: [['jest-junit', { outputDirectory: './dist/services' }], 'summary'],
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
    },
};
