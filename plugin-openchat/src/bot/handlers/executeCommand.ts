import { commandNotFound, argumentsInvalid } from "@open-ic/openchat-botclient-ts";
import { Request, Response } from "express";
import { WithBotClient } from "../../types/index.js";
import { IAgentRuntime } from "@elizaos/core";

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
    
    // Send immediate placeholder to frontend only (don't send to backend)
    const placeholder = (await client.createTextMessage("Thinking...")).setFinalised(false);
    res.status(200).json(success(placeholder));

    // Get message argument
    const message = client.stringArg("message");
    if (message === undefined) {
        runtime.logger?.debug("[OpenChat] No message argument provided");
        const msg = (await client.createTextMessage("Please provide a message.")).setFinalised(true);
        await client.sendMessage(msg);
        return;
    }
    
    runtime.logger?.debug("[OpenChat] Processing message:", message);

    try {
        // Generate response using ElizaOS
        const character = runtime.character;
        
        // Build prompt for the AI
        const prompt = `You are ${character.name}. ${character.bio?.[0] || ""}

${character.style?.all?.join(", ") || "Be helpful and friendly."}

User: ${message}

${character.name}:`;

        let responseText: string;
        
        try {
            // Try different runtime methods to generate response
            if (typeof (runtime as any).generateText === 'function') {
                responseText = await (runtime as any).generateText({
                    prompt,
                    stop: ["\nUser:", `\n${character.name}:`],
                    maxTokens: 200,
                });
            } else if (typeof (runtime as any).completion === 'function') {
                responseText = await (runtime as any).completion({
                    prompt,
                    stop: ["\nUser:", `\n${character.name}:`],
                });
            } else if (typeof (runtime as any).generateResponse === 'function') {
                const response = await (runtime as any).generateResponse({
                    text: message,
                    context: prompt,
                });
                responseText = response?.text || response;
            } else {
                // Last resort: use character postExamples or bio
                const examples = character.postExamples || [];
                responseText = examples.length > 0 
                    ? examples[Math.floor(Math.random() * examples.length)]
                    : `${character.bio?.[0] || "Hello! How can I help you?"}`;
            }
        } catch (genError: any) {
            runtime.logger?.error("[OpenChat] Error generating response:", genError?.message || genError);
            
            // Fallback response
            responseText = character.postExamples?.[ 0] 
                || character.bio?.[0] 
                || "I'm here to help! What would you like to know?";
        }

        responseText = responseText.trim();
        
        // Clean up response (remove any role prefixes)
        responseText = responseText
            .replace(new RegExp(`^${character.name}:\\s*`, 'i'), '')
            .replace(/^Assistant:\s*/i, '')
            .replace(/^AI:\s*/i, '')
            .trim();
        
        runtime.logger?.debug("[OpenChat] Generated response:", responseText.substring(0, 100));

        // Send final response to OpenChat
        const responseMsg = (await client.createTextMessage(responseText)).setFinalised(true);
        await client.sendMessage(responseMsg);
        runtime.logger?.debug("[OpenChat] ✅ Response sent successfully");
        
    } catch (error: any) {
        runtime.logger?.error("[OpenChat] Error in chat handler:", error?.message || error);
        try {
            const errorMsg = (await client.createTextMessage(
                "I encountered an error processing your message. Please try again."
            )).setFinalised(true);
            await client.sendMessage(errorMsg);
        } catch (sendError: any) {
            runtime.logger?.error("[OpenChat] Failed to send error message:", sendError);
        }
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

    const message = (await client.createTextMessage(helpText)).setFinalised(true);
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

    const message = (await client.createTextMessage(infoText)).setFinalised(true);
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

    runtime.logger?.debug(`[OpenChat] Executing command: ${commandName}`);

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
