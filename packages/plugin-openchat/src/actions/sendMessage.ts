import type {
    Action,
    IAgentRuntime,
    Memory,
    State,
    HandlerCallback,
    Content,
    ActionExample,
} from '@elizaos/core';
import { OpenChatService } from '../services/openchat.service.js';

/**
 * Action to send a message to OpenChat
 */
export const sendMessageAction: Action = {
    name: 'SEND_OPENCHAT_MESSAGE',
    similes: ['SEND_MESSAGE_OPENCHAT', 'POST_TO_OPENCHAT', 'MESSAGE_OPENCHAT'],
    description: 'Send a message to an OpenChat room/channel',
    examples: [
        [
            {
                name: 'User',
                content: {
                    text: 'Send a message to the general chat saying hello',
                } as Content,
            },
        ],
        [
            {
                name: 'User',
                content: {
                    text: 'Post an update to OpenChat about the latest news',
                } as Content,
            },
        ],
    ] as ActionExample[][],

    validate: async (runtime: IAgentRuntime, message: Memory, state?: State): Promise<boolean> => {
        // Check if OpenChat service is available
        const service = runtime.getService('OPENCHAT') as unknown as OpenChatService;
        if (!service) {
            return false;
        }

        // Validate that we have necessary information
        const chatId = (state as any)?.chatId || message.roomId;
        return !!chatId;
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        options?: any,
        callback?: HandlerCallback
    ): Promise<any> => {
        try {
            const service = runtime.getService('OPENCHAT') as unknown as OpenChatService;
            if (!service) {
                throw new Error('OpenChat service not available');
            }

            // Get chat ID from state or message
            const chatId = ((state as any)?.chatId || message.roomId) as string;
            
            // Get message content to send
            const content: Content = {
                text: message.content.text,
                source: 'openchat',
            };

            // Send message via OpenChat service
            await service.sendMessage(chatId, content);

            runtime.logger?.log(`Message sent to OpenChat chat ${chatId}`);

            return {
                success: true,
                data: {
                    chatId,
                    message: content.text,
                },
            };
        } catch (error: any) {
            runtime.logger?.error('Error sending OpenChat message:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    },
};

export default sendMessageAction;
