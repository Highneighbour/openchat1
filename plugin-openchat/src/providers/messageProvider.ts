import type { Provider } from "@elizaos/core";

/**
 * Provider that gives context about OpenChat messages and environment
 */
export const openChatMessageProvider: Provider = {
    name: "openchatContext",
    get: async (runtime: any, message: any, state?: any): Promise<any> => {
        try {
            const context = message.content || {};
            
            // Build context string about OpenChat environment
            let contextInfo = "OpenChat Environment:\n";
            
            if (context.source === "openchat") {
                contextInfo += "- Source: OpenChat (oc.app)\n";
                
                if (context.botClient) {
                    contextInfo += "- Bot client active\n";
                }
                
                if (context.chatId) {
                    contextInfo += `- Chat ID: ${context.chatId}\n`;
                }
                
                if (context.userId) {
                    contextInfo += `- User ID: ${context.userId}\n`;
                }
            }
            
            return contextInfo;
        } catch (error) {
            console.error("Error in OpenChat message provider:", error);
            return "";
        }
    },
};

export default openChatMessageProvider;
