import type { Action } from "@elizaos/core";

/**
 * Action to send a message in OpenChat
 */
export const sendMessageAction: Action = {
    name: "SEND_OPENCHAT_MESSAGE",
    similes: [
        "SEND_MESSAGE_OPENCHAT",
        "OPENCHAT_SEND",
        "MESSAGE_OPENCHAT",
        "REPLY_OPENCHAT",
        "RESPOND_OPENCHAT",
    ],
    description: "Send a message to an OpenChat conversation",
    validate: async (runtime: any, message: any) => {
        const hasOpenChat = runtime.getSetting?.("OPENCHAT_PUBLIC_KEY");
        return !!hasOpenChat;
    },
    handler: async (
        runtime: any,
        message: any,
        state?: any,
        options?: any,
        callback?: any
    ) => {
        try {
            const context = message.content || {};
            const botClient = context.botClient || options?.botClient;

            if (!botClient) {
                console.error("No bot client available in context");
                return;
            }

            const text = context.text || state?.responseText || "";

            if (!text) {
                console.warn("No text content to send");
                return;
            }

            await botClient.createTextMessage(text);
            console.log(`✅ Message sent to OpenChat: "${text.substring(0, 50)}..."`);

            if (callback) {
                callback({
                    text: `Message sent successfully`,
                    action: "SEND_OPENCHAT_MESSAGE",
                });
            }
        } catch (error: any) {
            console.error("❌ Error sending OpenChat message:", error);
            if (callback) {
                callback({
                    text: `Error sending message: ${error?.message || 'Unknown error'}`,
                });
            }
        }
    },
    examples: [],
};

export default sendMessageAction;
