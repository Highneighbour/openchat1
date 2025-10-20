import { commandNotFound, argumentsInvalid } from "@open-ic/openchat-botclient-ts";
import { Request, Response } from "express";
import { WithBotClient } from "../../types/index.js";
import { IAgentRuntime, Content, UUID } from "@elizaos/core";
import { v4 as uuidv4 } from "uuid";

/**
 * Type guard to check if request has BotClient
 */
function hasBotClient(req: Request): req is WithBotClient {
    return (req as WithBotClient).botClient !== undefined;
}

/**
 * Helper to create success response
 */
function success(msg?: any) {
    return {
        message: msg?.toResponse(),
    };
}

/**
 * Handle chat command - main interaction with ElizaOS agent
 */
async function handleChatCommand(
    req: WithBotClient,
    res: Response,
    runtime: IAgentRuntime
): Promise<void> {
    const client = req.botClient;
    
    // Send immediate placeholder
    const placeholder = await client.createTextMessage("Thinking...");
    placeholder.setFinalised(false);
    res.status(200).json(success(placeholder));

    // Get message argument
    const message = client.stringArg("message");
    if (message === undefined) {
        const msg = await client.createTextMessage("Please provide a message.");
        await client.sendMessage(msg);
        return;
    }

    try {
        // Get or create room ID from scope
        const scope = (client as any).scope;
        const chatId = (scope as any).chatId || scope.chat_id || "unknown";
        const roomId = `openchat-${scope.kind}-${chatId}` as UUID;

        // Get user ID (sender)
        const userId = ((client as any).userId || (client as any).user_id || "unknown") as UUID;

        // Generate a simple response using character info
        const character = runtime.character;
        let responseText = `Hello! I'm ${character.name}. `;
        
        // Simple response logic
        if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
            responseText += "How can I help you today?";
        } else if (message.toLowerCase().includes("help")) {
            responseText += "I'm here to assist you! You can ask me questions or just chat.";
        } else {
            responseText += `You said: "${message}". I'm here to help! What would you like to know?`;
        }

        // Send response
        const responseMsg = await client.createTextMessage(responseText);
        await client.sendMessage(responseMsg);
    } catch (error: any) {
        runtime.logger?.error("Error handling chat command:", error?.message || error);
        const errorMsg = await client.createTextMessage(
            "I encountered an error processing your message. Please try again."
        );
        await client.sendMessage(errorMsg);
    }
}

/**
 * Handle help command
 */
async function handleHelpCommand(
    req: WithBotClient,
    res: Response,
    runtime: IAgentRuntime
): Promise<void> {
    const client = req.botClient;
    const character = runtime.character;

    const helpText = `🤖 **${character.name}** - AI Agent

**Available Commands:**
• \`/chat <message>\` - Chat with me
• \`/help\` - Show this help message
• \`/info\` - Get information about me

**About Me:**
${character.bio?.[0] || "I'm an AI agent powered by ElizaOS"}

**How to Use:**
Simply use the /chat command followed by your message, or send me a direct message!`;

    const message = await client.createTextMessage(helpText);
    res.status(200).json(success(message));
    await client.sendMessage(message);
}

/**
 * Handle info command
 */
async function handleInfoCommand(
    req: WithBotClient,
    res: Response,
    runtime: IAgentRuntime
): Promise<void> {
    const client = req.botClient;
    const character = runtime.character;

    const topics = character.topics?.slice(0, 5).join(", ") || "various topics";
    const style = character.style?.all?.[0] || character.style?.chat?.[0] || "friendly and helpful";

    const infoText = `📋 **About ${character.name}**

${character.bio?.[0] || "I'm an AI agent powered by ElizaOS"}

**Topics I can discuss:** ${topics}

**Communication style:** ${style}

**Capabilities:**
• Intelligent conversation
• Context-aware responses
• Memory of past interactions
• Task execution

Powered by ElizaOS 🚀`;

    const message = await client.createTextMessage(infoText);
    res.status(200).json(success(message));
    await client.sendMessage(message);
}

/**
 * Main command execution handler
 */
export async function executeCommand(
    req: Request,
    res: Response,
    runtime: IAgentRuntime
): Promise<void> {
    if (!hasBotClient(req)) {
        res.status(500).send("Bot client not initialised");
        return;
    }

    const client = req.botClient;
    const commandName = client.commandName;

    runtime.logger.debug(`[OpenChat] Executing command: ${commandName}`);

    try {
        switch (commandName) {
            case "chat":
                await handleChatCommand(req, res, runtime);
                break;

            case "help":
                await handleHelpCommand(req, res, runtime);
                break;

            case "info":
                await handleInfoCommand(req, res, runtime);
                break;

            default:
                res.status(400).send(commandNotFound());
        }
    } catch (error: any) {
        runtime.logger?.error(`[OpenChat] Error executing command ${commandName}:`, error?.message || error);
        res.status(500).send("Internal server error");
    }
}

export default executeCommand;
