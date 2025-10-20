import { commandNotFound } from "@open-ic/openchat-botclient-ts";
import { Request, Response } from "express";
import { WithBotClient } from "../../types/index.js";
import { IAgentRuntime, Content, UUID, Memory } from "@elizaos/core";
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
 * Handle chat command - properly integrated with ElizaOS message system
 */
async function handleChatCommand(
    req: WithBotClient,
    res: Response,
    runtime: IAgentRuntime
): Promise<void> {
    const client = req.botClient;
    
    // Send immediate placeholder to frontend only
    const placeholder = (await client.createTextMessage("Thinking...")).setFinalised(false);
    res.status(200).json(success(placeholder));

    // Get message argument
    const message = client.stringArg("message");
    if (message === undefined) {
        const msg = (await client.createTextMessage("Please provide a message.")).setFinalised(true);
        await client.sendMessage(msg);
        return;
    }
    
    try {
        // Get scope and user info
        const scope = (client as any).scope;
        const chatId = (scope as any).chatId || scope.chat_id || "unknown";
        const roomId = `openchat-${scope.kind}-${chatId}` as UUID;
        const userId = ((client as any).initiator || (client as any).userId || "user") as UUID;

        runtime.logger?.debug("[OpenChat] Message from", userId, "in room", roomId);

        // Create proper content object for ElizaOS
        const content: Content = {
            text: message,
            source: "openchat",
        };

        // Create memory-like object for ElizaOS runtime
        const memory: any = {
            id: uuidv4() as UUID,
            userId,
            agentId: runtime.agentId,
            roomId,
            content,
            createdAt: Date.now(),
        };

        // Let ElizaOS handle the message through its proper pipeline
        let responseText: string;

        // Try to use the proper message handling system
        if (typeof (runtime as any).handleMessage === 'function') {
            runtime.logger?.debug("[OpenChat] Using handleMessage");
            const response = await (runtime as any).handleMessage(memory);
            responseText = response?.text || response?.content?.text || String(response);
        } else if (typeof (runtime as any).processMessage === 'function') {
            runtime.logger?.debug("[OpenChat] Using processMessage");
            const response = await (runtime as any).processMessage(memory);
            responseText = response?.text || response?.content?.text || String(response);
        } else if (typeof (runtime as any).generateMessageResponse === 'function') {
            runtime.logger?.debug("[OpenChat] Using generateMessageResponse");
            const response = await (runtime as any).generateMessageResponse(memory);
            responseText = response?.text || response?.content?.text || String(response);
        } else if (typeof (runtime as any).composeState === 'function') {
            // Try the compose state -> generate text pattern
            runtime.logger?.debug("[OpenChat] Using composeState + generate");
            const state = await (runtime as any).composeState(memory);
            const response = await (runtime as any).generateText({
                context: state,
            });
            responseText = response;
        } else {
            // Fallback: use character's bio or postExamples
            runtime.logger?.warn("[OpenChat] No message handler found, using fallback");
            const character = runtime.character;
            responseText = character.postExamples?.[0] 
                || character.bio?.[0] 
                || "Hello! How can I help you?";
        }

        // Ensure we have a string
        if (typeof responseText !== 'string') {
            runtime.logger?.warn("[OpenChat] Response not a string:", typeof responseText);
            // Try to extract text from object
            if (responseText && typeof responseText === 'object') {
                responseText = (responseText as any).text 
                    || (responseText as any).content?.text 
                    || JSON.stringify(responseText);
            } else {
                responseText = String(responseText || "I'm here to help!");
            }
        }

        responseText = responseText.trim();
        
        runtime.logger?.debug("[OpenChat] Final response:", responseText.substring(0, 100));

        // Send response to OpenChat
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
