export default async function teardown() {
  // Close Express server (if it exists)
  try {
    const { server } = await import("../index.js");
    if (server && server.close) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  } catch {
    // ignore if not running
  }

  // Close PostgreSQL
  try {
    const dbModule = await import("../database/db.js");
    const db = dbModule.default;
    if (db?.end) {
      await db.end();
    }
  } catch {
    // ignore
  }

  // Close Redis using instance disconnect()
  try {
    const RedisModule = await import("../services/redis.service.js");
    const { RedisService } = RedisModule;

    const redis = new RedisService();
    await redis.disconnect?.();
  } catch {
    // ignore
  }

  // Clean exit
  setImmediate(() => process.exit(0));
}
