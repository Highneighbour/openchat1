import { IAgentRuntime } from "@elizaos/core";
import { BotClientFactory, InstallationRecord, ChatActionScope } from "@open-ic/openchat-botclient-ts";
import express, { Express } from "express";
import cors from "cors";
import { createBotClientFactory } from "../bot/factory.js";
import { createJwtMiddleware } from "../bot/middleware/jwt.js";
import { executeCommand } from "../bot/handlers/execute.js";
import { handleDefinition } from "../bot/handlers/definition.js";
import { createNotifyHandler } from "../bot/handlers/notify.js";

export interface OpenChatBotConfig {
    openchatPublicKey: string;
    icHost: string;
    identityPrivateKey: string;
    openStorageCanisterId: string;
    port: number;
}

/**
 * OpenChat Service - Manages bot server and installations
 * Redesigned based on the YouTube Lambda bot pattern
 */
export class OpenChatService {
    static serviceType = "openchat";
    
    private runtime: IAgentRuntime;
    private factory: BotClientFactory;
    private app: Express;
    private server: any;
    private config: OpenChatBotConfig;
    private installations: Map<string, InstallationRecord>;

    constructor(runtime: IAgentRuntime, config: OpenChatBotConfig) {
        this.runtime = runtime;
        this.config = config;
        this.installations = new Map();

        // Create bot client factory
        this.factory = createBotClientFactory({
            openchatPublicKey: config.openchatPublicKey,
            icHost: config.icHost,
            identityPrivateKey: config.identityPrivateKey,
            openStorageCanisterId: config.openStorageCanisterId,
        });

        // Initialize Express app
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();

        console.log("[OpenChat] Service initialized");
    }

    /**
     * Setup Express middleware
     */
    private setupMiddleware(): void {
        this.app.use(cors());
        this.app.use(express.raw({ type: '*/*', limit: '10mb' })); // For signature verification
    }

    /**
     * Setup Express routes
     */
    private setupRoutes(): void {
        // Bot definition endpoint
        this.app.get("/bot_definition", handleDefinition(this.runtime));

        // Command execution endpoint (with JWT middleware)
        this.app.post("/execute_command", 
            createJwtMiddleware(this.factory),
            (req, res) => executeCommand(req, res, this.runtime)
        );

        // Notification endpoint (for installations and events)
        this.app.post("/notify",
            createNotifyHandler(
                this.factory,
                this.runtime,
                async (location, record) => {
                    const key = this.getLocationKey(location);
                    this.installations.set(key, record);
                    console.log(`[OpenChat] Installation saved: ${key}`);
                },
                async (location) => {
                    const key = this.getLocationKey(location);
                    this.installations.delete(key);
                    console.log(`[OpenChat] Installation removed: ${key}`);
                }
            )
        );

        // Health check
        this.app.get("/health", (req, res) => {
            res.json({ status: "ok", installations: this.installations.size });
        });
    }

    /**
     * Get location key for installation tracking
     */
    private getLocationKey(location: any): string {
        if (location.kind === "chat") {
            return `chat-${location.chatId}`;
        } else if (location.kind === "channel") {
            return `channel-${location.communityId}-${location.channelId}`;
        } else if (location.kind === "community") {
            return `community-${location.communityId}`;
        }
        return "unknown";
    }

    /**
     * Start the bot server
     */
    public async start(): Promise<void> {
        return new Promise((resolve) => {
            this.server = this.app.listen(this.config.port, () => {
                console.log(`[OpenChat] Bot server listening on port ${this.config.port}`);
                console.log(`[OpenChat] Bot definition: http://localhost:${this.config.port}/bot_definition`);
                resolve();
            });
        });
    }

    /**
     * Stop the bot server
     */
    public async stop(): Promise<void> {
        if (this.server) {
            return new Promise((resolve) => {
                this.server.close(() => {
                    console.log("[OpenChat] Bot server stopped");
                    resolve();
                });
            });
        }
    }

    /**
     * Get bot client factory
     */
    public getFactory(): BotClientFactory {
        return this.factory;
    }

    /**
     * Get installations
     */
    public getInstallations(): Map<string, InstallationRecord> {
        return this.installations;
    }

    /**
     * Send autonomous message to a scope
     */
    public async sendMessage(
        scope: ChatActionScope,
        apiGateway: string,
        permissions: string[],
        text: string
    ): Promise<void> {
        const client = this.factory.createClientInAutonomouseContext(
            scope,
            apiGateway,
            permissions as any
        );

        try {
            const msg = await client.createTextMessage(text);
            const result = await client.sendMessage(msg);
            
            if (result.kind !== "success") {
                console.error("[OpenChat] Send failed:", result);
            }
        } catch (error) {
            console.error("[OpenChat] Error sending message:", error);
            throw error;
        }
    }
}

export default OpenChatService;
