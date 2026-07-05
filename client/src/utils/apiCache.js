const cache = new Map();
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes cache lifetime

export const getCachedData = (key) => {
    const cached = cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
        cache.delete(key);
        return null;
    }
    return cached.data;
};

export const setCachedData = (key, data) => {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
};

export const clearCache = () => {
    cache.clear();
};
