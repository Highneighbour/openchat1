import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { OpenChatClientService } from "../services/openchatClient.js";

/**
 * REACT_TO_OPENCHAT_MESSAGE Action
 * Reacts to messages with emoji reactions
 */
export const reactToMessageAction: Action = {
    name: "REACT_TO_OPENCHAT_MESSAGE",
    description: "React to a message on OpenChat with an emoji",
    similes: [
        "ADD_REACTION_OPENCHAT",
        "REACT_OPENCHAT",
        "EMOJI_REACT",
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
                    text: "I'll add that reaction",
                    action: "REACT_TO_OPENCHAT_MESSAGE",
                },
            } as any,
        ],
    ],

    validate: async (runtime: IAgentRuntime, message: Memory) => {
        try {
            let service = (runtime as any).getService?.("openchat") as OpenChatClientService;
            if (!service && (runtime as any).services) {
                service = (runtime as any).services.get("openchat");
            }
            if (!service) {
                service = (globalThis as any).__openchatService;
            }

            if (!service) return false;

            // Check if any installation has ReactToMessages permission
            for (const installation of service.getInstallations().values()) {
                if (installation.permissions?.includes("ReactToMessages")) {
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
            let service = (runtime as any).getService?.("openchat") as OpenChatClientService;
            if (!service && (runtime as any).services) {
                service = (runtime as any).services.get("openchat");
            }
            if (!service) {
                service = (globalThis as any).__openchatService;
            }

            if (!service) {
                runtime.logger?.error("[OpenChat] Service not available");
                if (callback) {
                    callback({
                        text: "OpenChat service not available",
                        content: { error: "Service not found" },
                    });
                }
                return;
            }

            // Find installation with ReactToMessages permission
            let targetInstallation;
            for (const installation of service.getInstallations().values()) {
                if (installation.permissions?.includes("ReactToMessages")) {
                    targetInstallation = installation;
                    break;
                }
            }

            if (!targetInstallation) {
                runtime.logger?.error("[OpenChat] No ReactToMessages permission");
                if (callback) {
                    callback({
                        text: "Bot doesn't have permission to react to messages",
                        content: { error: "No ReactToMessages permission" },
                    });
                }
                return;
            }

            const { scope, permissions } = targetInstallation;
            const emoji = options?.emoji || "👍";
            const messageId = options?.messageId;

            if (!messageId) {
                runtime.logger?.error("[OpenChat] No messageId provided");
                if (callback) {
                    callback({
                        text: "Message ID required to react",
                        content: { error: "No messageId" },
                    });
                }
                return;
            }

            runtime.logger?.info(`[OpenChat] Reacting with ${emoji}...`);

            // Create client for autonomous context
            const client = service.createClientForScope(
                scope,
                (targetInstallation as any).apiGateway || runtime.getSetting("OPENCHAT_IC_HOST") || "",
                permissions
            );

            // Add reaction
            const result = await (client as any).addReaction?.(messageId, emoji);

            if (result && result.kind !== "success") {
                runtime.logger?.error("[OpenChat] Reaction failed:", result);
                if (callback) {
                    callback({
                        text: "Failed to add reaction",
                        content: { error: "Reaction failed" },
                    });
                }
                return;
            }

            runtime.logger?.info(`[OpenChat] ✅ Reacted with ${emoji}`);

            if (callback) {
                callback({
                    text: `Added ${emoji} reaction`,
                    content: { success: true, emoji },
                });
            }
        } catch (error: any) {
            runtime.logger?.error("[OpenChat] Error reacting:", error);
            if (callback) {
                callback({
                    text: `Error adding reaction: ${error.message}`,
                    content: { error: error.message },
                });
            }
        }
    },
};

export default reactToMessageAction;
