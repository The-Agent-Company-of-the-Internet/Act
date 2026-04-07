import { tool } from "langchain";
import { z } from "zod";
import { WebClient } from '@slack/web-api';
import { withSlackAccess, getAccessTokenFromTokenVault } from './tokenvault';
import { TokenVaultError } from '@auth0/ai/interrupts';

export const createSlackSendTool = (authToken: string) => {
  return withSlackAccess(authToken)(
    tool(
      async ({ channel, message }) => {
        try {
          // Get Slack access token from Token Vault
          const slackToken = getAccessTokenFromTokenVault();
          
          if (!slackToken) {
            throw new TokenVaultError("Slack authorization required. Please connect your Slack account.");
          }

          const slack = new WebClient(slackToken);
          
          const result = await slack.chat.postMessage({
            channel,
            text: message,
          });
          
          return `Message sent successfully to ${channel} at ${result.ts}`;
        } catch (error: any) {
          // Handle auth errors as Token Vault interrupts
          if (error.statusCode === 401 || error.status === 401 || error.code === 'slack_sdk_error') {
            throw new TokenVaultError(`Slack authorization required: ${error.message}`);
          }
          throw error;
        }
      },
      {
        name: "send_slack_message",
        description: "Send a message to a Slack channel or user. Requires Slack authorization.",
        schema: z.object({
          channel: z.string().describe("Slack channel ID (e.g., 'C123456') or channel name (e.g., '#general')"),
          message: z.string().describe("The message text to send"),
        }),
      }
    )
  );
};

// Additional Slack tools
export const createSlackListChannelsTool = (authToken: string) => {
  return withSlackAccess(authToken)(
    tool(
      async () => {
        try {
          const slackToken = getAccessTokenFromTokenVault();
          const slack = new WebClient(slackToken);
          
          const result = await slack.conversations.list({
            types: 'public_channel,private_channel',
            exclude_archived: true,
            limit: 100,
          });
          
          return JSON.stringify(result.channels?.map(ch => ({
            id: ch.id,
            name: ch.name,
            is_private: ch.is_private,
          })) || []);
        } catch (error: any) {
          if (error.statusCode === 401) {
            throw new TokenVaultError("Slack authorization required");
          }
          throw error;
        }
      },
      {
        name: "list_slack_channels",
        description: "List all Slack channels the user has access to",
        schema: z.object({}),
      }
    )
  );
};