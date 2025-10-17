import type { Action } from "@elizaos/core";

/**
 * Action to react to a message in OpenChat
 */
export const reactToMessageAction: Action = {
    name: "REACT_TO_OPENCHAT_MESSAGE",
    similes: [
        "OPENCHAT_REACT",
        "ADD_REACTION_OPENCHAT",
        "REACT_OPENCHAT",
        "EMOJI_OPENCHAT",
    ],
    description: "Add a reaction/emoji to an OpenChat message",
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

            const reaction = context.reaction || context.emoji || "👍";
            const messageId = context.messageId;

            if (!messageId) {
                console.warn("No message ID provided for reaction");
                return;
            }

            if (typeof botClient.addReaction === 'function') {
                await botClient.addReaction(messageId, reaction);
                console.log(`✅ Added reaction ${reaction} to message`);
            } else {
                console.warn("Reaction feature not available in bot client");
                return;
            }

            if (callback) {
                callback({
                    text: `Reaction added successfully`,
                    action: "REACT_TO_OPENCHAT_MESSAGE",
                });
            }
        } catch (error: any) {
            console.error("❌ Error adding reaction:", error);
            if (callback) {
                callback({
                    text: `Error adding reaction: ${error?.message || 'Unknown error'}`,
                });
            }
        }
    },
    examples: [],
};

export default reactToMessageAction;
