import type {
    Action,
    IAgentRuntime,
    Memory,
    State,
    HandlerCallback,
} from "@eliza/core";
import type { OpenChatClient } from "../client";

/**
 * Action to add a reaction to an OpenChat message
 */
export const addReactionAction: Action = {
    name: "ADD_OPENCHAT_REACTION",
    similes: ["REACT", "ADD_REACTION", "EMOJI_REACT"],
    description: "Adds a reaction emoji to an OpenChat message",
    
    validate: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<boolean> => {
        const hasClient = runtime.clients?.some(
            (c: any) => c instanceof Object && c.constructor.name === "OpenChatClient"
        );
        
        const isOpenChat = message.content?.source === "openchat";
        const hasReaction = state?.reaction;
        
        return !!(hasClient && isOpenChat && hasReaction);
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

            // Get the reaction emoji
            const reaction = state?.reaction || options?.reaction || "👍";
            
            // Get the message ID to react to
            const messageId = message.content?.metadata?.messageId 
                ? BigInt(message.content.metadata.messageId)
                : undefined;

            if (!messageId) {
                runtime.logger?.error("Message ID not found");
                return false;
            }

            // Get thread info if applicable
            const thread = message.content?.metadata?.threadRootMessageId;

            // Add the reaction
            await client.addReaction(botClient, messageId, reaction, thread);
            
            if (callback) {
                callback({
                    text: `Reacted with ${reaction}`,
                    source: "openchat",
                    action: "ADD_OPENCHAT_REACTION",
                });
            }

            runtime.logger?.info("Reaction added successfully", { messageId, reaction });
            return true;
        } catch (error) {
            runtime.logger?.error("Error adding reaction to OpenChat", error);
            return false;
        }
    },
    
    examples: [
        [
            {
                user: "user",
                content: { text: "Great job on that!" },
            },
            {
                user: "assistant",
                content: { text: "Thanks!", action: "ADD_OPENCHAT_REACTION", reaction: "🎉" },
            },
        ],
    ],
};
