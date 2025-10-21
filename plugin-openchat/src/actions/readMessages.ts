import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { OpenChatClientService } from "../services/openchatClient.js";

/**
 * READ_OPENCHAT_MESSAGES Action
 * Inspired by openai bot's prompt.ts chatEvents pattern
 * 
 * Reads recent messages from OpenChat using chatEvents API
 */
export const readMessagesAction: Action = {
    name: "READ_OPENCHAT_MESSAGES",
    description: "Read recent messages from an OpenChat group or channel",
    similes: [
        "GET_OPENCHAT_MESSAGES",
        "FETCH_MESSAGES_OPENCHAT",
        "READ_CHAT_HISTORY",
        "SHOW_RECENT_MESSAGES",
    ],
    examples: [
        [
            {
                content: {
                    text: "What are the recent messages in OpenChat?",
                },
            } as any,
            {
                content: {
                    text: "I'll read the recent messages for you",
                    action: "READ_OPENCHAT_MESSAGES",
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

            // Check if any installation has ReadMessages permission
            for (const installation of service.getInstallations().values()) {
                if (installation.permissions?.includes("ReadMessages")) {
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

            // Find installation with ReadMessages permission
            let targetInstallation;
            for (const installation of service.getInstallations().values()) {
                if (installation.permissions?.includes("ReadMessages")) {
                    targetInstallation = installation;
                    break;
                }
            }

            if (!targetInstallation) {
                runtime.logger?.error("[OpenChat] No ReadMessages permission");
                if (callback) {
                    callback({
                        text: "Bot doesn't have permission to read messages",
                        content: { error: "No ReadMessages permission" },
                    });
                }
                return;
            }

            const { scope, permissions } = targetInstallation;

            runtime.logger?.info("[OpenChat] Reading messages...");

            // Create client for autonomous context
            const client = service.createClientForScope(
                scope,
                (targetInstallation as any).apiGateway || runtime.getSetting("OPENCHAT_IC_HOST") || "",
                permissions
            );

            // Get chat summary first (pattern from openai/prompt.ts)
            const chat = await client.chatSummary();
            if (chat.kind === "error") {
                runtime.logger?.error("[OpenChat] Failed to get chat summary");
                runtime.logger?.error(JSON.stringify(chat));
                if (callback) {
                    callback({
                        text: "Failed to get chat information",
                        content: { error: "Chat summary failed" },
                    });
                }
                return;
            }

            // Get recent chat events (pattern from openai/prompt.ts)
            const resp = await client.chatEvents({
                kind: "chat_events_page",
                ascending: false,
                startEventIndex: chat.latestEventIndex,
                maxEvents: options?.maxEvents || 50,
                maxMessages: options?.maxMessages || 20,
            });

            if (resp.kind !== "success") {
                runtime.logger?.error("[OpenChat] Failed to get messages");
                runtime.logger?.error(JSON.stringify(resp));
                if (callback) {
                    callback({
                        text: "Failed to read messages",
                        content: { error: "Chat events failed" },
                    });
                }
                return;
            }

            // Extract text messages
            const messages: any[] = [];
            for (const ev of resp.events.reverse()) {
                if (ev.event.kind === "message" && ev.event.content.kind === "text_content") {
                    messages.push({
                        text: ev.event.content.text,
                        sender: ev.event.sender,
                        timestamp: ev.timestamp,
                    });
                }
            }

            runtime.logger?.info(`[OpenChat] ✅ Read ${messages.length} messages`);

            if (callback) {
                const summary = messages.length > 0
                    ? `Found ${messages.length} recent messages. Latest: "${messages[messages.length - 1].text.substring(0, 50)}..."`
                    : "No recent messages found";
                    
                callback({
                    text: summary,
                    content: { success: true, messages, count: messages.length },
                });
            }
        } catch (error: any) {
            runtime.logger?.error("[OpenChat] Error reading messages:", error);
            if (callback) {
                callback({
                    text: `Error reading messages: ${error.message}`,
                    content: { error: error.message },
                });
            }
        }
    },
};

export default readMessagesAction;
