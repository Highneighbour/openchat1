/**
 * OpenChat Client for ElizaOS
 * Implements the ElizaOS Client interface for OpenChat platform integration
 */

import {
  type IAgentRuntime,
  type Client,
  elizaLogger,
  type Memory,
  type UUID,
  stringToUuid,
  generateMessageResponse,
  ModelClass,
  composeContext,
  type Content,
} from "@ai16z/eliza";
import { BotClientFactory } from "@open-ic/openchat-botclient-ts";
import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import type { Server } from "http";
import { v4 as uuidv4 } from "uuid";
import type { OpenChatConfig } from "./types";
import { DEFAULT_PORT, DEFAULT_IC_HOST } from "./constants";

/**
 * OpenChat Client Implementation
 */
export class OpenChatClient implements Client {
  private app: Express;
  private server: Server | null = null;
  private runtime: IAgentRuntime | null = null;
  private botFactory: BotClientFactory;
  private config: Required<OpenChatConfig>;

  constructor(config: OpenChatConfig) {
    // Set default values
    this.config = {
      openchatPublicKey: config.openchatPublicKey,
      icHost: config.icHost || DEFAULT_IC_HOST,
      identityPrivateKey: config.identityPrivateKey,
      openStorageCanisterId: config.openStorageCanisterId,
      port: config.port || DEFAULT_PORT,
      debug: config.debug || false,
    };

    // Initialize OpenChat bot factory
    this.botFactory = new BotClientFactory({
      openchatPublicKey: this.config.openchatPublicKey,
      icHost: this.config.icHost,
      identityPrivateKey: this.config.identityPrivateKey,
      openStorageCanisterId: this.config.openStorageCanisterId,
    });

    // Setup Express app
    this.app = express();
    this.setupRoutes();
  }

  /**
   * Setup Express routes for OpenChat bot
   */
  private setupRoutes(): void {
    this.app.use(cors());

    // Bot definition endpoint (required by OpenChat)
    this.app.get("/", this.getBotDefinition.bind(this));
    this.app.get("/bot_definition", this.getBotDefinition.bind(this));

    // Execute command endpoint (handles bot commands)
    this.app.post(
      "/execute_command",
      express.text(),
      this.executeCommand.bind(this)
    );

    // Health check
    this.app.get("/health", (_req, res) => {
      res.json({ status: "ok", client: "openchat" });
    });
  }

