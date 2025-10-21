import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { OpenChatClientService } from "../services/openchatClient.js";

/**
 * Action to delete a message on OpenChat
 */
export const deleteMessageAction: Action = {
    name: "DELETE_OPENCHAT_MESSAGE",
    description: "Delete a message on OpenChat (requires DeleteMessages permission)",
    similes: [
        "REMOVE_OPENCHAT_MESSAGE",
        "DELETE_MESSAGE_OPENCHAT",
    ],
    examples: [
        [
            {
                content: {
                    text: "Delete that message",
                },
            } as any,
            {
                content: {
                    text: "I'll delete that message.",
                    action: "DELETE_OPENCHAT_MESSAGE",
                },
            } as any,
        ],
    ],

    validate: async (runtime: IAgentRuntime, message: Memory) => {
        try {
            const service = (runtime as any).getService?.("openchat") as OpenChatClientService | undefined;
            if (!service) return false;
            
            for (const installation of service.getInstallations().values()) {
                if (installation.permissions.includes("DeleteMessages")) {
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

            const messageId = options?.messageId;
            if (!messageId) {
                runtime.logger?.error("[OpenChat] No messageId provided for deletion");
                return;
            }

            let targetInstallation;
            for (const installation of service.getInstallations().values()) {
                if (installation.permissions.includes("DeleteMessages")) {
                    targetInstallation = installation;
                    break;
                }
            }

            if (!targetInstallation) {
                runtime.logger?.error("[OpenChat] No installation with DeleteMessages permission");
                return;
            }

            const client = service.createClientForScope(
                targetInstallation.scope,
                runtime.getSetting("OPENCHAT_IC_HOST") || "",
                targetInstallation.permissions
            );

            await (client as any).deleteMessage(messageId);

            runtime.logger?.success?.("[OpenChat] Message deleted");

            if (callback) {
                callback({
                    text: "Message deleted",
                    content: { success: true },
                });
            }
        } catch (error: any) {
            runtime.logger?.error("[OpenChat] Error deleting message:", error?.message || error);
            if (callback) {
                callback({
                    text: `Failed to delete message: ${error?.message || "Unknown error"}`,
                    content: { error: error?.message || "Unknown error" },
                });
            }
        }
    },
};

export default deleteMessageAction;
