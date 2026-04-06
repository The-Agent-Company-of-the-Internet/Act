export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) {
    return
  }
  
  if (import.meta.client) {
    const user = useUser();
    if (!user.value) {
      return navigateTo("/auth/login", { external: true })
    }
  }
  
})