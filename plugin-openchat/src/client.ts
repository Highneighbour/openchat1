import type { IAgentRuntime } from "@elizaos/core";
import { BotClientFactory, BotClient, Permissions } from "@open-ic/openchat-botclient-ts";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { validateOpenChatConfig } from "./environment";
import { WithBotClient, OpenChatBotState } from "./types";

/**
 * OpenChat Client for Eliza OS
 * Handles integration between OpenChat bot and Eliza runtime
 */
export class OpenChatClient {
    private runtime: IAgentRuntime;
    private factory: BotClientFactory;
    private app: express.Application;
    private server: any;
    private state: OpenChatBotState;

    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;
        
        console.log("🤖 Initializing OpenChat client...");
        
        // Validate configuration
        const config = validateOpenChatConfig();
        
        // Initialize bot client factory
        this.factory = new BotClientFactory({
            openchatPublicKey: config.openchatPublicKey,
            icHost: config.icHost,
            identityPrivateKey: config.identityPrivateKey,
            openStorageCanisterId: config.openStorageCanisterId,
        });

        // Initialize Express app
        this.app = express();
        this.app.use(cors());
        
        // Setup routes
        this.setupRoutes();

        // Initialize state
        this.state = {
            factory: this.factory,
            activeClients: new Map(),
            app: this.app,
        };

        console.log("✅ OpenChat client initialized");
    }

    /**
     * Setup Express routes for OpenChat bot
     */
    private setupRoutes(): void {
        // Bot definition endpoint
        this.app.get("/bot_definition", this.getBotDefinition.bind(this));
        this.app.get("/", this.getBotDefinition.bind(this));

        // Execute command endpoint
        this.app.post(
            "/execute_command",
            express.text(),
            this.createBotClientMiddleware.bind(this),
            this.executeCommand.bind(this)
        );

        console.log("📡 OpenChat bot routes configured");
    }

    /**
     * Middleware to create bot client from JWT token
     */
    private createBotClientMiddleware(req: Request, res: Response, next: NextFunction): void {
        try {
            const token = req.headers["x-oc-jwt"];
            if (!token) {
                res.status(400).send("Access token not found");
                return;
            }

            const botClient = this.factory.createClientFromCommandJwt(token as string);
            (req as WithBotClient).botClient = botClient;
            
            console.log("🔑 Bot client created for request");
            next();
        } catch (err: any) {
            console.error("❌ Error creating bot client:", err);
            if (err.message?.includes("BadRequest")) {
                res.status(400).send(err.message);
            } else {
                res.status(500).send(err.message);
            }
        }
    }

    /**
     * Handle execute command requests
     */
    private async executeCommand(req: Request, res: Response): Promise<void> {
        const withClient = req as WithBotClient;
        if (!withClient.botClient) {
            res.status(500).send("Bot client not initialized");
            return;
        }

        const client = withClient.botClient;
        const commandName = client.commandName;

        console.log(`📨 Received command: ${commandName}`);

        try {
            switch (commandName) {
                case "chat":
                case "prompt":
                case "ask":
                    await this.handleChatCommand(client, res);
                    break;
                default:
                    res.status(400).json({ error: "Command not found" });
            }
        } catch (error: any) {
            console.error("❌ Error executing command:", error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Handle chat/prompt command - sends message to Eliza and returns response
     */
    private async handleChatCommand(client: BotClient, res: Response): Promise<void> {
        // Send thinking indicator
        const placeholder = await client.createTextMessage("🤔 Thinking...");
        placeholder.setFinalised(false);
        res.status(200).json({ message: placeholder.toResponse() });

        try {
            // Get user input
            const userMessage = client.stringArg("prompt") || client.stringArg("message") || client.stringArg("text");
            
            if (!userMessage) {
                await client.createTextMessage("❌ Please provide a message.");
                return;
            }

            console.log(`💬 Processing message: "${userMessage}"`);

            // For now, generate a simple response
            // In a full implementation, this would integrate with Eliza's runtime
            // to generate AI responses using the character configuration
            
            let response = "Hello! I received your message: " + userMessage;
            
            // Try to use runtime if available
            if (this.runtime && typeof (this.runtime as any).generateResponse === 'function') {
                try {
                    response = await (this.runtime as any).generateResponse({
                        text: userMessage,
                        source: "openchat"
                    });
                } catch (err) {
                    console.warn("Could not generate AI response, using fallback");
                }
            }

            console.log(`🤖 Generated response: "${response}"`);

            // Send response back to OpenChat
            await client.createTextMessage(response);

        } catch (error: any) {
            console.error("❌ Error handling chat:", error);
            await client.createTextMessage(`❌ Error: ${error.message}`);
        }
    }

    /**
     * Get bot definition for OpenChat
     */
    private getBotDefinition(_req: Request, res: Response): void {
        const agentName = (this.runtime as any).character?.name || "Eliza";
        const agentBio = (this.runtime as any).character?.bio?.[0] || "An AI agent powered by Eliza OS";

        const definition = {
            description: `${agentName} - ${agentBio}`,
            autonomous_config: {
                permissions: Permissions.encodePermissions({
                    chat: ["ReactToMessages", "ReadMessages", "ReadChatSummary", "DeleteMessages"],
                    community: [],
                    message: ["Text"],
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
                    description: `Chat with ${agentName}`,
                    permissions: Permissions.encodePermissions({
                        chat: ["ReadChatSummary"],
                        community: [],
                        message: ["Text"],
                    }),
                    direct_messages: true,
                    params: [
                        {
                            name: "prompt",
                            required: true,
                            description: "Your message",
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
                    name: "prompt",
                    default_role: "Participant",
                    description: `Send a prompt to ${agentName}`,
                    permissions: Permissions.encodePermissions({
                        chat: ["ReadChatSummary"],
                        community: [],
                        message: ["Text"],
                    }),
                    direct_messages: true,
                    params: [
                        {
                            name: "prompt",
                            required: true,
                            description: "Your prompt",
                            placeholder: "What would you like to know?",
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
            ],
        };

        res.status(200).json(definition);
    }

    /**
     * Start the OpenChat bot server
     */
    async start(): Promise<void> {
        const config = validateOpenChatConfig();
        const port = config.port || 3000;

        return new Promise((resolve) => {
            this.server = this.app.listen(port, () => {
                console.log(`🚀 OpenChat bot server running on port ${port}`);
                console.log(`📡 Bot definition available at: http://localhost:${port}/bot_definition`);
                console.log(`💬 Command endpoint at: http://localhost:${port}/execute_command`);
                resolve();
            });
        });
    }

    /**
     * Stop the OpenChat bot server
     */
    async stop(): Promise<void> {
        if (this.server) {
            return new Promise((resolve) => {
                this.server.close(() => {
                    console.log("🛑 OpenChat bot server stopped");
                    resolve();
                });
            });
        }
    }
}

export default OpenChatClient;
