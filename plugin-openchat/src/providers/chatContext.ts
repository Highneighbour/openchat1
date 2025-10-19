import {
    Provider,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { OpenChatClientService } from "../services/openchatClient.js";

/**
 * Provider for OpenChat context information
 */
export const chatContextProvider: Provider = {
    name: "openchatContext",
    description: "Provides context about current OpenChat installation and permissions",

    get: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<string> => {
        try {
            const service = runtime.getService(
                "openchat"
            ) as OpenChatClientService | undefined;

            if (!service) {
                return "OpenChat: Not connected";
            }

            const installations = service.getInstallations();

            if (installations.size === 0) {
                return "OpenChat: Bot not installed in any chats";
            }

            // Build context string
            const contextParts: string[] = ["OpenChat Installations:"];

            for (const [scopeKey, installation] of installations) {
                const { scope, permissions } = installation;
                contextParts.push(
                    `- ${scope.kind} (${scope.chatId}): ${permissions.length} permissions`
                );
            }

            // Add current room context if available
            if (message.roomId?.startsWith("openchat-")) {
                const parts = message.roomId.split("-");
                const kind = parts[1];
                const chatId = parts[2];
                contextParts.push(`\nCurrent chat: ${kind} (${chatId})`);
            }

            return contextParts.join("\n");
        } catch (error) {
            runtime.logger.error("[OpenChat] Error getting context:", error);
            return "OpenChat: Error retrieving context";
        }
    },
};

export default chatContextProvider;
