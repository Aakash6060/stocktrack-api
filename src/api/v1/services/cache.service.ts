import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

export const getCache = (key: string) => cache.get(key);
export const setCache = (key: string, value: any) => cache.set(key, value);
export const clearCache = (key: string) => cache.del(key);
export const clearAllCache = () => cache.flushAll();