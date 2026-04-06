import { getDb } from "../../../db";
import { agents, tasks } from "../../../db/schema";
import { nanoid } from "nanoid";
import { connectRedis } from "../../../db/redis";
import { eq, and } from "drizzle-orm";
import { runOrchestrator } from "../../utils/orchestrator";

export default defineEventHandler(async (event) => {
  console.log("TASKS POST HIT")
  const auth0 = useAuth0(event);
  const session = await auth0.getSession();
  
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  const userId = session.user?.sub
  const body = await readBody(event)
  
  if (!body.agentId) {
    throw createError({ statusCode: 400, statusMessage: 'Agent ID is required' })
  }
  if (!body.prompt?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Task prompt is required' })
  }
  if (!body.budgetCents || body.budgetCents < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Budget is required' })
  }
  
  const [agent] = await getDb()
    .select()
    .from(agents)
    .where(and(
      eq(agents.id, body.agentId),
      eq(agents.userId, userId)
    ))
  
  if (!agent) {
    throw createError({ statusCode: 404, statusMessage: 'Agent not found' })
  }
  
  const remainingBudget = agent.budgetCents - agent.spentCents
  if (body.budgetCents > remainingBudget) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: `Budget exceeds agent remaining budget of $${(remainingBudget / 100).toFixed(2)}` 
    })
  }
  
  const id = `act_task_${nanoid(12)}`;
  
  const [task] = await getDb().insert(tasks).values({
    id,
    agentId: body.agentId,
    userId,
    prompt: body.prompt.trim(),
    budgetCents: body.budgetCents,
    spentCents: 0,
    status: 'queued',
  }).returning()
  
  await connectRedis().lpush('tasks:queue', JSON.stringify({
    taskId: task?.id,
    agentId: agent.id,
    userId,
  }))
  
    // set initial task state in redis for SSE stream
  await connectRedis().set(`task:${task?.id}:status`, 'queued')
  
  runOrchestrator(task?.id, agent.id).catch(console.error);
  
  return task
  
})