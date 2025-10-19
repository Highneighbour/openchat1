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
 * Provider that gives information about the OpenChat user
 */
export const userInfoProvider: Provider = {
  name: "OPENCHAT_USER_INFO",
  description: "Provides information about the current OpenChat user interacting with the agent",

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
        logger.debug("[OpenChat] No bot client available for user info");
        return {
          text: "",
          values: {},
          data: {},
        };
      }

      // Extract user information from bot client
      const userId = botClient.userId || "unknown";
      const userName = botClient.userName || "User";
      const chatId = botClient.chatId || "unknown";

      const userInfoText = `User: ${userName} (ID: ${userId})\nChat ID: ${chatId}`;

      return {
        text: userInfoText,
        values: {
          userId,
          userName,
          chatId,
        },
        data: {
          userId,
          userName,
          chatId,
        },
      };
    } catch (error) {
      logger.error({ error }, "[OpenChat] Error in user info provider");
      return {
        text: "",
        values: {},
        data: {},
      };
    }
  },
};
