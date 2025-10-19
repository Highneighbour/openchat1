import type { IAgentRuntime, Memory, Content, UUID } from '@elizaos/core';
import { Service } from '@elizaos/core';
import { BotClientFactory, BotClient } from '@open-ic/openchat-botclient-ts';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import type { OpenChatConfig } from '../types/index.js';

/**
 * OpenChat Service - Manages OpenChat bot integration with ElizaOS
 */
export class OpenChatService extends Service {
    static serviceType = 'OPENCHAT' as const;
    
    capabilityDescription = 'OpenChat bot integration - enables sending and receiving messages on OpenChat (oc.app)';
    
    private factory!: BotClientFactory;
    private app!: Express;
    private server: any;
    private installations: Map<string, { chatId: string; permissions: string[] }>;

    constructor(runtime?: IAgentRuntime) {
        super(runtime);
        this.installations = new Map();
    }

    /**
     * Initialize the OpenChat service
     */
    async initialize(runtime: IAgentRuntime): Promise<void> {
        this.runtime = runtime;
        
        const config = this.getConfig(runtime);
        
        // Initialize BotClientFactory
        this.factory = new BotClientFactory({
            openchatPublicKey: config.openchatPublicKey,
            icHost: config.icHost,
            identityPrivateKey: config.identityPrivateKey,
            openStorageCanisterId: config.openStorageCanisterId,
        });

        // Setup Express server
        this.app = express();
        this.app.use(cors());
        
        // Register routes
        this.setupRoutes();

        // Start server
        const port = config.botPort || 3000;
        this.server = this.app.listen(port, () => {
            runtime.logger?.log(`OpenChat bot server running on port ${port}`);
        });
    }

    /**
     * Get configuration from runtime
     */
    private getConfig(runtime: IAgentRuntime): OpenChatConfig {
        return {
            openchatPublicKey: runtime.getSetting('OPENCHAT_PUBLIC_KEY') as string,
            icHost: runtime.getSetting('OPENCHAT_IC_HOST') as string,
            identityPrivateKey: runtime.getSetting('OPENCHAT_IDENTITY_PRIVATE_KEY') as string,
            openStorageCanisterId: runtime.getSetting('OPENCHAT_STORAGE_INDEX_CANISTER') as string,
            botPort: runtime.getSetting('OPENCHAT_BOT_PORT') ? parseInt(runtime.getSetting('OPENCHAT_BOT_PORT') as string) : undefined,
        };
    }

    /**
     * Setup Express routes for OpenChat bot endpoints
     */
    private setupRoutes(): void {
        // Bot definition endpoint
        this.app.get('/bot_definition', (req: Request, res: Response) => {
            res.status(200).json(this.getBotDefinition());
        });

        this.app.get('/', (req: Request, res: Response) => {
            res.status(200).json(this.getBotDefinition());
        });

        // Execute command endpoint
        this.app.post(
            '/execute_command',
            express.text(),
            this.createBotClientMiddleware(),
            this.handleExecuteCommand.bind(this)
        );

        // Notify endpoint for autonomous events
        this.app.post(
            '/notify',
            express.raw({ type: 'application/msgpack' }),
            this.handleNotify.bind(this)
        );
    }

    /**
     * Middleware to create BotClient from JWT token
     */
    private createBotClientMiddleware() {
        return (req: Request, res: Response, next: NextFunction): void => {
            try {
                const token = req.headers['x-oc-jwt'];
                if (!token) {
                    res.status(400).send('Access token not found');
                    return;
                }
                
                (req as any).botClient = this.factory.createClientFromCommandJwt(token as string);
                next();
            } catch (err: any) {
                this.runtime.logger?.error('Error creating bot client:', err);
                res.status(err instanceof Error ? 400 : 500).send(err.message);
            }
        };
    }

