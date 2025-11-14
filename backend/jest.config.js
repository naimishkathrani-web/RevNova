export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',

  extensionsToTreatAsEsm: ['.ts'],

  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }]
  },

  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],

  // ONLY fix .js extensions for local project files
  moduleNameMapper: {
    '^\\./(.*)\\.js$': './$1',
    '^\\.\\./(.*)\\.js$': '../$1'
  },

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],

  globalTeardown: "<rootDir>/src/tests/teardown.ts",
};
