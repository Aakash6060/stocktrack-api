import NodeCache from "node-cache";

/**
 * In-memory cache instance using NodeCache.
 * - stdTTL: 600 seconds (10 minutes) default TTL for keys.
 */
const cache: NodeCache = new NodeCache({ stdTTL: 600 });

/**
 * Retrieves a value from the in-memory cache.
 *
 * @param {string} key - Cache key
 * @returns {unknown} Cached value or undefined if not found
 */
export const getCache = (key: string): unknown => cache.get(key);

/**
 * Stores a value in the in-memory cache.
 *
 * @param {string} key - Cache key
 * @param {unknown} value - Value to store
 * @returns {boolean} True if the value was successfully cached
 */
export const setCache = (key: string, value: unknown): boolean => cache.set(key, value);

/**
 * Deletes a specific key from the cache.
 *
 * @param {string} key - Key to remove
 * @returns {number} Number of keys removed (0 or 1)
 */
export const clearCache = (key: string): number => cache.del(key);

/**
 * Clears all cached entries.
 */
export const clearAllCache = (): void => cache.flushAll();