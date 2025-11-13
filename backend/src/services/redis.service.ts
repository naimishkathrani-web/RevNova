// backend/src/services/redis.service.ts
import { createClient, RedisClientType } from 'redis';

export class RedisService {
  private client: RedisClientType | null = null;

  async connect() {
    try {
      if (this.client) return; // Prevent multiple connections

      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis Error:', err);
      });

      await this.client.connect();
      console.log('✅ Redis connected');
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
    }
  }

  async set(key: string, value: any, expirySeconds = 3600) {
    if (!this.client) throw new Error('Redis not connected');

    try {
      await this.client.set(key, JSON.stringify(value), { EX: expirySeconds });
    } catch (error) {
      console.error('❌ Redis SET error:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) throw new Error('Redis not connected');

    try {
      const data = await this.client.get(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch (error) {
      console.error('❌ Redis GET error:', error);
      return null;
    }
  }

  // ✅ Added: Get all keys matching prefix
  async getKeys(prefix: string): Promise<string[]> {
    if (!this.client) throw new Error('Redis not connected');

    try {
      return await this.client.keys(`${prefix}*`);
    } catch (error) {
      console.error('❌ Redis KEYS error:', error);
      return [];
    }
  }
}
// backend/src/routes/analyze.routes.ts