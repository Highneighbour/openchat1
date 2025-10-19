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
 * Action to send a message to OpenChat
 */
export const sendMessageAction: Action = {
  name: "SEND_OPENCHAT_MESSAGE",
  similes: ["SEND_OC_MESSAGE", "POST_TO_OPENCHAT", "OPENCHAT_SEND"],
  description: "Send a message to OpenChat",

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
      logger.warn("[OpenChat] Client not initialized for send message action");
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
      
      // Extract message content
      const text = options?.text || message.content?.text;
      if (!text) {
        return {
          success: false,
          error: new Error("No text provided for message"),
        };
      }

      // Get bot client from context (if in command context)
      const botClient = options?.botClient;
      if (!botClient) {
        logger.warn("[OpenChat] No bot client in context");
        return {
          success: false,
          error: new Error("No OpenChat bot client available"),
        };
      }

      // Send the message
      await client.sendTextMessage(botClient, text, true);

      logger.info({ text: text.substring(0, 50) }, "[OpenChat] Message sent via action");

      if (callback) {
        await callback({
          text: `Sent message to OpenChat: ${text}`,
          actions: ["SEND_OPENCHAT_MESSAGE"],
          source: "openchat",
        });
      }

      return {
        success: true,
        data: {
          text,
          actions: ["SEND_OPENCHAT_MESSAGE"],
        },
      };
    } catch (error) {
      logger.error({ error }, "[OpenChat] Error in send message action");
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
          text: "Send 'Hello from ElizaOS!' to OpenChat",
          actions: [],
        },
      },
      {
        name: "{{agentName}}",
        content: {
          text: "I'll send that message to OpenChat",
          actions: ["SEND_OPENCHAT_MESSAGE"],
        },
      },
    ],
  ],
};
