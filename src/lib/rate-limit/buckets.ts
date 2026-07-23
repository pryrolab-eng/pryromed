import { consumeFromRedis, useRedisRateLimitStore } from "@/lib/rate-limit/redis-store";

export type ConsumeRateLimitInput = {
  bucketKey: string;
  max: number;
  windowMs: number;
};

export type ConsumeRateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSec: number };

const memoryBuckets = new Map<
  string,
  { windowStart: number; hitCount: number }
>();

function consumeInMemory(input: ConsumeRateLimitInput): ConsumeRateLimitResult {
  const now = Date.now();
  const existing = memoryBuckets.get(input.bucketKey);

  if (!existing || now - existing.windowStart >= input.windowMs) {
    memoryBuckets.set(input.bucketKey, { windowStart: now, hitCount: 1 });
    return { allowed: true, remaining: Math.max(0, input.max - 1) };
  }

  if (existing.hitCount >= input.max) {
    const retryAfterSec = Math.ceil(
      (input.windowMs - (now - existing.windowStart)) / 1000,
    );
    return { allowed: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  existing.hitCount += 1;
  return {
    allowed: true,
    remaining: Math.max(0, input.max - existing.hitCount),
  };
}

/** Returns false when the request should be rejected (429). */
export async function consumeRateLimit(
  input: ConsumeRateLimitInput,
): Promise<ConsumeRateLimitResult> {
  if (input.max <= 0) {
    return { allowed: true, remaining: input.max };
  }

  if (useRedisRateLimitStore()) {
    try {
      const redisResult = await consumeFromRedis(input);
      if (redisResult) return redisResult;
    } catch (error) {
      console.error("consumeRateLimit redis fallback:", error);
    }
  }

  return consumeInMemory(input);
}
