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
 * Action to react to a message on OpenChat
 */
export const reactToMessageAction: Action = {
  name: "REACT_OPENCHAT_MESSAGE",
  similes: ["OPENCHAT_REACT", "ADD_REACTION_OPENCHAT"],
  description: "Add a reaction to a message on OpenChat",

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
      logger.warn("[OpenChat] Client not initialized for react action");
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
      
      // Extract reaction details
      const messageId = options?.messageId;
      const reaction = options?.reaction || "👍";

      if (!messageId) {
        return {
          success: false,
          error: new Error("No message ID provided for reaction"),
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

      // Add the reaction
      await client.reactToMessage(botClient, messageId, reaction);

      logger.info({ messageId, reaction }, "[OpenChat] Reaction added via action");

      if (callback) {
        await callback({
          text: `Added reaction ${reaction} to message`,
          actions: ["REACT_OPENCHAT_MESSAGE"],
          source: "openchat",
        });
      }

      return {
        success: true,
        data: {
          messageId,
          reaction,
          actions: ["REACT_OPENCHAT_MESSAGE"],
        },
      };
    } catch (error) {
      logger.error({ error }, "[OpenChat] Error in react action");
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
          text: "React to that message with a thumbs up",
          actions: [],
        },
      },
      {
        name: "{{agentName}}",
        content: {
          text: "I'll add a thumbs up reaction",
          actions: ["REACT_OPENCHAT_MESSAGE"],
        },
      },
    ],
  ],
};
