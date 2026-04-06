import { getDb } from "../../../db";
import { agents } from "../../../db/schema";
import { nanoid } from "nanoid";

//uselibpqcompat=true for the database url

export default defineEventHandler(async (event) => {
  console.log("AGENTS POST HIT")
  const auth0 = useAuth0(event);
  const session = await auth0.getSession();
  
  if (!session) {
    throw createError({statusCode: 401, statusMessage: "Unauthorized"})
  }
  
  const userId = session.user?.sub;
  const body = await readBody(event);
  // console.log("Body is: ", body)
  
  if (!body.agentName || !body.agentName.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Agent name is required' })
  }
  if (!body.budgetCents || body.budgetCents < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Budget is required' })
  }
  if (!body.scopes || body.scopes.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'At least one scope is required' })
  }
  
  const agentId = `act_agent_${nanoid(12)}`;
  const [agent] = await getDb().insert(agents).values({
    id: agentId,
    userId,
    name: body.agentName.trim(),
    description: body.description?.trim() ?? null,
    scopes: body.scopes,
    budgetCents: body.budgetCents,
    spentCents: 0,
    status: 'idle',
  }).returning()
  
  // if (agent) {
  //   console.log("Agent has been added successfully: ", agent)
  // }
  // 
  console.log("AGENT POST HIT - DONE")
  
  return agent
})