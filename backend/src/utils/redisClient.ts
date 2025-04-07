import { createClient } from 'redis';
import { REDIS_URL, IS_DEVELOPMENT } from '../config/env';

let redisClient: any;

// Only initialize Redis if URL is provided
if (REDIS_URL) {
  try {
    redisClient = createClient({
      url: REDIS_URL,
    });
    
    redisClient.on('error', (err: any) => {
      console.error('Redis client error', err);
    });
    
    // Connect to Redis
    redisClient.connect().catch((err: any) => {
      console.error('Failed to connect to Redis:', err);
      redisClient = createFallbackClient();
    });
  } catch (error) {
    console.error('Error creating Redis client:', error);
    redisClient = createFallbackClient();
  }
} else {
  console.warn('REDIS_URL not provided, using fallback client');
  redisClient = createFallbackClient();
}

// Fallback client that simply mimics Redis but stores in memory
function createFallbackClient() {
  const cache = new Map();
  
  return {
    get: async (key: string) => cache.get(key) || null,
    set: async (key: string, value: string) => {
      cache.set(key, value);
      return 'OK';
    },
    del: async (key: string) => {
      cache.delete(key);
      return 1;
    },
    quit: async () => true,
    // Add other methods as needed
  };
}

export { redisClient };