import type {
    Action,
    IAgentRuntime,
    Memory,
    State,
    HandlerCallback,
} from "@eliza/core";
import type { OpenChatClient } from "../client";

/**
 * Action to send a message to OpenChat
 */
export const sendMessageAction: Action = {
    name: "SEND_OPENCHAT_MESSAGE",
    similes: ["SEND_MESSAGE", "REPLY", "RESPOND", "ANSWER"],
    description: "Sends a message to an OpenChat conversation",
    
    validate: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<boolean> => {
        // Validate that we have an OpenChat client
        const hasClient = runtime.clients?.some(
            (c: any) => c instanceof Object && c.constructor.name === "OpenChatClient"
        );
        
        // Validate that we have message content
        const hasContent = message.content?.text && message.content.text.length > 0;
        
        // Validate that the source is OpenChat
        const isOpenChat = message.content?.source === "openchat";
        
        return !!(hasClient && hasContent && isOpenChat);
    },
    
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        options?: any,
        callback?: HandlerCallback
    ): Promise<boolean> => {
        try {
            const client = runtime.clients?.find(
                (c: any) => c instanceof Object && c.constructor.name === "OpenChatClient"
            ) as OpenChatClient | undefined;

            if (!client) {
                runtime.logger?.error("OpenChat client not found");
                return false;
            }

            const roomId = message.roomId?.toString();
            if (!roomId) {
                runtime.logger?.error("Room ID not found");
                return false;
            }

            const botClient = client.getActiveClient(roomId);
            if (!botClient) {
                runtime.logger?.error("Bot client not found for room", { roomId });
                return false;
            }

            // Get the response text from state or generate one
            let responseText = state?.responseText || message.content?.text;
            
            if (!responseText) {
                runtime.logger?.error("No response text available");
                return false;
            }

            // Send the message
            await client.sendMessage(botClient, responseText);
            
            if (callback) {
                callback({
                    text: responseText,
                    source: "openchat",
                    action: "SEND_OPENCHAT_MESSAGE",
                });
            }

            runtime.logger?.info("Message sent successfully to OpenChat");
            return true;
        } catch (error) {
            runtime.logger?.error("Error sending message to OpenChat", error);
            return false;
        }
    },
    
    examples: [
        [
            {
                user: "user",
                content: { text: "Hello, how are you?" },
            },
            {
                user: "assistant",
                content: { text: "I'm doing great! How can I help you today?", action: "SEND_OPENCHAT_MESSAGE" },
            },
        ],
    ],
};
