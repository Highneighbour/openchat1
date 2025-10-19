import type {
    Action,
    IAgentRuntime,
    Memory,
    State,
    HandlerCallback,
} from "@eliza/core";
import type { OpenChatClient } from "../client";

/**
 * Action to create a poll in OpenChat
 */
export const createPollAction: Action = {
    name: "CREATE_OPENCHAT_POLL",
    similes: ["CREATE_POLL", "MAKE_POLL", "START_POLL"],
    description: "Creates a poll in an OpenChat conversation",
    
    validate: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<boolean> => {
        const hasClient = runtime.clients?.some(
            (c: any) => c instanceof Object && c.constructor.name === "OpenChatClient"
        );
        
        const isOpenChat = message.content?.source === "openchat";
        const hasPollData = state?.poll || (state?.pollQuestion && state?.pollOptions);
        
        return hasClient && isOpenChat && hasPollData;
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

            // Get poll data
            const poll = state?.poll || {
                question: state?.pollQuestion,
                options: state?.pollOptions,
            };

            if (!poll.question || !poll.options || poll.options.length < 2) {
                runtime.logger?.error("Invalid poll data");
                return false;
            }

            // Create the poll
            await client.createPoll(botClient, poll.question, poll.options);
            
            if (callback) {
                callback({
                    text: `Poll created: ${poll.question}`,
                    source: "openchat",
                    action: "CREATE_OPENCHAT_POLL",
                });
            }

            runtime.logger?.info("Poll created successfully", { question: poll.question });
            return true;
        } catch (error) {
            runtime.logger?.error("Error creating poll in OpenChat", error);
            return false;
        }
    },
    
    examples: [
        [
            {
                user: "user",
                content: { text: "Create a poll asking what we should do next" },
            },
            {
                user: "assistant",
                content: { 
                    text: "Creating poll", 
                    action: "CREATE_OPENCHAT_POLL",
                    poll: {
                        question: "What should we do next?",
                        options: ["Option A", "Option B", "Option C"]
                    }
                },
            },
        ],
    ],
};