  /**
   * Bot definition endpoint
   */
  private getBotDefinition(_req: Request, res: Response): void {
    const character = this.runtime?.character;
    
    res.status(200).json({
      description: character?.bio?.[0] || 
        "An intelligent AI agent powered by ElizaOS",
      autonomous_config: {
        permissions: this.encodePermissions({
          message: ["Text"],
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
          name: "prompt",
          default_role: "Participant",
          description: character?.bio?.[0] || "Send a message to the AI agent",
          permissions: this.encodePermissions({
            message: ["Text"],
            chat: ["ReadChatSummary"],
          }),
          direct_messages: true,
          params: [
            {
              name: "prompt",
              required: true,
              description: "Your message to the AI agent",
              placeholder: character?.style?.chat?.[0] || "Ask me anything...",
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
    });
  }

  /**
   * Helper to encode permissions for OpenChat
   */
  private encodePermissions(perms: any): number {
    // Simple encoding - in production, use proper OpenChat Permissions encoding
    return 0;
  }

  /**
   * Execute command handler
   */
  private async executeCommand(req: Request, res: Response): Promise<void> {
    try {
      if (!this.runtime) {
        res.status(500).send("Runtime not initialized");
        return;
      }

      // Authenticate and create bot client
      const token = req.headers["x-oc-jwt"];
      if (!token) {
        res.status(400).send("Missing authentication token");
        return;
      }

      const botClient = this.botFactory.createClientFromCommandJwt(
        token as string
      );

      // Get command info
      const commandName = botClient.commandName;

      if (commandName === "prompt") {
        await this.handlePromptCommand(botClient, res);
      } else {
        res.status(400).send("Unknown command");
      }
    } catch (error) {
      elizaLogger.error("Error executing command:", error);
      res.status(500).send("Internal server error");
    }
  }

  /**
   * Handle the prompt command
   */
  private async handlePromptCommand(
    botClient: any,
    res: Response
  ): Promise<void> {
    // Send initial "thinking" message
    const placeholder = (
      await botClient.createTextMessage("Thinking...")
    ).setFinalised(false);
    
    res.status(200).json({
      message: placeholder.toResponse(),
    });

    // Get prompt text
    const promptText = botClient.stringArg("prompt");
    if (!promptText) {
      const errorMsg = await botClient.createTextMessage(
        "Please provide a message."
      );
      await botClient.sendMessage(errorMsg);
      return;
    }

    try {
      // Extract user context
      const userId = botClient.initiator || "unknown";
      const userName = botClient.initiator || "User";
      const chatId = botClient.chatId?.toString() || "default";

      // Process through ElizaOS
      const response = await this.processMessage(
        userId,
        userName,
        promptText,
        chatId
      );

      // Send response
      const responseMessage = await botClient.createTextMessage(response);
      await botClient.sendMessage(responseMessage);
    } catch (error) {
      elizaLogger.error("Error processing prompt:", error);
      const errorMsg = await botClient.createTextMessage(
        "I apologize, but I encountered an error processing your message."
      );
      await botClient.sendMessage(errorMsg);
    }
  }

  /**
   * Process message through ElizaOS runtime
   */
  private async processMessage(
    userId: string,
    userName: string,
    messageText: string,
    chatId: string
  ): Promise<string> {
    if (!this.runtime) {
      throw new Error("Runtime not initialized");
    }

    const userUuid: UUID = stringToUuid(`openchat-user-${userId}`);
    const roomUuid: UUID = stringToUuid(`openchat-room-${chatId}`);

    // Ensure user and room exist
    await this.runtime.ensureUserExists(
      userUuid,
      userName,
      userName,
      "openchat"
    );
    await this.runtime.ensureRoomExists(roomUuid);
    await this.runtime.ensureParticipantInRoom(userUuid, roomUuid);

    // Create memory for incoming message
    const memory: Memory = {
      id: stringToUuid(uuidv4()),
      userId: userUuid,
      agentId: this.runtime.agentId,
      roomId: roomUuid,
      content: {
        text: messageText,
        source: "openchat",
      },
      createdAt: Date.now(),
    };

    // Store message
    await this.runtime.messageManager.createMemory(memory);

    // Compose state and context
    const state = await this.runtime.composeState(memory, {
      userName,
      userId: userUuid,
      roomId: roomUuid,
    });

    const context = composeContext({
      state,
      template:
        this.runtime.character.templates?.messageHandlerTemplate ||
        "{{recentMessages}}\n\nRespond naturally and helpfully to: {{userMessage}}",
    });

    // Generate response
    const responseContent: Content = await generateMessageResponse({
      runtime: this.runtime,
      context,
      modelClass: ModelClass.SMALL,
    });

    const responseText = responseContent.text;

    // Store agent response
    if (responseText && responseText.trim()) {
      const responseMemory: Memory = {
        id: stringToUuid(uuidv4()),
        userId: this.runtime.agentId,
        agentId: this.runtime.agentId,
        roomId: roomUuid,
        content: {
          text: responseText,
          source: "openchat",
          inReplyTo: memory.id,
        },
        createdAt: Date.now(),
      };

      await this.runtime.messageManager.createMemory(responseMemory);
      return responseText;
    }

    return "I apologize, but I couldn't generate a response. Please try again.";
  }

  /**
   * Start the OpenChat client
   * Required by ElizaOS Client interface
   */
  async start(runtime: IAgentRuntime): Promise<void> {
    this.runtime = runtime;

    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.config.port, () => {
          elizaLogger.success(
            `OpenChat client started on port ${this.config.port}`
          );
          elizaLogger.info(
            `Bot definition: http://localhost:${this.config.port}/bot_definition`
          );
          resolve();
        });

        this.server.on("error", (error) => {
          elizaLogger.error("Failed to start OpenChat client:", error);
          reject(error);
        });
      } catch (error) {
        elizaLogger.error("Error starting OpenChat client:", error);
        reject(error);
      }
    });
  }

  /**
   * Stop the OpenChat client
   * Required by ElizaOS Client interface
   */
  async stop(_runtime: IAgentRuntime): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) {
            elizaLogger.error("Error stopping OpenChat client:", err);
            reject(err);
          } else {
            elizaLogger.info("OpenChat client stopped");
            this.server = null;
            this.runtime = null;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}
