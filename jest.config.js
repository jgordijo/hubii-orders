module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*spec.ts'],
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/__tests__/mocks/testEnvs.ts', '<rootDir>/__tests__/mocks/setupTestServer.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/.+'],
  moduleFileExtensions: ['ts', 'json', 'js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '.*flycheck.*',
    '.+/.#',
    '<rootDir>/.+/dist/.+',
  ],
  watchPathIgnorePatterns: ['.+/TEST', '.+/.#'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/.+/dist/.+',
    '<rootDir>/support/.+',
    '/src/infra/prisma/client.ts',
    '/src/app.ts',
    '/src/server.ts',
    '/src/env.ts',
    '/src/routes/.*/index.ts'
  ],
  transform: {
    '^.+\\.ts?$': ['ts-jest', {
      isolatedModules: true,
    }],
  },
  collectCoverageFrom: ['src/**/*.ts'],
  bail: 1,
  collectCoverage: true,
  coverageDirectory: '__tests__/coverage',
  maxWorkers: '50%',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
