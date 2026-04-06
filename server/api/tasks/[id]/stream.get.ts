import { connectRedis } from "../../../../db/redis";

export default defineEventHandler(async (event) => {
  console.log("TASK STREAM EVENT HIT")
  const auth0 = useAuth0(event);
  const session = await auth0.getSession();
  
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
  }
  
  const taskId = getRouterParam(event, "id");
  if (!taskId) {
    throw createError({ statusCode: 400, statusMessage: "Task ID is required" })
  }
  
  setHeaders(event, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    'X-Accel-Buffering': 'no',
  })
  
  const redis = connectRedis();
  
  function sendEvent(data: object) {
    event.node.res.write(`data: ${JSON.stringify(data)}\n\n`)
  }
  
  let lastIndex = 0;
  const interval = setInterval(async () => {
    try {
      const entries = await redis.lrange(`task:${taskId}:logs`, lastIndex, -1);
      if (entries.length > 0) {
        lastIndex += entries.length;
        for (const entry of entries) {
          sendEvent(typeof entry == 'string' ? JSON.parse(entry): entry)
        }
      }
      
      const status = await redis.get(`task:${taskId}:status`)
      sendEvent({ type: "status", status })
      
      if (status == "completed" || status == "failed") {
        clearInterval(interval)
        event.node.res.end();
      }
    } catch (e) {
      console.error("SSE poll error: ", e)
    }
  }, 1000)
  
  event.node.req.on('close', () => {
    clearInterval(interval)
  })
  
  await new Promise(() => {}) //This is to keep the stream connection alive
  
})