// For now let us just remove middleware from the page

export default defineEventHandler(async (event) => {
  const auth0 = useAuth0(event);
  const session = await auth0.getSession();
  if (!session) {
    return navigateTo("/") // I am not sure this works
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
  }
})