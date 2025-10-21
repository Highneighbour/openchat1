import { IAgentRuntime } from "@elizaos/core";
import { BotClientFactory, BotClient, ChatActionScope } from "@open-ic/openchat-botclient-ts";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import { 
    OpenChatBotConfig, 
    WithBotClient, 
    OpenChatScope,
    OpenChatEvent 
} from "../types/index.js";

/**
 * OpenChat Client Service
 * Manages the OpenChat bot server and integration with ElizaOS runtime
 */
export class OpenChatClientService {
    static serviceType = "openchat";
    
    private runtime: IAgentRuntime;
    private factory: BotClientFactory;
    private app: Express;
    private server: any;
    private config: OpenChatBotConfig;
    private installations: Map<string, { scope: OpenChatScope; permissions: string[] }>;

    constructor(runtime: IAgentRuntime, config: OpenChatBotConfig) {
        this.runtime = runtime;
        this.config = config;
        this.installations = new Map();

        // Initialize BotClientFactory
        this.factory = new BotClientFactory({
            openchatPublicKey: config.openchatPublicKey,
            icHost: config.icHost,
            identityPrivateKey: config.identityPrivateKey,
            openStorageCanisterId: config.openStorageCanisterId,
        });

        // Initialize Express app
        this.app = express();
        this.setupRoutes();

        this.runtime.logger.info("OpenChat Client Service initialized");
    }

    /**
     * Setup Express routes for OpenChat bot endpoints
     */
    private setupRoutes(): void {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.raw({ type: 'application/octet-stream' }));

        // Bot definition endpoint
        this.app.get("/bot_definition", (req, res) => {
            res.json(this.getBotDefinition());
        });

        // Command execution endpoint
        this.app.post("/execute_command", async (req, res) => {
            // Commands are handled here
            res.json({ message: "Command executed" });
        });

        // Notification endpoint
        this.app.post("/notify", async (req, res) => {
            res.json({ status: "ok" });
        });
    }

    /**
     * Get bot definition
     */
    private getBotDefinition() {
        return {
            description: this.runtime.character.bio?.[0] || "ElizaOS bot",
            commands: [],
            autonomous_config: {
                permissions: { message: ["Text"], chat: [], community: [] }
            }
        };
    }

    /**
     * Start the OpenChat bot server
     */
    public async start(): Promise<void> {
        return new Promise((resolve) => {
            this.server = this.app.listen(this.config.port || 3001, () => {
                this.runtime.logger.info(`OpenChat bot server listening on port ${this.config.port || 3001}`);
                resolve();
            });
        });
    }

    /**
     * Stop the OpenChat bot server
     */
    public async stop(): Promise<void> {
        if (this.server) {
            return new Promise((resolve) => {
                this.server.close(() => {
                    this.runtime.logger.info("OpenChat bot server stopped");
                    resolve();
                });
            });
        }
    }

    /**
     * Create a bot client for autonomous context
     */
    public createClientForScope(
        scope: OpenChatScope,
        apiGatewayUrl: string,
        permissions: string[]
    ): BotClient {
        return this.factory.createClientInAutonomouseContext(
            scope,
            apiGatewayUrl,
            permissions as any
        );
    }

    /**
     * Get all installations
     */
    public getInstallations(): Map<string, { scope: OpenChatScope; permissions: string[] }> {
        return this.installations;
    }

    /**
     * Get factory instance
     */
    public getFactory(): BotClientFactory {
        return this.factory;
    }

    /**
     * Get runtime instance
     */
    public getRuntime(): IAgentRuntime {
        return this.runtime;
    }
}

export default OpenChatClientService;
Service;
