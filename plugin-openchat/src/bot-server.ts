import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import {
    BotClientFactory,
    BotDefinition,
    Permissions,
    BadRequestError,
    accessTokenNotFound,
} from "@open-ic/openchat-botclient-ts";
import type { IAgentRuntime } from "@eliza/core";
import type { OpenChatClient } from "./client";
import type { WithBotClient, OpenChatConfig } from "./types/index";

/**
 * OpenChat Bot Server
 * Handles webhook requests from OpenChat and integrates with Eliza
 */
export class OpenChatBotServer {
    private app: express.Application;
    private factory: BotClientFactory;
    private runtime: IAgentRuntime;
    private openChatClient: OpenChatClient;
    private config: OpenChatConfig;

    constructor(runtime: IAgentRuntime, openChatClient: OpenChatClient, config: OpenChatConfig) {
        this.runtime = runtime;
        this.openChatClient = openChatClient;
        this.config = config;
        this.factory = openChatClient.getFactory();
        this.app = express();

        this.setupMiddleware();
        this.setupRoutes();
    }

    /**
     * Setup Express middleware
     */
    private setupMiddleware(): void {
        this.app.use(cors());
    }

    /**
     * Middleware to create BotClient from JWT token
     */
    private createBotClientMiddleware() {
        return (req: Request, res: Response, next: NextFunction): void => {
            try {
                const token = req.headers["x-oc-jwt"];
                if (!token) {
                    throw new BadRequestError(accessTokenNotFound());
                }

                (req as WithBotClient).botClient = this.factory.createClientFromCommandJwt(
                    token as string
                );

                this.runtime.logger?.debug("Bot client created for request");
                next();
            } catch (err: any) {
                this.runtime.logger?.error("Error creating bot client", err);
                if (err instanceof BadRequestError) {
                    res.status(400).send(err.message);
                } else {
                    res.status(500).send(err.message);
                }
            }
        };
    }

    /**
     * Setup Express routes
     */
    private setupRoutes(): void {
        // Bot definition endpoint
        this.app.get("/bot_definition", this.handleBotDefinition.bind(this));
        this.app.get("/", this.handleBotDefinition.bind(this));

        // Execute command endpoint
        this.app.post(
            "/execute_command",
            express.text(),
            this.createBotClientMiddleware(),
            this.handleExecuteCommand.bind(this)
        );

        // Health check
        this.app.get("/health", (req: Request, res: Response) => {
            res.status(200).json({ status: "healthy", timestamp: Date.now() });
        });
    }

    /**
     * Handle bot definition request
     */
    private handleBotDefinition(req: Request, res: Response): void {
        const emptyPermissions = {
            chat: [],
            community: [],
            message: [],
        };

        const definition: BotDefinition = {
            description: `${this.runtime.character?.name || "Eliza"} - An AI agent powered by ElizaOS, integrated with OpenChat`,
            autonomous_config: {
                permissions: Permissions.encodePermissions({
                    ...emptyPermissions,
                    message: ["Text", "Image", "File", "Poll"],
                    chat: [
                        "ReactToMessages",
                        "ReadMessages",
                        "ReadChatSummary",
                        "DeleteMessages",
                    ],
                }),
            },
            default_subscriptions: {
                community: [],
                chat: ["Message"],
            },
            commands: [
                {
                    name: "chat",
                    default_role: "Participant",
                    description: `Chat with ${this.runtime.character?.name || "the AI agent"}`,
                    permissions: Permissions.encodePermissions({
                        ...emptyPermissions,
                        message: ["Text"],
                        chat: ["ReadChatSummary", "ReadMessages"],
                    }),
                    direct_messages: true,
                    params: [
                        {
                            name: "message",
                            required: true,
                            description: "Your message to the agent",
                            placeholder: "Type your message here...",
                            param_type: {
                                StringParam: {
                                    min_length: 1,
                                    max_length: 2000,
                                    choices: [],
                                    multi_line: true,
                                },
                            },
                        },
                    ],
                },
                {
                    name: "info",
                    default_role: "Participant",
                    description: "Get information about this chat",
                    permissions: Permissions.encodePermissions({
                        ...emptyPermissions,
                        message: ["Text"],
                        chat: ["ReadChatSummary", "ReadMessages"],
                    }),
                    direct_messages: true,
                    params: [],
                },
            ],
        };

        res.status(200).json(definition);
    }

