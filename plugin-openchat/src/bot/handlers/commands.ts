import { BotClient, Message } from "@open-ic/openchat-botclient-ts";
import { IAgentRuntime } from "@elizaos/core";

/**
 * Helper to create success response
 */
export function success(msg: Message) {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: msg.toResponse(),
        }),
    };
}

/**
 * Helper to create ephemeral response (only visible to command user)
 */
export async function ephemeralResponse(client: BotClient, text: string) {
    const msg = (await client.createTextMessage(text)).makeEphemeral();
    return success(msg);
}

/**
 * /chat command - Chat with the AI agent
 */
export async function handleChat(client: BotClient, runtime: IAgentRuntime) {
    const messageText = client.stringArg("message");
    
    if (!messageText) {
        return ephemeralResponse(client, "Please provide a message to chat with me.");
    }

    try {
        // Build simple prompt for AI
        const character = runtime.character;
        const prompt = `You are ${character.name}. ${character.bio?.[0] || ""}

User: ${messageText}

${character.name}:`;

        // Generate response using runtime's text generation
        let responseText: string;
        
        if (typeof (runtime as any).generateText === 'function') {
            responseText = await (runtime as any).generateText(prompt);
        } else if (typeof (runtime as any).completion === 'function') {
            const response = await (runtime as any).completion({ prompt, stop: ["\n"] });
            responseText = response.text || response.content || String(response);
        } else {
            responseText = character.postExamples?.[0] || character.bio?.[0] || "Hello! How can I help you?";
        }

        // Clean and trim response
        responseText = String(responseText).trim();
        
        // Send response
        const msg = await client.createTextMessage(responseText);
        await client.sendMessage(msg);
        
        return success(msg);
    } catch (error: any) {
        runtime.logger?.error("[OpenChat] Chat error:", error.message);
        return ephemeralResponse(client, "Sorry, I encountered an error processing your message.");
    }
}

/**
 * /help command - Show help information
 */
export async function handleHelp(client: BotClient, runtime: IAgentRuntime) {
    const character = runtime.character;
    
    const helpText = `**${character.name}** - AI Agent powered by ElizaOS

**Available Commands:**
• \`/chat <message>\` - Chat with me
• \`/help\` - Show this help message  
• \`/info\` - Learn more about me

**About:**
${character.bio?.[0] || "I'm an AI agent here to help!"}

**Topics I can discuss:**
${character.topics?.slice(0, 5).join(", ") || "various topics"}`;

    const msg = await client.createTextMessage(helpText);
    await client.sendMessage(msg);
    
    return success(msg);
}

/**
 * /info command - Show agent information
 */
export async function handleInfo(client: BotClient, runtime: IAgentRuntime) {
    const character = runtime.character;
    
    const infoText = `**About ${character.name}**

${character.bio?.[0] || "I'm an AI agent powered by ElizaOS"}

**Communication Style:**
${character.style?.chat?.[0] || character.style?.all?.[0] || "Friendly and helpful"}

**What I can do:**
• Engage in natural conversations
• Remember context from our chat
• Help with various tasks
• Provide information and insights

Powered by ElizaOS 🚀`;

    const msg = await client.createTextMessage(infoText);
    await client.sendMessage(msg);
    
    return success(msg);
}
