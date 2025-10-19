import type {
    Action,
    IAgentRuntime,
    Memory,
    State,
    HandlerCallback,
} from "@eliza/core";
import type { OpenChatClient } from "../client";

/**
 * Action to delete messages in OpenChat
 */
export const deleteMessageAction: Action = {
    name: "DELETE_OPENCHAT_MESSAGE",
    similes: ["DELETE_MESSAGE", "REMOVE_MESSAGE", "DELETE"],
    description: "Deletes one or more messages in an OpenChat conversation",
    
    validate: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<boolean> => {
        const hasClient = runtime.clients?.some(
            (c: any) => c instanceof Object && c.constructor.name === "OpenChatClient"
        );
        
        const isOpenChat = message.content?.source === "openchat";
        const hasMessageIds = state?.messageIdsToDelete || state?.deleteMessageIds;
        
        return hasClient && isOpenChat && hasMessageIds;
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

            // Get message IDs to delete
            const messageIds = state?.messageIdsToDelete || state?.deleteMessageIds || [];
            const messageIdsBigInt = messageIds.map((id: string | bigint) => 
                typeof id === "string" ? BigInt(id) : id
            );

            if (messageIdsBigInt.length === 0) {
                runtime.logger?.error("No message IDs to delete");
                return false;
            }

            // Get thread info if applicable
            const thread = message.content?.metadata?.threadRootMessageId;

            // Delete the messages
            await client.deleteMessages(botClient, messageIdsBigInt, thread);
            
            if (callback) {
                callback({
                    text: `Deleted ${messageIdsBigInt.length} message(s)`,
                    source: "openchat",
                    action: "DELETE_OPENCHAT_MESSAGE",
                });
            }

            runtime.logger?.info("Messages deleted successfully", { count: messageIdsBigInt.length });
            return true;
        } catch (error) {
            runtime.logger?.error("Error deleting messages in OpenChat", error);
            return false;
        }
    },
    
    examples: [
        [
            {
                user: "user",
                content: { text: "Delete my last message" },
            },
            {
                user: "assistant",
                content: { 
                    text: "Deleting message", 
                    action: "DELETE_OPENCHAT_MESSAGE",
                },
            },
        ],
    ],
};