    /**
     * Handle execute command request
     */
    private async handleExecuteCommand(req: Request, res: Response): Promise<void> {
        if (!this.hasBotClient(req)) {
            res.status(500).send("Bot client not initialized");
            return;
        }

        const client = (req as WithBotClient).botClient;
        const commandName = client.commandName;

        this.runtime.logger?.info("Received command", { command: commandName });

        try {
            switch (commandName) {
                case "chat":
                    await this.handleChatCommand(req as WithBotClient, res);
                    break;
                case "info":
                    await this.handleInfoCommand(req as WithBotClient, res);
                    break;
                default:
                    res.status(400).send({ error: "Unknown command" });
            }
        } catch (error) {
            this.runtime.logger?.error("Error handling command", error);
            res.status(500).send({ error: "Internal server error" });
        }
    }

    /**
     * Handle chat command
     */
    private async handleChatCommand(req: WithBotClient, res: Response): Promise<void> {
        const client = req.botClient;
        
        // Send initial "thinking" message
        const placeholder = await client.createTextMessage("🤔 Thinking...");
        placeholder.setFinalised(false);
        res.status(200).json({ message: placeholder.toResponse() });

        // Get user message
        const userMessage = client.stringArg("message");
        if (!userMessage) {
            const errorMsg = await client.createTextMessage("Please provide a message!");
            await client.sendMessage(errorMsg);
            return;
        }

        try {
            // Extract context
            const context = this.openChatClient.extractContext(client);
            
            // Store the bot client for this room
            this.openChatClient.setActiveClient(context.chatId, client);

            // Convert to Eliza memory
            const memory = await this.openChatClient.contextToMemory(
                client,
                userMessage,
                context
            );

            // Process with Eliza runtime
            if (this.runtime.messageManager) {
                await this.runtime.messageManager.addEmbeddingToMemory(memory);
                await this.runtime.messageManager.createMemory(memory);
            }

            // Get response from Eliza
            const state = this.runtime.composeState ? await this.runtime.composeState(memory) : {};
            const response = this.runtime.generateText ? await this.runtime.generateText({
                context: state,
                modelClass: "medium",
                stop: ["\n"],
            }) : "I received your message!";

            // Send response back to OpenChat
            if (response) {
                const responseMessage = await client.createTextMessage(response);
                await client.sendMessage(responseMessage);
                
                this.runtime.logger?.info("Response sent", { 
                    chatId: context.chatId,
                    responseLength: response.length 
                });
            }

            // Clean up
            this.openChatClient.clearActiveClient(context.chatId);
        } catch (error) {
            this.runtime.logger?.error("Error processing chat command", error);
            const errorMsg = await client.createTextMessage(
                "Sorry, I encountered an error processing your message. Please try again."
            );
            await client.sendMessage(errorMsg);
        }
    }

    /**
     * Handle info command
     */
    private async handleInfoCommand(req: WithBotClient, res: Response): Promise<void> {
        const client = req.botClient;
        
        res.status(200).json({ message: "Processing..." });

        try {
            // Get chat summary
            const summary = await this.openChatClient.getChatSummary(client);
            const members = await this.openChatClient.getChatMembers(client);

            const infoLines = [
                "📊 Chat Information:",
                "",
                summary.name ? `Name: ${summary.name}` : "",
                summary.description ? `Description: ${summary.description}` : "",
                summary.member_count ? `Members: ${summary.member_count}` : "",
                members?.participants ? `Active Participants: ${members.participants.length}` : "",
            ].filter(Boolean);

            const infoMessage = await client.createTextMessage(infoLines.join("\n"));
            await client.sendMessage(infoMessage);
        } catch (error) {
            this.runtime.logger?.error("Error processing info command", error);
            const errorMsg = await client.createTextMessage(
                "Sorry, I couldn't retrieve the chat information."
            );
            await client.sendMessage(errorMsg);
        }
    }

    /**
     * Type guard to check if request has bot client
     */
    private hasBotClient(req: Request): req is WithBotClient {
        return (req as WithBotClient).botClient !== undefined;
    }

    /**
     * Start the server
     */
    public start(): void {
        const port = this.config.port || 3000;
        
        this.app.listen(port, () => {
            if (this.runtime.logger?.success) {
                this.runtime.logger.success(`OpenChat bot server running on port ${port}`);
            } else {
                console.log(`OpenChat bot server running on port ${port}`);
            }
            this.runtime.logger?.info(`Bot definition available at http://localhost:${port}/bot_definition`);
        });
    }

    /**
     * Get the Express app instance
     */
    public getApp(): express.Application {
        return this.app;
    }
}
