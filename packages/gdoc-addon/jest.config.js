/** @type {import('jest').Config} */
module.exports = {
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // The test environment that will be used for testing
  testEnvironment: "node",

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    '/node_modules/(?!unist-util-visit|hast-util-to-string|unist-util-is|unist-util-visit-parents|unist-util-stringify-position|vfile.*|unified|bail|trough|remark-.*|rehype-.*)',
  ],
}; 