import { server } from "../index";
import { RedisService } from "../services/redis.service";

export default async function teardown() {
  // Stop express server
  if (server && server.close) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  // Disconnect Redis cleanly
  const redis = new RedisService();
  await redis.disconnect();
}
