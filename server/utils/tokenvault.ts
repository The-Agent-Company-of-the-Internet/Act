import { Auth0AI } from "@auth0/ai-langchain";
import { SUBJECT_TOKEN_TYPES } from "@auth0/ai";


function connectToAuth() {
  const config = useRuntimeConfig();
  
  const auth0AI = new Auth0AI({
    auth0: {
      domain: config.auth0.domain,
      clientId: config.customClientId,
      clientSecret: config.customClientSecret,
    }
  }) 
  
  return auth0AI
}

export function withSlackAccess(access_token: string) {
  const auth0AI = connectToAuth();
  auth0AI.withTokenVault({
    connection: "slack",
    scopes: [
      'chat:write',
      'users:read', 
      'channels:read',
      'groups:read',
      'im:read',
      'mpim:read'
    ],
    accessToken: async () => access_token,
    subjectTokenType: SUBJECT_TOKEN_TYPES.SUBJECT_TYPE_ACCESS_TOKEN
  })
}

export { getAccessTokenFromTokenVault } from '@auth0/ai-langchain';