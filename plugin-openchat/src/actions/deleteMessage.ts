import type { Action } from "@elizaos/core";

/**
 * Action to delete a message in OpenChat
 */
export const deleteMessageAction: Action = {
    name: "DELETE_OPENCHAT_MESSAGE",
    similes: [
        "OPENCHAT_DELETE",
        "REMOVE_MESSAGE_OPENCHAT",
        "DELETE_OPENCHAT",
    ],
    description: "Delete a message from OpenChat",
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
                console.error("No bot client available");
                return;
            }

            const messageId = context.messageId || context.deleteMessageId;

            if (!messageId) {
                console.warn("No message ID provided for deletion");
                return;
            }

            if (typeof botClient.deleteMessage === 'function') {
                await botClient.deleteMessage(messageId);
                console.log(`✅ Deleted message ${messageId}`);
            } else {
                console.warn("Delete message feature not available in bot client");
                return;
            }

            if (callback) {
                callback({
                    text: `Message deleted successfully`,
                    action: "DELETE_OPENCHAT_MESSAGE",
                });
            }
        } catch (error: any) {
            console.error("❌ Error deleting message:", error);
            if (callback) {
                callback({
                    text: `Error deleting message: ${error?.message || 'Unknown error'}`,
                });
            }
        }
    },
    examples: [],
};

export default deleteMessageAction;
