import NodeCache from "node-cache";

const cache: NodeCache = new NodeCache({ stdTTL: 600 });

export const getCache = (key: string): unknown => cache.get(key);
export const setCache = (key: string, value: unknown): boolean => cache.set(key, value);
export const clearCache = (key: string): number => cache.del(key);
export const clearAllCache = (): void => cache.flushAll();