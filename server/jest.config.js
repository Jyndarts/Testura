module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 30000,
  verbose: true,
  moduleNameMapper: {
    '^@octokit/rest$': '<rootDir>/tests/__mocks__/@octokit/rest.js',
  },
};
