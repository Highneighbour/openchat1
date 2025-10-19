import type {
  Provider,
  ProviderResult,
  IAgentRuntime,
  Memory,
  State,
} from "@elizaos/core";
import { logger } from "@elizaos/core";
import { getOpenChatClient } from "../client";

/**
 * Provider that gives the agent context about the current OpenChat chat
 */
export const chatContextProvider: Provider = {
  name: "OPENCHAT_CHAT_CONTEXT",
  description: "Provides context about the current OpenChat chat, including chat summary and recent messages",

  get: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined
  ): Promise<ProviderResult> => {
    try {
      const client = getOpenChatClient();
      
      // Check if we have a bot client in the state/context
      const botClient = (state as any)?.botClient;
      if (!botClient) {
        logger.debug("[OpenChat] No bot client available for chat context");
        return {
          text: "",
          values: {},
          data: {},
        };
      }

      // Get chat summary
      let chatSummary: any = null;
      try {
        chatSummary = await client.getChatContext(botClient);
      } catch (error) {
        logger.warn({ error }, "[OpenChat] Failed to get chat summary");
      }

      // Get recent messages
      let recentMessages: any[] = [];
      try {
        recentMessages = await client.readMessages(botClient, 10);
      } catch (error) {
        logger.warn({ error }, "[OpenChat] Failed to get recent messages");
      }

      // Format the context
      let contextText = "OpenChat Context:\n";
      
      if (chatSummary) {
        contextText += `\nChat: ${chatSummary.name || "Unknown"}\n`;
        contextText += `Type: ${chatSummary.kind || "Unknown"}\n`;
        contextText += `Members: ${chatSummary.member_count || "Unknown"}\n`;
      }

      if (recentMessages.length > 0) {
        contextText += `\nRecent Messages (${recentMessages.length}):\n`;
        recentMessages.forEach((msg, idx) => {
          const sender = msg.sender?.name || "Unknown";
          const text = msg.content?.text || "[Non-text message]";
          contextText += `${idx + 1}. ${sender}: ${text.substring(0, 100)}\n`;
        });
      }

      return {
        text: contextText,
        values: {
          chatSummary,
          recentMessages,
          messageCount: recentMessages.length,
        },
        data: {
          chatSummary,
          recentMessages,
        },
      };
    } catch (error) {
      logger.error({ error }, "[OpenChat] Error in chat context provider");
      return {
        text: "",
        values: {},
        data: {},
      };
    }
  },
};
