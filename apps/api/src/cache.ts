import NodeCache from "node-cache";

const cache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
  useClones: false,
});

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== undefined) {
    return cached;
  }

  const data = await fetcher();
  cache.set(key, data, ttl);
  return data;
}

export function invalidateCache(pattern: string): void {
  const keys = cache.keys();
  const matchingKeys = keys.filter((key) => key.startsWith(pattern));
  cache.del(matchingKeys);
}

export function getCacheStats() {
  return cache.getStats();
}

export { cache };