    /**
     * Handle execute_command requests
     */
    private async handleExecuteCommand(req: Request, res: Response): Promise<void> {
        const botClient = (req as any).botClient as BotClient;
        
        if (!botClient) {
            res.status(500).send('Bot client not initialized');
            return;
        }

        try {
            const commandName = botClient.commandName;
            this.runtime.logger?.log(`Executing command: ${commandName}`);

            // Send initial placeholder
            const placeholder = (await botClient.createTextMessage('Thinking...')).setFinalised(false);
            res.status(200).json({ message: placeholder.toResponse() });

            // Get command arguments
            const args: Record<string, any> = {};
            
            // Extract common argument types
            const promptArg = botClient.stringArg('prompt') || botClient.stringArg('message') || botClient.stringArg('text');
            if (promptArg) args.prompt = promptArg;

            // Create memory from the command
            const memory: Memory = {
                id: crypto.randomUUID() as UUID,
                agentId: this.runtime.agentId,
                roomId: (botClient.chatId?.toString() || crypto.randomUUID()) as UUID,
                content: {
                    text: args.prompt || commandName,
                    source: 'openchat',
                    inReplyTo: (botClient as any).messageId?.toString(),
                },
                createdAt: Date.now(),
            } as Memory;

            // Compose state
            const state = await this.runtime.composeState(memory);

            // Generate response using ElizaOS runtime
            const responseText = await this.runtime.generateText(
                args.prompt || commandName,
                {
                    maxTokens: 1000,
                } as any
            );

            // Send final response to OpenChat
            await botClient.sendMessage(
                await botClient.createTextMessage(
                    responseText.text || 'I apologize, but I couldn\'t generate a response.'
                )
            );

            // Emit event
            await this.runtime.emitEvent('OPENCHAT_COMMAND_EXECUTED', {
                botClient,
                commandName,
                args,
            });

        } catch (error: any) {
            this.runtime.logger?.error('Error executing command:', error);
            
            try {
                await botClient.sendMessage(
                    await botClient.createTextMessage(`Error: ${error.message}`)
                );
            } catch (sendError: any) {
                this.runtime.logger?.error('Error sending error message:', sendError);
            }
            
            if (!res.headersSent) {
                res.status(500).send('Internal server error');
            }
        }
    }

    /**
     * Handle notify events (autonomous mode)
     */
    private async handleNotify(req: Request, res: Response): Promise<void> {
        try {
            // Parse msgpack payload
            // This would need proper msgpack parsing
            this.runtime.logger?.log('Received notify event');
            
            // For now, just acknowledge
            res.status(200).send('OK');
            
            // TODO: Implement full notify handling for bot installation/uninstallation events
        } catch (error: any) {
            this.runtime.logger?.error('Error handling notify:', error);
            res.status(500).send('Internal server error');
        }
    }

    /**
     * Get bot definition schema
     */
    private getBotDefinition(): any {
        const emptyPermissions = {
            chat: [],
            community: [],
            message: [],
        };

        return {
            description: this.runtime.character?.bio || 'An AI agent powered by ElizaOS',
            autonomous_config: {
                permissions: this.encodePermissions({
                    ...emptyPermissions,
                    message: ['Text', 'Image'],
                    chat: [
                        'ReactToMessages',
                        'ReadMessages',
                        'ReadChatSummary',
                        'SendMessages',
                    ],
                }),
            },
            default_subscriptions: {
                community: [],
                chat: ['Message'],
            },
            commands: [
                {
                    name: 'chat',
                    default_role: 'Participant',
                    description: `Chat with ${this.runtime.character?.name || 'the AI agent'}`,
                    permissions: this.encodePermissions({
                        ...emptyPermissions,
                        message: ['Text'],
                        chat: ['ReadChatSummary', 'ReadMessages'],
                    }),
                    direct_messages: true,
                    params: [
                        {
                            name: 'prompt',
                            required: true,
                            description: 'Your message to the agent',
                            placeholder: 'What would you like to talk about?',
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
    }

    /**
     * Helper to encode permissions (placeholder - implement based on OpenChat SDK)
     */
    private encodePermissions(permissions: any): number {
        // This should use the actual Permissions.encodePermissions from OpenChat SDK
        // For now, return a placeholder
        return 0;
    }

    /**
     * Send a message to OpenChat
     */
    async sendMessage(chatId: string, content: Content): Promise<void> {
        try {
            // Create client in autonomous context
            const client = this.factory.createClientInAutonomouseContext(
                { ChatId: chatId } as any,
                this.getConfig(this.runtime).icHost,
                null as any // permissions
            );

            await client.sendMessage(
                await client.createTextMessage(content.text || '')
            );
            
            this.runtime.logger?.log(`Message sent to chat ${chatId}`);
        } catch (error: any) {
            this.runtime.logger?.error('Error sending message:', error);
            throw error;
        }
    }

    /**
     * Stop the service
     */
    async stop(): Promise<void> {
        if (this.server) {
            await new Promise<void>((resolve) => {
                this.server.close(() => {
                    this.runtime.logger?.log('OpenChat bot server stopped');
                    resolve();
                });
            });
        }
    }
}

export default OpenChatService;
