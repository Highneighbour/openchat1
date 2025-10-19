import type {
    IAgentRuntime,
    Memory,
    Provider,
    State,
} from "@eliza/core";
import type { OpenChatClient } from "../client";

/**
 * Provider for OpenChat chat information
 * Provides context about the current chat, members, and recent messages
 */
export const openChatProvider: Provider = {
    get: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<string> => {
        try {
            const client = runtime.clients?.find(
                (c: any) => c instanceof Object && c.constructor.name === "OpenChatClient"
            ) as OpenChatClient | undefined;

            if (!client) {
                return "";
            }

            const roomId = message.roomId?.toString();
            if (!roomId) {
                return "";
            }

            const botClient = client.getActiveClient(roomId);
            if (!botClient) {
                return "";
            }

            // Gather chat information
            const chatInfo: string[] = [];

            // Get chat summary
            try {
                const summary = await client.getChatSummary(botClient);
                if (summary) {
                    chatInfo.push("Chat Information:");
                    if (summary.name) {
                        chatInfo.push(`- Chat Name: ${summary.name}`);
                    }
                    if (summary.description) {
                        chatInfo.push(`- Description: ${summary.description}`);
                    }
                    if (summary.member_count !== undefined) {
                        chatInfo.push(`- Members: ${summary.member_count}`);
                    }
                }
            } catch (error) {
                runtime.logger?.debug("Could not fetch chat summary", error);
            }

            // Get member information
            try {
                const members = await client.getChatMembers(botClient);
                if (members?.participants?.length) {
                    chatInfo.push(`\nActive Participants: ${members.participants.length}`);
                }
            } catch (error) {
                runtime.logger?.debug("Could not fetch members", error);
            }

            // Add context about message source
            const metadata = message.content?.metadata;
            if (metadata) {
                chatInfo.push("\nMessage Context:");
                if (metadata.isThread) {
                    chatInfo.push("- This is a thread message");
                }
                if (metadata.channelId) {
                    chatInfo.push(`- Channel ID: ${metadata.channelId}`);
                }
                if (metadata.communityId) {
                    chatInfo.push(`- Community ID: ${metadata.communityId}`);
                }
            }

            return chatInfo.length > 0 ? chatInfo.join("\n") : "";
        } catch (error) {
            runtime.logger?.error("Error in openChatProvider", error);
            return "";
        }
    },
};

/**
 * Provider for OpenChat user information
 * Provides context about users in the current chat
 */
export const openChatUserProvider: Provider = {
    get: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<string> => {
        try {
            const client = runtime.clients?.find(
                (c: any) => c instanceof Object && c.constructor.name === "OpenChatClient"
            ) as OpenChatClient | undefined;

            if (!client) {
                return "";
            }

            const roomId = message.roomId?.toString();
            if (!roomId) {
                return "";
            }

            const botClient = client.getActiveClient(roomId);
            if (!botClient) {
                return "";
            }

            const userInfo: string[] = [];

            // Get information about the message sender
            const userId = message.userId?.toString();
            if (userId) {
                userInfo.push(`Current User: ${userId}`);
            }

            // Get member list to check roles
            try {
                const members = await client.getChatMembers(botClient);
                if (members?.participants) {
                    const currentUser = members.participants.find(
                        (p: any) => p.user_id?.toString() === userId
                    );
                    
                    if (currentUser) {
                        userInfo.push(`Role: ${currentUser.role || "Participant"}`);
                    }

                    // List admins and owners
                    const admins = members.participants.filter(
                        (p: any) => p.role === "Admin" || p.role === "Owner"
                    );
                    if (admins.length > 0) {
                        userInfo.push(
                            `\nChat Admins: ${admins.map((a: any) => a.username || a.user_id).join(", ")}`
                        );
                    }
                }
            } catch (error) {
                runtime.logger?.debug("Could not fetch member information", error);
            }

            return userInfo.length > 0 ? userInfo.join("\n") : "";
        } catch (error) {
            runtime.logger?.error("Error in openChatUserProvider", error);
            return "";
        }
    },
};
