import { Redis } from 'ioredis';
import { env } from './env.js';

interface CacheDriver {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<'OK' | null>;
  del(key: string): Promise<number>;
  setex(key: string, seconds: number, value: string): Promise<'OK'>;
  exists(key: string): Promise<number>;
  isLiveRedis: boolean;
}

// In-Memory Fallback Cache Engine with TTL support
class InMemoryCache implements CacheDriver {
  private store = new Map<string, { value: string; expiry: number | null }>();
  public isLiveRedis = false;

  constructor() {
    // Cleanup expired keys periodically
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.store.entries()) {
        if (item.expiry && item.expiry <= now) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiry && item.expiry <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK' | null> {
    let expiry: number | null = null;
    if (mode === 'EX' && duration) {
      expiry = Date.now() + duration * 1000;
    } else if (mode === 'PX' && duration) {
      expiry = Date.now() + duration;
    }
    this.store.set(key, { value, expiry });
    return 'OK';
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    this.store.set(key, {
      value,
      expiry: Date.now() + seconds * 1000,
    });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    const val = await this.get(key);
    return val !== null ? 1 : 0;
  }
}

let cacheClient: CacheDriver = new InMemoryCache();

try {
  const redisInstance = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // Don't hang on connection failure
    connectTimeout: 2000,
    lazyConnect: true,
  });

  redisInstance
    .connect()
    .then(() => {
      console.log('✅ Redis Cache connected successfully');
      cacheClient = {
        get: (k) => redisInstance.get(k),
        set: (k, v, m, d) => redisInstance.set(k, v, m as any, d as any) as any,
        del: (k) => redisInstance.del(k),
        setex: (k, s, v) => redisInstance.setex(k, s, v) as any,
        exists: (k) => redisInstance.exists(k),
        isLiveRedis: true,
      };
    })
    .catch(() => {
      console.log('ℹ️ Standalone Redis not detected. Switched automatically to resilient In-Memory Cache.');
    });
} catch {
  console.log('ℹ️ Using Resilient In-Memory Cache Driver.');
}

export const cache = cacheClient;
export const getCacheStatus = () => ({
  driver: cacheClient.isLiveRedis ? 'Redis' : 'InMemoryFallback',
  isLiveRedis: cacheClient.isLiveRedis,
});
