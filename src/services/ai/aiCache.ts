import type { AiSecurityResult } from './aiTypes';

const CACHE_PREFIX = 'cs_ai_cache_';

export const aiCache = {
  get: (keyType: string, identifier: string): AiSecurityResult | null => {
    try {
      // Safe key generation for Unicode strings
      const safeKey = encodeURIComponent(identifier).substring(0, 200);
      const cacheKey = `${CACHE_PREFIX}${keyType}_${safeKey}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Expire cache after 24 hours
        const age = Date.now() - new Date(parsed.timestamp).getTime();
        if (age < 24 * 60 * 60 * 1000) {
          return parsed.data;
        }
        localStorage.removeItem(cacheKey);
      }
    } catch (e) {
      console.warn("AI cache read failed:", e);
    }
    return null;
  },

  set: (keyType: string, identifier: string, data: AiSecurityResult): void => {
    try {
      const safeKey = encodeURIComponent(identifier).substring(0, 200);
      const cacheKey = `${CACHE_PREFIX}${keyType}_${safeKey}`;
      const payload = {
        timestamp: new Date().toISOString(),
        data
      };
      localStorage.setItem(cacheKey, JSON.stringify(payload));
    } catch (e) {
      console.warn("AI cache write failed:", e);
    }
  },

  clear: (): void => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn("AI cache clear failed:", e);
    }
  }
};
