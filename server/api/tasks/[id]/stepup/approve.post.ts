import { connectRedis } from "../../../../../db/redis";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const redis = connectRedis()
  await redis.set(`task:${id}:stepup_decision`, 'approved')
  return { ok: true }
})