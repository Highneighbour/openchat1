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
 * Provider that gives information about where the bot is installed
 */
export const installationsProvider: Provider = {
  name: "OPENCHAT_INSTALLATIONS",
  description: "Provides information about where the OpenChat bot is currently installed",

  get: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined
  ): Promise<ProviderResult> => {
    try {
      const client = getOpenChatClient();
      
      // Get all installations
      const installations = client.getAllInstallations();

      if (installations.length === 0) {
        return {
          text: "Bot is not currently installed in any chats",
          values: {
            count: 0,
          },
          data: {
            installations: [],
          },
        };
      }

      // Format installations info
      let text = `Bot is installed in ${installations.length} location(s):\n\n`;
      installations.forEach((installation, idx) => {
        text += `${idx + 1}. ${installation.chatType} (${installation.scope})\n`;
        text += `   Installed: ${installation.installedAt.toISOString()}\n`;
        text += `   Permissions: ${installation.permissions.join(", ")}\n`;
      });

      return {
        text,
        values: {
          count: installations.length,
          installations: installations.map(i => ({
            scope: i.scope,
            chatType: i.chatType,
            installedAt: i.installedAt,
          })),
        },
        data: {
          installations,
        },
      };
    } catch (error) {
      logger.error({ error }, "[OpenChat] Error in installations provider");
      return {
        text: "",
        values: {},
        data: {},
      };
    }
  },
};
