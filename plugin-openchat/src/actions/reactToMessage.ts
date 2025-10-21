import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { OpenChatClientService } from "../services/openchatClient.js";

/**
 * Action to react to a message on OpenChat
 */
export const reactToMessageAction: Action = {
    name: "REACT_TO_OPENCHAT_MESSAGE",
    description: "React to a message on OpenChat with an emoji",
    similes: [
        "ADD_REACTION_OPENCHAT",
        "REACT_OPENCHAT",
        "EMOJI_REACT_OPENCHAT",
    ],
    examples: [
        [
            {
                content: {
                    text: "React to that message with a thumbs up",
                },
            } as any,
            {
                content: {
                    text: "I'll react with 👍",
                    action: "REACT_TO_OPENCHAT_MESSAGE",
                },
            } as any,
        ],
    ],

    validate: async (runtime: IAgentRuntime, message: Memory) => {
        try {
            const service = (runtime as any).getService?.("openchat") as OpenChatClientService | undefined;
            if (!service) return false;
            
            // Check if any installation has ReactToMessages permission
            for (const installation of service.getInstallations().values()) {
                if (installation.permissions.includes("ReactToMessages")) {
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

            // Get emoji from options or default to 👍
            const emoji = options?.emoji || "👍";
            const messageId = options?.messageId;

            if (!messageId) {
                runtime.logger?.error("[OpenChat] No messageId provided for reaction");
                return;
            }

            // Get first installation with react permission
            let targetInstallation;
            for (const installation of service.getInstallations().values()) {
                if (installation.permissions.includes("ReactToMessages")) {
                    targetInstallation = installation;
                    break;
                }
            }

            if (!targetInstallation) {
                runtime.logger?.error("[OpenChat] No installation with ReactToMessages permission");
                return;
            }

            const client = service.createClientForScope(
                targetInstallation.scope,
                runtime.getSetting("OPENCHAT_IC_HOST") || "",
                targetInstallation.permissions
            );

            // React to message
            await (client as any).reactToMessage(messageId, emoji);

            runtime.logger?.success?.(`[OpenChat] Reacted to message with ${emoji}`);

            if (callback) {
                callback({
                    text: `Reacted with ${emoji}`,
                    content: { success: true },
                });
            }
        } catch (error: any) {
            runtime.logger?.error("[OpenChat] Error reacting to message:", error?.message || error);
            if (callback) {
                callback({
                    text: `Failed to react: ${error?.message || "Unknown error"}`,
                    content: { error: error?.message || "Unknown error" },
                });
            }
        }
    },
};

export default reactToMessageAction;
