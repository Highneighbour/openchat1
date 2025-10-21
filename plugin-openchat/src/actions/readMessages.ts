import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { OpenChatClientService } from "../services/openchatClient.js";

function extractChatId(text: string): string | null {
    const canisterPattern = /([a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{3})/i;
    const match = text.match(canisterPattern);
    if (match) return match[1];
    
    const namePattern = /(?:in|from)\s+([a-zA-Z0-9_-]+)/i;
    const nameMatch = text.match(namePattern);
    if (nameMatch && nameMatch[1]) return nameMatch[1];
    
    return null;
}

export const readMessagesAction: Action = {
    name: "READ_OPENCHAT_MESSAGES",
    description: "Read recent messages from OpenChat",
    similes: ["GET_OPENCHAT_MESSAGES", "FETCH_MESSAGES", "READ_HISTORY"],
    examples: [
        [
            { content: { text: "What are the recent messages?" } } as any,
            { content: { text: "Reading messages...", action: "READ_OPENCHAT_MESSAGES" } } as any,
        ],
    ],

    validate: async (runtime: IAgentRuntime, message: Memory) => {
        try {
            let service = (runtime as any).getService?.("openchat") as OpenChatClientService;
            if (!service && (runtime as any).services) service = (runtime as any).services.get("openchat");
            if (!service) service = (globalThis as any).__openchatService;
            
            if (!service) return false;
            
            const text = (message.content.text || "").toLowerCase();
            const hasIntent = text.includes("read") || text.includes("show") || text.includes("recent") || text.includes("messages");
            
            for (const installation of service.getInstallations().values()) {
                if (installation.permissions.includes("ReadMessages")) return hasIntent;
            }
            
            return false;
        } catch {
            return false;
        }
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        options?: any,
        callback?: HandlerCallback
    ) => {
        runtime.logger?.info("🚀 [OpenChat] READ_MESSAGES START");
        
        try {
            let service = (runtime as any).getService?.("openchat") as OpenChatClientService;
            if (!service && (runtime as any).services) service = (runtime as any).services.get("openchat");
            if (!service) service = (globalThis as any).__openchatService;

            if (!service) {
                runtime.logger?.error("❌ Service not found");
                return;
            }

            const userText = message.content.text || "";
            const specifiedChatId = extractChatId(userText);
            
            if (specifiedChatId) {
                runtime.logger?.info(`📍 ChatId: ${specifiedChatId}`);
            }

            let targetInstallation;
            for (const installation of service.getInstallations().values()) {
                if (installation.permissions.includes("ReadMessages")) {
                    if (specifiedChatId && installation.scope.chatId.toString().includes(specifiedChatId)) {
                        targetInstallation = installation;
                        break;
                    } else if (!specifiedChatId) {
                        targetInstallation = installation;
                        break;
                    }
                }
            }

            if (!targetInstallation) {
                runtime.logger?.error("❌ No ReadMessages permission");
                if (callback) {
                    callback({ text: "No permission to read messages", content: { error: "No permission" } });
                }
                return;
            }

            const icHost = runtime.getSetting("OPENCHAT_IC_HOST") || "";
            const client = service.createClientForScope(targetInstallation.scope, icHost, targetInstallation.permissions);

            const messages = await (client as any).getMessages?.(options?.limit || 10);

            runtime.logger?.info(`✅ Read ${messages?.length || 0} messages`);

            if (callback) {
                callback({ 
                    text: `Found ${messages?.length || 0} messages`,
                    content: { success: true, messages, count: messages?.length || 0 }
                });
            }
        } catch (error: any) {
            runtime.logger?.error("❌ Error:", error.message);
            if (callback) {
                callback({ text: `Failed: ${error.message}`, content: { error: error.message } });
            }
        }
    },
};

export default readMessagesAction;
