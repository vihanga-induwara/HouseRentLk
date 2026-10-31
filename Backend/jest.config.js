module.exports = {
    testEnvironment: 'node',
    // Unit tests only; database integration tests run with `node --test` (see package.json)
    testMatch: ['<rootDir>/tests/*.test.js'],
    setupFiles: ['./tests/env.js'],
    setupFilesAfterEnv: ['./tests/setup.js'],
    verbose: true,
    clearMocks: true,
    restoreMocks: true,
    collectCoverageFrom: ['controllers/**/*.js', 'middleware/**/*.js', 'services/**/*.js', 'validations/**/*.js', 'jobs/**/*.js'],
};
