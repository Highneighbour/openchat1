import type {
  Action,
  ActionResult,
  IAgentRuntime,
  Memory,
  State,
  HandlerCallback,
} from "@elizaos/core";
import { logger } from "@elizaos/core";
import { getOpenChatClient } from "../client";

/**
 * Action to delete a message on OpenChat
 */
export const deleteMessageAction: Action = {
  name: "DELETE_OPENCHAT_MESSAGE",
  similes: ["OPENCHAT_DELETE", "REMOVE_OPENCHAT_MESSAGE"],
  description: "Delete a message on OpenChat",

  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined
  ): Promise<boolean> => {
    // Check if we have OpenChat client
    try {
      getOpenChatClient();
      return true;
    } catch {
      logger.warn("[OpenChat] Client not initialized for delete action");
      return false;
    }
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    options: any,
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      const client = getOpenChatClient();
      
      // Extract message ID
      const messageId = options?.messageId;

      if (!messageId) {
        return {
          success: false,
          error: new Error("No message ID provided for deletion"),
        };
      }

      // Get bot client from context
      const botClient = options?.botClient;
      if (!botClient) {
        logger.warn("[OpenChat] No bot client in context");
        return {
          success: false,
          error: new Error("No OpenChat bot client available"),
        };
      }

      // Delete the message
      await client.deleteMessage(botClient, messageId);

      logger.info({ messageId }, "[OpenChat] Message deleted via action");

      if (callback) {
        await callback({
          text: "Message deleted from OpenChat",
          actions: ["DELETE_OPENCHAT_MESSAGE"],
          source: "openchat",
        });
      }

      return {
        success: true,
        data: {
          messageId,
          actions: ["DELETE_OPENCHAT_MESSAGE"],
        },
      };
    } catch (error) {
      logger.error({ error }, "[OpenChat] Error in delete action");
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: "{{userName}}",
        content: {
          text: "Delete that message",
          actions: [],
        },
      },
      {
        name: "{{agentName}}",
        content: {
          text: "I'll delete the message",
          actions: ["DELETE_OPENCHAT_MESSAGE"],
        },
      },
    ],
  ],
};
