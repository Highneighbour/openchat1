import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { OpenChatClientService } from "../services/openchatClient.js";

/**
 * DELETE_OPENCHAT_MESSAGE Action
 * Deletes messages for moderation purposes
 */
export const deleteMessageAction: Action = {
    name: "DELETE_OPENCHAT_MESSAGE",
    description: "Delete a message on OpenChat (moderation)",
    similes: [
        "REMOVE_OPENCHAT_MESSAGE",
        "DELETE_MESSAGE",
        "REMOVE_MESSAGE",
    ],
    examples: [
        [
            {
                content: {
                    text: "Delete that inappropriate message",
                },
            } as any,
            {
                content: {
                    text: "I'll delete that message",
                    action: "DELETE_OPENCHAT_MESSAGE",
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

            // Check if any installation has DeleteMessages permission
            for (const installation of service.getInstallations().values()) {
                if (installation.permissions?.includes("DeleteMessages")) {
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

            // Find installation with DeleteMessages permission
            let targetInstallation;
            for (const installation of service.getInstallations().values()) {
                if (installation.permissions?.includes("DeleteMessages")) {
                    targetInstallation = installation;
                    break;
                }
            }

            if (!targetInstallation) {
                runtime.logger?.error("[OpenChat] No DeleteMessages permission");
                if (callback) {
                    callback({
                        text: "Bot doesn't have permission to delete messages",
                        content: { error: "No DeleteMessages permission" },
                    });
                }
                return;
            }

            const { scope, permissions } = targetInstallation;
            const messageId = options?.messageId;

            if (!messageId) {
                runtime.logger?.error("[OpenChat] No messageId provided");
                if (callback) {
                    callback({
                        text: "Message ID required to delete",
                        content: { error: "No messageId" },
                    });
                }
                return;
            }

            runtime.logger?.info(`[OpenChat] Deleting message ${messageId}...`);

            // Create client for autonomous context
            const client = service.createClientForScope(
                scope,
                (targetInstallation as any).apiGateway || runtime.getSetting("OPENCHAT_IC_HOST") || "",
                permissions
            );

            // Delete message
            const result = await (client as any).deleteMessage?.(messageId);

            if (result && result.kind !== "success") {
                runtime.logger?.error("[OpenChat] Delete failed:", result);
                if (callback) {
                    callback({
                        text: "Failed to delete message",
                        content: { error: "Delete failed" },
                    });
                }
                return;
            }

            runtime.logger?.info("[OpenChat] ✅ Message deleted");

            if (callback) {
                callback({
                    text: "Message deleted successfully",
                    content: { success: true },
                });
            }
        } catch (error: any) {
            runtime.logger?.error("[OpenChat] Error deleting message:", error);
            if (callback) {
                callback({
                    text: `Error deleting message: ${error.message}`,
                    content: { error: error.message },
                });
            }
        }
    },
};

export default deleteMessageAction;
