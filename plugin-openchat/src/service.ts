import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import type { IAgentRuntime, Memory, UUID } from "@elizaos/core";
import { Service, logger, composePromptFromState, asUUID } from "@elizaos/core";
import { Server } from "http";
import { getOpenChatClient } from "./client";
import { getBotDefinition } from "./handlers/schema";
import { handleNotification } from "./handlers/notify";
import type { OpenChatConfig } from "./types";

/**
 * OpenChat Service for ElizaOS
 * Manages the Express server that handles OpenChat bot callbacks
 */
export class OpenChatService extends Service {
  private app: express.Application;
  private server: Server | null = null;
  private config: OpenChatConfig;
  static serviceType = "openchat";

  constructor(runtime: IAgentRuntime, config: OpenChatConfig) {
    super(runtime);
    this.config = config;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.text());
    this.app.use(express.raw({ type: "application/msgpack" }));
  }

  /**
   * Setup Express routes for OpenChat callbacks
   */
  private setupRoutes(): void {
    // Bot definition endpoint
    this.app.get("/bot_definition", (_req: Request, res: Response) => {
      try {
        const definition = getBotDefinition();
        res.status(200).json(definition);
      } catch (error) {
        logger.error({ error }, "[OpenChat] Error in bot_definition");
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Root endpoint (also returns bot definition)
    this.app.get("/", (_req: Request, res: Response) => {
      try {
        const definition = getBotDefinition();
        res.status(200).json(definition);
      } catch (error) {
        logger.error({ error }, "[OpenChat] Error in root endpoint");
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Execute command endpoint
    this.app.post(
      "/execute_command",
      this.createBotClientMiddleware(),
      this.handleExecuteCommand.bind(this)
    );

    // Notify endpoint for events
    this.app.post("/notify", this.handleNotify.bind(this));

    // Health check endpoint
    this.app.get("/health", (_req: Request, res: Response) => {
      res.status(200).json({ status: "ok", service: "openchat" });
    });
  }

  /**
   * Middleware to create OpenChat bot client from JWT
   */
  private createBotClientMiddleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const token = req.headers["x-oc-jwt"] || req.body;
        if (!token || typeof token !== "string") {
          logger.error("[OpenChat] No JWT token found in request");
          res.status(400).send("Access token not found");
          return;
        }

        const client = getOpenChatClient();
        const botClient = client.createClientFromJWT(token);
        
        // Attach bot client to request
        (req as any).botClient = botClient;
        next();
      } catch (error) {
        logger.error({ error }, "[OpenChat] Error creating bot client");
        res.status(500).send("Error creating bot client");
      }
    };
  }

  /**
   * Handle execute_command requests from OpenChat
   */
  private async handleExecuteCommand(req: Request, res: Response): Promise<void> {
    const botClient = (req as any).botClient;
    if (!botClient) {
      res.status(500).send("Bot client not initialized");
      return;
    }

    try {
      const commandName = botClient.commandName;
      logger.info({ commandName }, "[OpenChat] Executing command");

      // Handle different commands
      switch (commandName) {
        case "chat":
          await this.handleChatCommand(botClient, res);
          break;
        case "prompt":
          await this.handleChatCommand(botClient, res);
          break;
        default:
          logger.warn({ commandName }, "[OpenChat] Unknown command");
          res.status(400).send(`Unknown command: ${commandName}`);
      }
    } catch (error) {
      logger.error({ error }, "[OpenChat] Error executing command");
      res.status(500).send("Error executing command");
    }
  }

  /**
   * Handle chat command - main interaction with the agent
   */
  private async handleChatCommand(botClient: any, res: Response): Promise<void> {
    try {
      const openChatClient = getOpenChatClient();

      // Get user's prompt
      const prompt = botClient.stringArg("prompt") || botClient.stringArg("message");
      if (!prompt) {
        res.status(400).send("Prompt is required");
        return;
      }

      // Send placeholder message immediately
      const placeholder = await openChatClient.sendTextMessage(
        botClient,
        "🤔 Thinking...",
        false
      );
      res.status(200).json({ message: placeholder.toResponse() });

      // Get user info
      const userId = botClient.userId || "unknown";
      const userName = botClient.userName || "User";

      // Create ElizaOS memory for the message
      const memory: Memory = {
        id: asUUID(Date.now().toString()),
        userId: asUUID(userId),
        agentId: this.runtime.agentId,
        roomId: asUUID(botClient.chatId || "openchat"),
        content: {
          text: prompt,
          source: "openchat",
          inReplyTo: undefined,
        },
        createdAt: Date.now(),
      };

      // Store the memory
      await this.runtime.messageManager.createMemory(memory);

      // Compose state for the agent
      const state = await this.runtime.composeState(memory);

      // Generate response using the agent
      // Try to use the message generation API if available
      let responseText = "";
      
      try {
        // Attempt to generate a response using the runtime's generation capabilities
        if (typeof this.runtime.generateText === 'function') {
          responseText = await this.runtime.generateText({
            context: state,
            modelType: "text",
          });
        } else if (typeof this.runtime.processActions === 'function') {
          // Fallback to processActions
          const response = await this.runtime.processActions(
            memory,
            [memory],
            state
          );
          if (response && response.length > 0) {
            responseText = response.map(r => r.content?.text || "").join("\n");
          }
        } else {
          // Ultimate fallback - just compose a response from the state
          responseText = await composePromptFromState(state, this.runtime);
        }
      } catch (genError) {
        logger.error({ error: genError }, "[OpenChat] Error generating response");
        responseText = "I'm here! How can I help you?";
      }

      // Send the agent's response back to OpenChat
      if (responseText && responseText.trim()) {
        await openChatClient.sendTextMessage(botClient, responseText.trim(), true);
      } else {
        // Fallback response if agent doesn't generate anything
        await openChatClient.sendTextMessage(
          botClient,
          "I'm here! How can I help you?",
          true
        );
      }

      logger.info({ userId, prompt: prompt.substring(0, 50) }, "[OpenChat] Chat command handled");
    } catch (error) {
      logger.error({ error }, "[OpenChat] Error handling chat command");
      try {
        const openChatClient = getOpenChatClient();
        await openChatClient.sendTextMessage(
          botClient,
          "Sorry, I encountered an error processing your request.",
          true
        );
      } catch (sendError) {
        logger.error({ error: sendError }, "[OpenChat] Failed to send error message");
      }
    }
  }

  /**
   * Handle notify requests from OpenChat (events)
   */
  private async handleNotify(req: Request, res: Response): Promise<void> {
    try {
      await handleNotification(req, res, this.runtime);
    } catch (error) {
      logger.error({ error }, "[OpenChat] Error handling notification");
      res.status(500).send("Error handling notification");
    }
  }

  /**
   * Start the OpenChat service
   */
  static async start(runtime: IAgentRuntime): Promise<OpenChatService> {
    const config: OpenChatConfig = {
      OPENCHAT_PUBLIC_KEY: runtime.getSetting("OPENCHAT_PUBLIC_KEY") || process.env.OPENCHAT_PUBLIC_KEY || "",
      IC_HOST: runtime.getSetting("IC_HOST") || process.env.IC_HOST || "",
      IDENTITY_PRIVATE_KEY: runtime.getSetting("IDENTITY_PRIVATE_KEY") || process.env.IDENTITY_PRIVATE_KEY || "",
      STORAGE_INDEX_CANISTER: runtime.getSetting("STORAGE_INDEX_CANISTER") || process.env.STORAGE_INDEX_CANISTER || "",
      OPENCHAT_BOT_PORT: parseInt(runtime.getSetting("OPENCHAT_BOT_PORT") || process.env.OPENCHAT_BOT_PORT || "3000"),
      OPENCHAT_AUTONOMOUS: runtime.getSetting("OPENCHAT_AUTONOMOUS") === "true" || process.env.OPENCHAT_AUTONOMOUS === "true",
    };

    // Validate required config
    if (!config.OPENCHAT_PUBLIC_KEY || !config.IC_HOST || !config.IDENTITY_PRIVATE_KEY || !config.STORAGE_INDEX_CANISTER) {
      logger.error("[OpenChat] Missing required configuration. Please set OPENCHAT_PUBLIC_KEY, IC_HOST, IDENTITY_PRIVATE_KEY, and STORAGE_INDEX_CANISTER");
      throw new Error("Missing required OpenChat configuration");
    }

    const service = new OpenChatService(runtime, config);
    await service.initialize();
    return service;
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const port = this.config.OPENCHAT_BOT_PORT || 3000;
        this.server = this.app.listen(port, () => {
          logger.info({ port }, "[OpenChat] Bot server started");
          resolve();
        });

        this.server.on("error", (error) => {
          logger.error({ error }, "[OpenChat] Server error");
          reject(error);
        });
      } catch (error) {
        logger.error({ error }, "[OpenChat] Failed to start server");
        reject(error);
      }
    });
  }

  /**
   * Stop the OpenChat service
   */
  static async stop(runtime: IAgentRuntime): Promise<void> {
    logger.info("[OpenChat] Stopping service");
    const service = runtime.getService(OpenChatService.serviceType) as OpenChatService;
    if (service) {
      await service.stop();
    }
  }

  /**
   * Stop the service
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          logger.info("[OpenChat] Server stopped");
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
