import { getDb } from "../../../db";
import { agents } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  console.log("AGENT[ID] GET HIT")
  const auth0 = useAuth0(event);
  const session = await auth0.getSession();
  
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
  }
  
  const userId = session.user?.sub;
  const agentId = getRouterParam(event, "id");
  
  if (!agentId) {
    throw createError({ statusCode: 400, statusMessage: "Agent ID is required" })
  }
  
  const [agent] = await getDb()
    .select()
    .from(agents)
    .where(and(
      eq(agents.id, agentId),
      eq(agents.userId, userId)
    ))
  
  if (!agent) {
    throw createError({ statusCode: 404, statusMessage: "Agent not found" })
  }
  
  return agent
})