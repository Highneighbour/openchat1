import type { Action } from "@elizaos/core";

/**
 * Action to get information about an OpenChat conversation
 */
export const getChatInfoAction: Action = {
    name: "GET_OPENCHAT_INFO",
    similes: [
        "OPENCHAT_INFO",
        "CHAT_INFO_OPENCHAT",
        "GET_CHAT_OPENCHAT",
        "OPENCHAT_DETAILS",
    ],
    description: "Get information about an OpenChat conversation or group",
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

            const chatInfo: any = {
                commandName: botClient.commandName,
                available: true,
            };

            console.log("✅ Retrieved chat info:", chatInfo);

            if (callback) {
                callback({
                    text: `Chat info retrieved`,
                    content: chatInfo,
                    action: "GET_OPENCHAT_INFO",
                });
            }
        } catch (error: any) {
            console.error("❌ Error getting chat info:", error);
            if (callback) {
                callback({
                    text: `Error getting chat info: ${error?.message || 'Unknown error'}`,
                });
            }
        }
    },
    examples: [],
};

export default getChatInfoAction;
