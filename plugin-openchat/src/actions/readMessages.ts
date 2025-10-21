import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { OpenChatClientService } from "../services/openchatClient.js";

/**
 * Action to read messages from OpenChat
 */
export const readMessagesAction: Action = {
    name: "READ_OPENCHAT_MESSAGES",
    description: "Read recent messages from OpenChat",
    similes: [
        "GET_OPENCHAT_MESSAGES",
        "FETCH_MESSAGES_OPENCHAT",
        "READ_CHAT_HISTORY",
    ],
    examples: [
        [
            {
                content: {
                    text: "What are the recent messages in the OpenChat group?",
                },
            } as any,
            {
                content: {
                    text: "Let me check the recent messages.",
                    action: "READ_OPENCHAT_MESSAGES",
                },
            } as any,
        ],
    ],

    validate: async (runtime: IAgentRuntime, message: Memory) => {
        try {
            const service = (runtime as any).getService?.("openchat") as OpenChatClientService | undefined;
            if (!service) return false;
            
            for (const installation of service.getInstallations().values()) {
                if (installation.permissions.includes("ReadMessages")) {
                    return true;
                }
            }
            return false;
        } catch {
            return false;
        }
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        options?: any,
        callback?: HandlerCallback
    ) => {
        try {
            const service = (runtime as any).getService("openchat") as OpenChatClientService;
            if (!service) {
                runtime.logger?.error("[OpenChat] Service not available");
                return;
            }

            let targetInstallation;
            for (const installation of service.getInstallations().values()) {
                if (installation.permissions.includes("ReadMessages")) {
                    targetInstallation = installation;
                    break;
                }
            }

            if (!targetInstallation) {
                runtime.logger?.error("[OpenChat] No installation with ReadMessages permission");
                return;
            }

            const client = service.createClientForScope(
                targetInstallation.scope,
                runtime.getSetting("OPENCHAT_IC_HOST") || "",
                targetInstallation.permissions
            );

            const limit = options?.limit || 10;
            const messages = await (client as any).getMessages?.(limit);

            runtime.logger?.success?.(`[OpenChat] Retrieved ${messages?.length || 0} messages`);

            if (callback) {
                callback({
                    text: messages ? `Retrieved ${messages.length} messages` : "Messages retrieved",
                    content: { success: true, messages },
                });
            }
        } catch (error: any) {
            runtime.logger?.error("[OpenChat] Error reading messages:", error?.message || error);
            if (callback) {
                callback({
                    text: `Failed to read messages: ${error?.message || "Unknown error"}`,
                    content: { error: error?.message || "Unknown error" },
                });
            }
        }
    },
};

export default readMessagesAction;
