import type {
    Provider,
    IAgentRuntime,
    Memory,
    State,
    ProviderResult,
} from '@elizaos/core';

/**
 * Provider that supplies recent OpenChat message history
 */
export const messageHistoryProvider: Provider = {
    name: 'OPENCHAT_MESSAGE_HISTORY',
    description: 'Provides recent message history from OpenChat chat',
    
    get: async (runtime: IAgentRuntime, message: Memory, state: State): Promise<ProviderResult> => {
        try {
            const roomId = message.roomId;
            
            // Get recent messages from the room
            const recentMessages = await runtime.getMemories({
                roomId,
                count: 10,
                unique: true,
                tableName: 'messages',
            });

            if (!recentMessages || recentMessages.length === 0) {
                return {
                    text: 'No recent message history available.',
                    values: { messageCount: 0 },
                    data: { messages: [] },
                };
            }

            // Format messages for context
            const formattedMessages = recentMessages
                .map((msg) => {
                    const userName = (state as any).entities?.[(msg as any).userId]?.name || 'Unknown User';
                    return `${userName}: ${msg.content.text}`;
                })
                .join('\n');

            const contextText = `Recent Messages:\n${formattedMessages}`;

            return {
                text: contextText,
                values: {
                    messageCount: recentMessages.length,
                },
                data: {
                    messages: recentMessages,
                },
            };
        } catch (error: any) {
            runtime.logger?.error('Error getting OpenChat message history:', error);
            return {
                text: 'Message history unavailable',
                values: { messageCount: 0 },
                data: { messages: [] },
            };
        }
    },
};

export default messageHistoryProvider;
