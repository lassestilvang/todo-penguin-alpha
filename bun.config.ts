// Mock better-sqlite3 for Bun compatibility
const mockDb = {
  exec: () => {},
  prepare: () => ({
    run: () => {},
    get: () => undefined,
    all: () => [],
    finalize: () => {},
  }),
};

// Export mock database
export { mockDb as db };
