import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { OpenChatClientService } from "../services/openchatClient.js";

/**
 * Action to get chat summary from OpenChat
 */
export const getChatSummaryAction: Action = {
    name: "GET_OPENCHAT_SUMMARY",
    description: "Get a summary of the OpenChat conversation",
    similes: [
        "READ_OPENCHAT_SUMMARY",
        "OPENCHAT_CHAT_SUMMARY",
        "GET_CHAT_INFO",
    ],
    examples: [
        [
            {
                content: {
                    text: "What's the summary of this OpenChat group?",
                },
            } as any,
            {
                content: {
                    text: "Let me get the chat summary for you.",
                    action: "GET_OPENCHAT_SUMMARY",
                },
            } as any,
        ],
    ],

    validate: async (runtime: IAgentRuntime, message: Memory) => {
        try {
            const service = (runtime as any).getService?.("openchat") as OpenChatClientService | undefined;
            if (!service) return false;
            
            for (const installation of service.getInstallations().values()) {
                if (installation.permissions.includes("ReadChatSummary")) {
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
                if (installation.permissions.includes("ReadChatSummary")) {
                    targetInstallation = installation;
                    break;
                }
            }

            if (!targetInstallation) {
                runtime.logger?.error("[OpenChat] No installation with ReadChatSummary permission");
                return;
            }

            const client = service.createClientForScope(
                targetInstallation.scope,
                runtime.getSetting("OPENCHAT_IC_HOST") || "",
                targetInstallation.permissions
            );

            const summary = await (client as any).getChatSummary?.();

            runtime.logger?.success?.("[OpenChat] Retrieved chat summary");

            if (callback) {
                callback({
                    text: summary ? JSON.stringify(summary) : "Chat summary retrieved",
                    content: { success: true, summary },
                });
            }
        } catch (error: any) {
            runtime.logger?.error("[OpenChat] Error getting chat summary:", error?.message || error);
            if (callback) {
                callback({
                    text: `Failed to get summary: ${error?.message || "Unknown error"}`,
                    content: { error: error?.message || "Unknown error" },
                });
            }
        }
    },
};

export default getChatSummaryAction;
