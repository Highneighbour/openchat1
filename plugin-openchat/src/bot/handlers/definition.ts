import { Permissions } from "@open-ic/openchat-botclient-ts";
import { Request, Response } from "express";
import { IAgentRuntime } from "@elizaos/core";

/**
 * Bot definition handler
 * Returns the bot's schema with commands and permissions
 * Based on YouTube bot's definition pattern
 */
export function getBotDefinition(runtime: IAgentRuntime) {
    const character = runtime.character;
    
    const emptyPermissions = {
        chat: [],
        community: [],
        message: [],
    };

    return {
        autonomous_config: {
            sync_api_key: true,
            permissions: Permissions.encodePermissions({
                message: ["Text"],  // Can send text messages autonomously
                community: [],
                chat: [],
            }),
        },
        description: character.bio?.[0] || `${character.name} - An AI agent powered by ElizaOS.

Use /chat to have a conversation, /help for commands, or /info to learn more.`,
        commands: [
            {
                name: "chat",
                default_role: "Participant",
                description: "Chat with the AI agent",
                permissions: Permissions.encodePermissions({
                    ...emptyPermissions,
                    message: ["Text"],
                }),
                params: [
                    {
                        name: "message",
                        required: true,
                        description: "Your message to the agent",
                        placeholder: "Type your message here...",
                        param_type: {
                            StringParam: {
                                min_length: 1,
                                max_length: 5000,
                                choices: [],
                                multi_line: true,
                            },
                        },
                    },
                ],
            },
            {
                name: "help",
                default_role: "Participant",
                description: "Show available commands and information",
                permissions: Permissions.encodePermissions({
                    ...emptyPermissions,
                    message: ["Text"],
                }),
                params: [],
            },
            {
                name: "info",
                default_role: "Participant",
                description: "Learn more about this agent",
                permissions: Permissions.encodePermissions({
                    ...emptyPermissions,
                    message: ["Text"],
                }),
                params: [],
            },
        ],
    };
}

/**
 * Express handler for /bot_definition endpoint
 */
export function handleDefinition(runtime: IAgentRuntime) {
    return (req: Request, res: Response) => {
        try {
            const definition = getBotDefinition(runtime);
            res.status(200).json(definition);
        } catch (error: any) {
            console.error("[OpenChat] Definition error:", error);
            res.status(500).json({
                error: "Failed to generate bot definition"
            });
        }
    };
}
