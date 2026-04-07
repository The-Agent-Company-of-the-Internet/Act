import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: [
        '@lucide/vue',
        'gsap',
        'gsap/all',
      ]
    },
  },
  
  runtimeConfig: {
    auth0: {
      domain: process.env.NUXT_AUTH0_DOMAIN,
      clientId: process.env.NUXT_AUTH0_CLIENT_ID,
      clientSecret: process.env.NUXT_AUTH0_CLIENT_SECRET,
      sessionSecret: process.env.NUXT_AUTH0_SESSION_SECRET,
      appBaseUrl: process.env.NUXT_AUTH0_APP_BASE_URL,
    },
    customClientId: process.env.NUXT_AUTH0_CUSTOM_API_CLIENT_ID,
    customClientSecret: process.env.NUXT_AUTH0_CUSTOM_API_CLIENT_SECRET,
    authAudience: process.env.NUXT_AUTH_AUDIENCE,
    databaseUrl: process.env.NUXT_DATABASE_URL,
    upstashUrl: process.env.NUXT_UPSTASH_REDIS_REST_URL,
    upstashToken: process.env.NUXT_UPSTASH_REDIS_TOKEN,
    openrouterApiKey: process.env.NUXT_OPENROUTER_API_KEY,
    tavilyApiKey: process.env.NUXT_TAVILY_API_KEY,
    firecrawlApiKey: process.env.NUXT_FIRECRAWL_API_KEY,
    langsmithApiKey: process.env.NUXT_LANGSMITH_API_KEY,
    groqApiKey: process.env.NUXT_GROQ_API_KEY,
  },
  
  fonts: {
    defaults: {
      weights: ['100 900'],
    },
  },

  modules: ['@nuxt/fonts', '@auth0/auth0-nuxt', '@nuxt/image'],
})