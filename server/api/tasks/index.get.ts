import { getDb } from "../../../db";
import { agents, tasks } from "../../../db/schema";
import { nanoid } from "nanoid";
import { connectRedis } from "../../../db/redis";
import { eq, and, desc } from "drizzle-orm";
import { runOrchestrator } from "../../utils/orchestrator";

export default defineEventHandler(async (event) => {
  console.log("TASKS GET SERVER ROUTE HIT")
  const auth0 = useAuth0(event)
  const session = await auth0.getSession()

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const userId = session.user.sub

  const userTasks = await getDb()
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
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt))

  console.log("TASKS GET SERVER ROUTE HIT - DONE")
  return userTasks
})