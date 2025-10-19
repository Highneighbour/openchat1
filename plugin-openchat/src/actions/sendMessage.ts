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
                user: "user",
                content: {
                    text: "Send a message to the OpenChat group saying hello",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll send that message to OpenChat.",
                    action: "SEND_OPENCHAT_MESSAGE",
                },
            },
        ],
        [
            {
                user: "user",
                content: {
                    text: "Post an update on OpenChat about the new features",
                },
            },
            {
                user: "assistant",
                content: {
                    text: "I'll post that update to OpenChat.",
                    action: "SEND_OPENCHAT_MESSAGE",
                },
            },
        ],
    ],

    validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
        // Check if OpenChat service is available
        const service = runtime.getService(
            "openchat"
        ) as OpenChatClientService | undefined;

        if (!service) {
            return false;
        }

        // Validate that we have at least one installation
        return service.getInstallations().size > 0;
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback?: HandlerCallback
    ): Promise<boolean> => {
        try {
            const service = runtime.getService(
                "openchat"
            ) as OpenChatClientService;

            if (!service) {
                runtime.logger.error("[OpenChat] Service not available");
                return false;
            }

            // Extract message text
            const messageText = message.content.text;

            if (!messageText) {
                runtime.logger.error("[OpenChat] No message text provided");
                return false;
            }

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
                }
            }

            if (!targetScope) {
                runtime.logger.error("[OpenChat] No target scope available");
                return false;
            }

            // Create client for scope
            const client = service.createClientForScope(
                targetScope,
                runtime.getSetting("OPENCHAT_IC_HOST") || "",
                permissions
            );

            // Send message
            await client.sendTextMessage(messageText);

            runtime.logger.success(
                `[OpenChat] Message sent to ${targetScope.kind}: ${targetScope.chatId}`
            );

            if (callback) {
                callback({
                    text: `Message sent to OpenChat ${targetScope.kind}`,
                    content: { success: true },
                });
            }

            return true;
        } catch (error) {
            runtime.logger.error("[OpenChat] Error sending message:", error);
            if (callback) {
                callback({
                    text: `Failed to send message to OpenChat: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
};

export default sendMessageAction;
