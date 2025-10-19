import type {
    Provider,
    IAgentRuntime,
    Memory,
    State,
    ProviderResult,
} from '@elizaos/core';

/**
 * Provider that supplies OpenChat chat context information
 */
export const chatContextProvider: Provider = {
    name: 'OPENCHAT_CHAT_CONTEXT',
    description: 'Provides context about the current OpenChat chat/room',
    
    get: async (runtime: IAgentRuntime, message: Memory, state: State): Promise<ProviderResult> => {
        try {
            const chatId = (state as any).chatId || message.roomId;
            const chatName = (state as any).chatName || 'Unknown Chat';
            const chatType = (state as any).chatType || 'group';

            const contextText = `Current OpenChat Chat: ${chatName} (${chatType})
Chat ID: ${chatId}
Platform: OpenChat (oc.app)`;

            return {
                text: contextText,
                values: {
                    chatId,
                    chatName,
                    chatType,
                    platform: 'openchat',
                },
                data: {
                    chatId,
                    chatName,
                    chatType,
                },
            };
        } catch (error: any) {
            runtime.logger?.error('Error getting OpenChat chat context:', error);
            return {
                text: 'OpenChat context unavailable',
                values: {},
                data: {},
            };
        }
    },
};

export default chatContextProvider;
