import { Redis } from '@upstash/redis'

export function connectRedis() {
  
  const config = useRuntimeConfig();
  
  const redis = new Redis({
    url: config.upstashUrl,
    token: config.upstashToken,
  })
  
  return redis
}

