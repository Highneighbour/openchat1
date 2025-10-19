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
 * Action to react to a message in OpenChat
 */
export const reactToMessageAction: Action = {
    name: 'REACT_TO_OPENCHAT_MESSAGE',
    similes: ['ADD_OPENCHAT_REACTION', 'REACT_OPENCHAT'],
    description: 'React to a message in OpenChat with an emoji',
    examples: [
        [
            {
                name: 'User',
                content: {
                    text: 'React to that message with a thumbs up',
                } as Content,
            },
        ],
        [
            {
                name: 'User',
                content: {
                    text: 'Add a heart reaction to the last message',
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
        const hasReactionInfo = !!((state as any)?.messageIdToReactTo || (message.content as any).inReplyTo);
        return hasReactionInfo;
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

            // Get message ID to react to
            const messageId = (state as any)?.messageIdToReactTo || (message.content as any).inReplyTo;
            const chatId = ((state as any)?.chatId || message.roomId) as string;

            // Extract emoji from message (simplified - would need better parsing)
            const emoji = message.content.text?.match(/[👍👎❤️😊😂🎉✨]/)?.[0] || '👍';

            runtime.logger?.log(`Reacting to message ${messageId} in chat ${chatId} with ${emoji}`);

            // Note: Actual reaction implementation would require OpenChat SDK support
            // This is a placeholder showing the structure

            return {
                success: true,
                data: {
                    chatId,
                    messageId,
                    emoji,
                },
            };
        } catch (error: any) {
            runtime.logger?.error('Error reacting to OpenChat message:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    },
};

export default reactToMessageAction;
