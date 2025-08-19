const redis = require('redis');
const path = require('path');
const config = require(path.join(process.cwd(), 'src', 'config', 'config.js'));

let redisClient = null;

// Initialize Redis connection
const initRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: config.redis.url,
      password: config.redis.password,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          console.error('Redis server refused connection');
          return new Error('Redis server refused connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          console.error('Redis retry time exhausted');
          return new Error('Redis retry time exhausted');
        }
        if (options.attempt > 10) {
          console.error('Redis max retry attempts reached');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis connected successfully');
    });

    await redisClient.connect();
  } catch (error) {
    console.error('Redis connection failed:', error);
    redisClient = null;
  }
};

// Cache middleware
const cache = (duration = 300) => {
  return async (req, res, next) => {
    if (!redisClient) {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    
    try {
      const cachedData = await redisClient.get(key);
      
      if (cachedData) {
        const data = JSON.parse(cachedData);
        return res.json(data);
      }
      
      // Store original res.json method
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function(data) {
        if (redisClient && res.statusCode === 200) {
          redisClient.setEx(key, duration, JSON.stringify(data))
            .catch(err => console.error('Cache set error:', err));
        }
        
        // Call original method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Invalidate cache
const invalidateCache = async (pattern) => {
  if (!redisClient) return;
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

// User-specific caching
const userCache = (duration = 300) => {
  return async (req, res, next) => {
    if (!redisClient || !req.user) {
      return next();
    }

    const key = `user:${req.user.id}:${req.originalUrl}`;
    
    try {
      const cachedData = await redisClient.get(key);
      
      if (cachedData) {
        const data = JSON.parse(cachedData);
        return res.json(data);
      }
      
      const originalJson = res.json;
      
      res.json = function(data) {
        if (redisClient && res.statusCode === 200) {
          redisClient.setEx(key, duration, JSON.stringify(data))
            .catch(err => console.error('User cache set error:', err));
        }
        
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('User cache middleware error:', error);
      next();
    }
  };
};

// Get cache statistics
const getCacheStats = async () => {
  if (!redisClient) return null;
  
  try {
    const info = await redisClient.info();
    const keys = await redisClient.dbSize();
    
    return {
      connected: true,
      keys,
      info: info.split('\r\n').reduce((acc, line) => {
        const [key, value] = line.split(':');
        if (key && value) acc[key] = value;
        return acc;
      }, {})
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return { connected: false, error: error.message };
  }
};

// Clear all cache
const clearAllCache = async () => {
  if (!redisClient) return false;
  
  try {
    await redisClient.flushDb();
    console.log('All cache cleared');
    return true;
  } catch (error) {
    console.error('Clear cache error:', error);
    return false;
  }
};

// Redis health check
const redisHealthCheck = async () => {
  if (!redisClient) return false;
  
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
};

module.exports = {
  initRedis,
  cache,
  invalidateCache,
  userCache,
  getCacheStats,
  clearAllCache,
  redisHealthCheck,
  redisClient
};
