/**
 * @fileoverview Basic Jest sanity tests to verify setup and environment.
 * These don't test business logic — just confirm that Jest + TypeScript + ESM are configured correctly.
 */

describe('Sample Test', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should verify environment', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});

