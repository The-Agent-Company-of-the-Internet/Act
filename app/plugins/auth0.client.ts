import createAuth0 from '@auth0/auth0-nuxt';

export default defineNuxtPlugin((nuxtApp) => {
  const auth0 = createAuth0({
    domain: useRuntimeConfig().public.auth0Domain,
    clientId: useRuntimeConfig().public.auth0ClientId,
    authorizationParams: {
      redirect_uri: 'http://localhost:3000',
      audience: useRuntimeConfig().public.auth0Audience,
      scope: 'openid profile email offline_access',
    },
    cacheLocation: 'localstorage',
    useRefreshTokens: true,
  }, ());
  
  nuxtApp.vueApp.use(auth0);
});