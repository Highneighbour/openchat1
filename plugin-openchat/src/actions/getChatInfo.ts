import type {
    Action,
    IAgentRuntime,
    Memory,
    State,
    HandlerCallback,
} from "@eliza/core";
import type { OpenChatClient } from "../client";

/**
 * Action to get information about the current OpenChat conversation
 */
export const getChatInfoAction: Action = {
    name: "GET_OPENCHAT_INFO",
    similes: ["GET_CHAT_INFO", "CHAT_DETAILS", "CHAT_SUMMARY"],
    description: "Gets information about the current OpenChat conversation",
    
    validate: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<boolean> => {
        const hasClient = runtime.clients?.some(
            (c: any) => c instanceof Object && c.constructor.name === "OpenChatClient"
        );
        
        const isOpenChat = message.content?.source === "openchat";
        
        return !!(hasClient && isOpenChat);
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

            // Get chat summary
            const summary = await client.getChatSummary(botClient);
            
            // Get members
            const members = await client.getChatMembers(botClient);

            // Build info response
            const infoLines = ["Current Chat Information:"];
            
            if (summary) {
                if (summary.name) infoLines.push(`Name: ${summary.name}`);
                if (summary.description) infoLines.push(`Description: ${summary.description}`);
                if (summary.member_count) infoLines.push(`Members: ${summary.member_count}`);
                if (summary.is_public !== undefined) {
                    infoLines.push(`Type: ${summary.is_public ? "Public" : "Private"}`);
                }
            }

            if (members?.participants) {
                const admins = members.participants.filter((p: any) => 
                    p.role === "Admin" || p.role === "Owner"
                );
                if (admins.length > 0) {
                    infoLines.push(`Admins: ${admins.length}`);
                }
            }

            const responseText = infoLines.join("\n");
            
            if (callback) {
                callback({
                    text: responseText,
                    source: "openchat",
                    action: "GET_OPENCHAT_INFO",
                    data: { summary, members },
                });
            }

            runtime.logger?.info("Chat info retrieved successfully");
            return true;
        } catch (error) {
            runtime.logger?.error("Error getting chat info from OpenChat", error);
            return false;
        }
    },
    
    examples: [
        [
            {
                user: "user",
                content: { text: "Tell me about this chat" },
            },
            {
                user: "assistant",
                content: { 
                    text: "Getting chat information", 
                    action: "GET_OPENCHAT_INFO",
                },
            },
        ],
    ],
};
