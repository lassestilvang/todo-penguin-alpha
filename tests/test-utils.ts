// Compatibility layer for Jest and Bun test runners
interface TestGlobals {
  describe: jest.Describe;
  test: jest.It;
  expect: jest.Expect;
  beforeEach: jest.Lifecycle;
  afterEach: jest.Lifecycle;
  beforeAll: jest.Lifecycle;
  afterAll: jest.Lifecycle;
  jest: typeof jest;
}

let testGlobals: TestGlobals;

// Detect if we're running under Jest or Bun
const isJest = typeof jest !== 'undefined';
const isBun = typeof Bun !== 'undefined';

if (isJest) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  testGlobals = require('@jest/globals');
} else if (isBun) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  testGlobals = require('bun:test');
} else {
  throw new Error('Unsupported test environment. Please use Jest or Bun.');
}

// Export the test globals
export const { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll } = testGlobals;

// For Jest, use the global jest; for Bun, use the one from testGlobals
export const jestInstance = isJest ? jest : testGlobals.jest;

// For mocking, use the appropriate jest - in Jest, use global jest directly
export const jestForMock = isJest ? jest : testGlobals.jest;

// Environment-specific utilities
export const isTestEnvironmentJest = isJest;
export const isTestEnvironmentBun = isBun;
