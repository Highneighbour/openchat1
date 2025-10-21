import { commandNotFound } from "@open-ic/openchat-botclient-ts";
import { Request, Response } from "express";
import { IAgentRuntime } from "@elizaos/core";
import { getBotClient } from "../middleware/jwt.js";
import { handleChat, handleHelp, handleInfo } from "./commands.js";

/**
 * Main command execution handler
 * Based on YouTube bot's command handler pattern
 */
export async function executeCommand(
    req: Request,
    res: Response,
    runtime: IAgentRuntime
): Promise<void> {
    const client = getBotClient(req);
    
    if (!client) {
        res.status(400).json({ error: "Bot client not initialized" });
        return;
    }

    const commandName = client.commandName;
    console.log(`[OpenChat] Executing command: ${commandName}`);

    try {
        let result;
        
        switch (commandName) {
            case "chat":
                result = await handleChat(client, runtime);
                break;
            
            case "help":
                result = await handleHelp(client, runtime);
                break;
            
            case "info":
                result = await handleInfo(client, runtime);
                break;
            
            default:
                result = {
                    statusCode: 400,
                    body: commandNotFound(),
                };
        }

        res.status(result.statusCode).json(JSON.parse(result.body));
    } catch (error: any) {
        console.error(`[OpenChat] Command execution error:`, error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message
        });
    }
}
