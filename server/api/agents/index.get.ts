import { getDb } from "../../../db";
import { agents } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  console.log("AGENTS GET HIT")
  const auth0 = useAuth0(event);
  const session = await auth0.getSession();
  
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
  }
  
  const userId = session.user?.sub;
  console.log("UserID is: ", userId)
  
  const userAgents = await getDb()
    .select()
    .from(agents)
    .where(eq(agents.userId, userId))
    .orderBy(desc(agents.createdAt))
  
  // console.log("user agents are: ", userAgents)
  
  return userAgents
})