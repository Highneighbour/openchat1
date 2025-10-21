import {
    Action,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@elizaos/core";
import { OpenChatClientService } from "../services/openchatClient.js";

/**
 * Extract the message content from user's request
 */
function extractMessageContent(text: string): string | null {
    const patterns = [
        /(?:saying|say)\s+["']?([^"'\n]+)["']?/i,
        /(?:message|post)[:\s]+["']?([^"'\n]+)["']?/i,
        /["']([^"']+)["']/,
        /:\s*(.+)$/,
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }
    
    return null;
}

export const sendMessageAction: Action = {
    name: "SEND_OPENCHAT_MESSAGE",
    description: "Send a message to OpenChat",
    similes: ["SEND_MESSAGE_TO_OPENCHAT", "POST_TO_OPENCHAT", "MESSAGE_OPENCHAT"],
    examples: [
        [
            { content: { text: "Send a message saying hello" } } as any,
            { content: { text: "Sending to OpenChat!", action: "SEND_OPENCHAT_MESSAGE" } } as any,
        ],
    ],

    validate: async (runtime: IAgentRuntime, message: Memory) => {
        try {
            let service = (runtime as any).getService?.("openchat") as OpenChatClientService;
            if (!service && (runtime as any).services) service = (runtime as any).services.get("openchat");
            if (!service) service = (globalThis as any).__openchatService;
            
            if (!service) return false;
            
            const text = (message.content.text || "").toLowerCase();
            return text.includes("send") || text.includes("post") || text.includes("say");
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
        runtime.logger?.info("🚀 [OpenChat] SEND_MESSAGE START");
        
        try {
            let service = (runtime as any).getService?.("openchat") as OpenChatClientService;
            if (!service && (runtime as any).services) service = (runtime as any).services.get("openchat");
            if (!service) service = (globalThis as any).__openchatService;

            if (!service) {
                runtime.logger?.error("❌ Service not found");
                return;
            }

            const userText = message.content.text || "";
            const messageToSend = extractMessageContent(userText) || "Hello from ElizaOS!";
            
            runtime.logger?.info(`📝 Message: "${messageToSend}"`);

            const installations = Array.from(service.getInstallations().values());
            if (installations.length === 0) {
                runtime.logger?.error("❌ No installations");
                return;
            }

            const installation = installations[0];
            const icHost = runtime.getSetting("OPENCHAT_IC_HOST") || "";
            const client = service.createClientForScope(installation.scope, icHost, installation.permissions);

            const msg = (await client.createTextMessage(messageToSend)).setFinalised(true);
            await client.sendMessage(msg);

            runtime.logger?.info("✅ Message sent!");

            if (callback) {
                callback({ text: `Sent: "${messageToSend}"`, content: { success: true } });
            }
        } catch (error: any) {
            runtime.logger?.error("❌ Error:", error.message);
            if (callback) {
                callback({ text: `Failed: ${error.message}`, content: { error: error.message } });
            }
        }
    },
};

export default sendMessageAction;
