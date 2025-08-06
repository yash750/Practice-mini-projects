export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.auto.*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage-testdb',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'db/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**'
  ],
  testTimeout: 30000,
  forceExit: true
};