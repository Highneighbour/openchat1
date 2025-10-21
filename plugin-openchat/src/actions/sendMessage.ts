import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { OpenChatClientService } from "../services/openchatClient.js";
import { OpenChatScope } from "../types/index.js";

/**
 * Action to send a message to OpenChat
 */
export const sendMessageAction: Action = {
    name: "SEND_OPENCHAT_MESSAGE",
    description: "Send a message to an OpenChat group, channel, or direct chat",
    similes: [
        "SEND_MESSAGE_TO_OPENCHAT",
        "POST_TO_OPENCHAT",
        "MESSAGE_OPENCHAT",
        "REPLY_ON_OPENCHAT",
    ],
    examples: [
        [
            {
                content: {
                    text: "Send a message to the OpenChat group saying hello",
                },
            } as any,
            {
                content: {
                    text: "I'll send that message to OpenChat.",
                    action: "SEND_OPENCHAT_MESSAGE",
                },
            } as any,
        ],
    ],

    validate: async (runtime: IAgentRuntime, message: Memory) => {
        try {
            // Check if OpenChat service is available
            const service = (runtime as any).getService?.("openchat") as OpenChatClientService | undefined;

            if (!service) {
                runtime.logger?.debug("[OpenChat Action] Service not found");
                return false;
            }

            // Validate that we have at least one installation
            const hasInstallations = service.getInstallations().size > 0;
            runtime.logger?.debug(`[OpenChat Action] Has installations: ${hasInstallations}, count: ${service.getInstallations().size}`);
            
            // Always return true if service exists (installations may be added later)
            return true;
        } catch (error: any) {
            runtime.logger?.warn("[OpenChat Action] Validation error:", error.message);
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
            runtime.logger?.info("[OpenChat Action] Handler invoked");
            const service = (runtime as any).getService("openchat") as OpenChatClientService;

            if (!service) {
                const errorMsg = "OpenChat service not available. Make sure the plugin is properly initialized.";
                runtime.logger?.error("[OpenChat]", errorMsg);
                if (callback) {
                    callback({
                        text: errorMsg,
                        content: { error: errorMsg },
                    });
                }
                return;
            }

            runtime.logger?.debug(`[OpenChat] Service found, installations: ${service.getInstallations().size}`);

            // Extract message text from state or message content
            const messageText = (state as any)?.messageText 
                || message.content.text 
                || (message.content as any)?.message;

            if (!messageText) {
                const errorMsg = "No message text provided to send to OpenChat";
                runtime.logger?.error("[OpenChat]", errorMsg);
                if (callback) {
                    callback({
                        text: errorMsg,
                        content: { error: errorMsg },
                    });
                }
                return;
            }

            runtime.logger?.debug("[OpenChat] Extracted message text:", String(messageText).substring(0, 50));

            // Get target scope from options or use first installation
            let targetScope: OpenChatScope | undefined;
            let permissions: string[] = [];

            if (options?.scope) {
                targetScope = options.scope;
                const installation = service
                    .getInstallations()
                    .get(`${options.scope.kind}-${options.scope.chatId}`);
                permissions = installation?.permissions || [];
            } else {
                // Use first available installation
                const firstInstallation = Array.from(
                    service.getInstallations().values()
                )[0];
                if (firstInstallation) {
                    targetScope = firstInstallation.scope;
                    permissions = firstInstallation.permissions;
                    runtime.logger?.debug("[OpenChat] Using first installation:", targetScope.kind, targetScope.chatId);
                }
            }

            if (!targetScope) {
                const errorMsg = "No OpenChat installations found. Please install the bot in an OpenChat group/channel first.";
                runtime.logger?.error("[OpenChat]", errorMsg);
                if (callback) {
                    callback({
                        text: errorMsg,
                        content: { error: errorMsg },
                    });
                }
                return;
            }

            // Create client for scope
            const client = service.createClientForScope(
                targetScope,
                runtime.getSetting("OPENCHAT_IC_HOST") || "",
                permissions
            );

            runtime.logger?.info("[OpenChat] Sending message to", targetScope.kind, targetScope.chatId);

            // Send message (must be finalized)
            const msg = (await client.createTextMessage(messageText)).setFinalised(true);
            await client.sendMessage(msg);

            const successMsg = `Message sent to OpenChat ${targetScope.kind}`;
            if (runtime.logger?.success) {
                runtime.logger.success(`[OpenChat] ${successMsg}: ${targetScope.chatId}`);
            }

            if (callback) {
                callback({
                    text: successMsg,
                    content: { success: true, targetScope },
                });
            }
        } catch (error: any) {
            const errorMsg = `Failed to send message to OpenChat: ${error?.message || "Unknown error"}`;
            runtime.logger?.error("[OpenChat] Error sending message:", error?.message || error);
            if (callback) {
                callback({
                    text: errorMsg,
                    content: { error: error?.message || "Unknown error" },
                });
            }
        }
    },
};

export default sendMessageAction;
