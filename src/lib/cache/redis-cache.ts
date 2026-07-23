// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RedisClient = any;

let redisClient: RedisClient | null = null;
let connectPromise: Promise<RedisClient> | null = null;

function normalizeRedisUrl(url: string): string {
  if (url.startsWith("redis://") && url.includes("upstash.io")) {
    return url.replace("redis://", "rediss://");
  }
  return url;
}

export async function getRedis(): Promise<RedisClient | null> {
  if (redisClient?.isOpen) return redisClient;

  if (!connectPromise) {
    connectPromise = (async () => {
      const rawUrl = process.env.REDIS_URL;
      if (!rawUrl) return null;

      const url = normalizeRedisUrl(rawUrl.trim());
      const { createClient } = await import("redis");
      const client = createClient({ url });
      client.on("error", (err: unknown) => console.error("Redis error:", err));
      await client.connect();
      return client;
    })();
  }

  try {
    redisClient = await connectPromise;
    return redisClient;
  } catch {
    connectPromise = null;
    return null;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = await getRedis();
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 600): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;
  try {
    await redis.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch { /* ignore cache errors */ }
}

export async function cacheDel(pattern: string): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(keys);
  } catch { /* ignore */ }
}

export async function cacheDelByPrefix(prefix: string): Promise<void> {
  await cacheDel(`${prefix}:*`);
}
