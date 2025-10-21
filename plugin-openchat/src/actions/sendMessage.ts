import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { OpenChatClientService } from "../services/openchatClient.js";
import { ChatActionScope } from "@open-ic/openchat-botclient-ts";

/**
 * SEND_OPENCHAT_MESSAGE Action
 * Inspired by youtube_lambda/src/send.ts
 * 
 * Sends autonomous messages to OpenChat groups/channels
 * Uses createClientInAutonomouseContext pattern from working bots
 */
export const sendMessageAction: Action = {
    name: "SEND_OPENCHAT_MESSAGE",
    description: "Send a message to an OpenChat group, channel, or direct chat autonomously",
    similes: [
        "SEND_MESSAGE_TO_OPENCHAT",
        "POST_TO_OPENCHAT",
        "MESSAGE_OPENCHAT",
        "ANNOUNCE_ON_OPENCHAT",
    ],
    examples: [
        [
            {
                content: {
                    text: "Send a message to OpenChat saying hello",
                },
            } as any,
            {
                content: {
                    text: "I'll send that message to OpenChat",
                    action: "SEND_OPENCHAT_MESSAGE",
                },
            } as any,
        ],
    ],

    validate: async (runtime: IAgentRuntime, message: Memory) => {
        try {
            // Get service using multiple lookup methods
            let service = (runtime as any).getService?.("openchat") as OpenChatClientService;
            if (!service && (runtime as any).services) {
                service = (runtime as any).services.get("openchat");
            }
            if (!service) {
                service = (globalThis as any).__openchatService;
            }

            if (!service) {
                return false;
            }

            // Check if we have any installations
            return service.getInstallations().size > 0;
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
            // Get service
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

            // Get first installation (or use options.scope if provided)
            const installations = Array.from(service.getInstallations().values());
            if (installations.length === 0) {
                runtime.logger?.error("[OpenChat] No installations found");
                if (callback) {
                    callback({
                        text: "Bot not installed in any OpenChat groups",
                        content: { error: "No installations" },
                    });
                }
                return;
            }

            const installation = installations[0];
            const { scope, permissions } = installation;

            // Extract message text
            const messageText = options?.text || message.content.text || "Hello from ElizaOS!";

            runtime.logger?.info(`[OpenChat] Sending message: "${messageText.substring(0, 50)}..."`);

            // Create client using autonomous context (like youtube_lambda/send.ts)
            const client = service.createClientForScope(
                scope,
                (installation as any).apiGateway || runtime.getSetting("OPENCHAT_IC_HOST") || "",
                permissions
            );

            // Create and send message (pattern from send.ts)
            const msg = await client.createTextMessage(messageText);
            const result = await client.sendMessage(msg);

            if (result.kind !== "success") {
                runtime.logger?.error("[OpenChat] Send failed:", JSON.stringify(result));
                if (callback) {
                    callback({
                        text: "Failed to send message to OpenChat",
                        content: { error: result.kind },
                    });
                }
                return;
            }

            runtime.logger?.info("[OpenChat] ✅ Message sent successfully");

            if (callback) {
                callback({
                    text: "Message sent to OpenChat successfully",
                    content: { success: true, messageText },
                });
            }
        } catch (error: any) {
            runtime.logger?.error("[OpenChat] Error in sendMessage:", error);
            if (callback) {
                callback({
                    text: `Error sending message: ${error.message}`,
                    content: { error: error.message },
                });
            }
        }
    },
};

export default sendMessageAction;
