// Compatibility layer for Jest and Bun test runners
const isJest = typeof jest !== 'undefined';
const isBun = typeof Bun !== 'undefined';

interface JestInstance {
  fn: () => jest.Mock;
  [key: string]: unknown;
}

let jestInstance: JestInstance;
if (isJest) {
  jestInstance = global.jest as JestInstance;
} else if (isBun) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const bunTest = require('bun:test');
  jestInstance = bunTest.jest as JestInstance;
} else {
  throw new Error('Unsupported test environment. Please use Jest or Bun.');
}

import { configure } from '@testing-library/react';
import '@testing-library/jest-dom';

// Configure React Testing Library
configure({ testIdAttribute: 'data-testid' });

// Set up proper DOM for Bun only
if (isBun) {
  // Import happy-dom for Bun
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Window } = require('happy-dom');
  
  // Create a new window instance with full HTML structure
  const window = new Window({
    url: 'http://localhost',
    width: 1024,
    height: 768,
  });
  
  // Ensure the document has proper HTML structure
  window.document.write('<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>');
  
  // Set up global DOM variables
  global.document = window.document;
  global.window = window as Window & typeof globalThis;
  global.navigator = window.navigator;
  
  // Ensure document.body is available
  if (!global.document.body) {
    global.document.body = global.document.createElement('body');
  }
  
  // Additional browser APIs
  global.matchMedia = jestInstance.fn().mockImplementation(() => ({
    matches: false,
    addListener: jestInstance.fn(),
    removeListener: jestInstance.fn(),
  }));
  global.ResizeObserver = jestInstance.fn().mockImplementation(() => ({
    observe: jestInstance.fn(),
    unobserve: jestInstance.fn(),
    disconnect: jestInstance.fn(),
  }));
  global.IntersectionObserver = jestInstance.fn().mockImplementation(() => ({
    observe: jestInstance.fn(),
    unobserve: jestInstance.fn(),
    disconnect: jestInstance.fn(),
  }));
  global.getComputedStyle = jestInstance.fn().mockImplementation(() => ({
    getPropertyValue: jestInstance.fn(),
  }));
  global.scrollTo = jestInstance.fn();
  global.alert = jestInstance.fn();
  global.confirm = jestInstance.fn().mockImplementation(() => true);
  
  // Fix Storage interface
  const mockStorage = {
    getItem: jestInstance.fn(),
    setItem: jestInstance.fn(),
    removeItem: jestInstance.fn(),
    clear: jestInstance.fn(),
    length: 0,
    key: jestInstance.fn(),
  };
  global.localStorage = mockStorage;
  global.sessionStorage = mockStorage;
  global.requestAnimationFrame = jestInstance.fn((cb: FrameRequestCallback) => setTimeout(cb, 0));
  global.cancelAnimationFrame = jestInstance.fn();
  global.addEventListener = jestInstance.fn();
  global.removeEventListener = jestInstance.fn();
}

// Note: Database mocking needs to be done in individual test files
// since Bun's jest doesn't support jest.mock the same way
