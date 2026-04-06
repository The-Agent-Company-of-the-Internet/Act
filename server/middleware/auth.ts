export default defineEventHandler(async (event) => {
  
  if (process.server && import.meta.env.NITRO_PRERENDER) {
    return
  }
  
  const auth0 = useAuth0(event);
  const session = await auth0.getSession();
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
  }
})
