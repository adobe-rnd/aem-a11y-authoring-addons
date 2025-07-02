/** @type {import('jest').Config} */
module.exports = {
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // The test environment that will be used for testing
  testEnvironment: "node",

  // setup file to mock globals
  setupFiles: ['./test/setup-jest.js'],
}; 