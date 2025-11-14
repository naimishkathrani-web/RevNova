  // backend/src/services/redis.service.ts
  import { createClient, RedisClientType } from "redis";

  export class RedisService {
    private client: RedisClientType | null = null;
    private isConnected = false;

    /**
     * Connect to Redis (skips in test mode)
     */
    async connect() {
      try {
        // Prevent multiple connects
        if (this.isConnected || this.client) return;

        // ❗ Do NOT connect Redis during Jest tests
        if (process.env.NODE_ENV === "test") {
          console.log("⏭️ Redis skipped in test mode");
          return;
        }

        this.client = createClient({
          url: process.env.REDIS_URL || "redis://localhost:6379",
          socket: {
            reconnectStrategy: false, // Prevent infinite retries
          }
        });

        this.client.on("error", (err) => {
          console.error("❌ Redis Error:", err);
        });

        await this.client.connect();
        this.isConnected = true;

        // Prevent timers from keeping Jest open
        this.client.unref?.();

        console.log("✅ Redis connected");
      } catch (error) {
        console.error("❌ Failed to connect to Redis:", error);
      }
    }

    /**
     * Disconnect Redis (safe + silent)
     */
    async disconnect() {
      try {
        if (this.client && this.isConnected) {
          await this.client.quit();
        }
      } catch (error) {
        console.error("❌ Redis disconnect error:", error);
      } finally {
        this.client = null;
        this.isConnected = false;
      }
    }

    /**
     * Set a value with expiry
     */
    async set(key: string, value: any, expirySeconds = 3600) {
      if (!this.client) return; // Safe no-op in test mode

      await this.client.set(key, JSON.stringify(value), {
        EX: expirySeconds
      });
    }

    /**
     * Get a typed value
     */
    async get<T>(key: string): Promise<T | null> {
      if (!this.client) return null; // Safe no-op

      const data = await this.client.get(key);
      return data ? (JSON.parse(data) as T) : null;
    }

    /**
     * Get keys by prefix
     */
    async getKeys(prefix: string): Promise<string[]> {
      if (!this.client) return []; // Safe no-op

      return await this.client.keys(`${prefix}*`);
    }
  }
