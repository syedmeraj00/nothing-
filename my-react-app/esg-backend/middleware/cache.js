// Cache middleware

const cache = new Map();

const cacheMiddleware = (duration = 60000) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedData = cache.get(key);

    if (cachedData && Date.now() - cachedData.timestamp < duration) {
      return res.json(cachedData.data);
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cache.set(key, {
        data,
        timestamp: Date.now(),
      });
      return originalJson(data);
    };

    next();
  };
};

const invalidateCache = (pattern) => {
  return (req, res, next) => {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
    next();
  };
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
};
