import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { OpenChatClientService } from "../services/openchatClient.js";

/**
 * GET_OPENCHAT_SUMMARY Action
 * Uses client.chatSummary() method from OpenChat SDK
 */
export const getChatSummaryAction: Action = {
    name: "GET_OPENCHAT_SUMMARY",
    description: "Get summary information about an OpenChat group or channel",
    similes: [
        "READ_OPENCHAT_SUMMARY",
        "OPENCHAT_CHAT_SUMMARY",
        "GET_CHAT_INFO",
        "OPENCHAT_INFO",
    ],
    examples: [
        [
            {
                content: {
                    text: "What's the summary of the OpenChat group?",
                },
            } as any,
            {
                content: {
                    text: "Let me get that summary for you",
                    action: "GET_OPENCHAT_SUMMARY",
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

            // Check if any installation has ReadChatSummary permission
            for (const installation of service.getInstallations().values()) {
                if (installation.permissions?.includes("ReadChatSummary")) {
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

            // Find installation with ReadChatSummary permission
            let targetInstallation;
            for (const installation of service.getInstallations().values()) {
                if (installation.permissions?.includes("ReadChatSummary")) {
                    targetInstallation = installation;
                    break;
                }
            }

            if (!targetInstallation) {
                runtime.logger?.error("[OpenChat] No ReadChatSummary permission");
                if (callback) {
                    callback({
                        text: "Bot doesn't have permission to read chat summary",
                        content: { error: "No ReadChatSummary permission" },
                    });
                }
                return;
            }

            const { scope, permissions } = targetInstallation;

            runtime.logger?.info("[OpenChat] Getting chat summary...");

            // Create client for autonomous context
            const client = service.createClientForScope(
                scope,
                (targetInstallation as any).apiGateway || runtime.getSetting("OPENCHAT_IC_HOST") || "",
                permissions
            );

            // Get chat summary
            const summary = await client.chatSummary();

            if (summary.kind === "error") {
                runtime.logger?.error("[OpenChat] Failed to get summary");
                runtime.logger?.error(JSON.stringify(summary));
                if (callback) {
                    callback({
                        text: "Failed to get chat summary",
                        content: { error: "Summary request failed" },
                    });
                }
                return;
            }

            runtime.logger?.info("[OpenChat] ✅ Got chat summary");

            // Format summary information
            const summaryText = `OpenChat Group Summary:
• Latest Event: ${summary.latestEventIndex}
• Type: ${scope.kind}
• Status: Active`;

            if (callback) {
                callback({
                    text: summaryText,
                    content: { success: true, summary },
                });
            }
        } catch (error: any) {
            runtime.logger?.error("[OpenChat] Error getting summary:", error);
            if (callback) {
                callback({
                    text: `Error getting summary: ${error.message}`,
                    content: { error: error.message },
                });
            }
        }
    },
};

export default getChatSummaryAction;
