import { getDb } from "../../../../db";
import { agents, tasks, taskLogs } from "../../../../db/schema";
import { nanoid } from "nanoid";
import { connectRedis } from "../../../../db/redis";
import { eq, and, asc } from "drizzle-orm";


export default defineEventHandler(async (event) => {
  console.log("TASK [ID] INDEX HIT")
  const auth0 = useAuth0(event);
  const session = await auth0.getSession();
  
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  
  const userId = session.user?.sub;
  const taskId = getRouterParam(event, "id");
  
  if (!taskId) {
    throw createError({ statusCode: 400, statusMessage: "Agent ID is required" })
  }
  
  const [task] = await getDb()
    .select({
      id: tasks.id,
      prompt: tasks.prompt,
      status: tasks.status,
      budgetCents: tasks.budgetCents,
      spentCents: tasks.spentCents,
      result: tasks.result,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      agentId: tasks.agentId,
      agentName: agents.name,
    })
    .from(tasks)
    .innerJoin(agents, eq(tasks.agentId, agents.id))
    .where(and(
      eq(tasks.id, taskId),
      eq(tasks.userId, userId)
    ))
  
  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }
  
  const logs = await getDb()
    .select()
    .from(taskLogs)
    .where(eq(taskLogs.taskId, taskId))
    .orderBy(asc(taskLogs.createdAt))
  
  return { ...task, logs }
})