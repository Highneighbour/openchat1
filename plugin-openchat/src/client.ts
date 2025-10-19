import { BotClientFactory, BotClient } from "@open-ic/openchat-botclient-ts";
import type { IAgentRuntime } from "@elizaos/core";
import { logger } from "@elizaos/core";
import type { 
  OpenChatConfig, 
  OpenChatClientWrapper, 
  InstallationInfo,
  OpenChatMessageContext 
} from "./types";

/**
 * OpenChat client manager for ElizaOS
 * Manages bot client instances and installation tracking
 */
export class OpenChatClient implements OpenChatClientWrapper {
  public factory: BotClientFactory;
  public runtime: IAgentRuntime;
  public activeClients: Map<string, BotClient>;
  public installations: Map<string, InstallationInfo>;
  private config: OpenChatConfig;

  constructor(runtime: IAgentRuntime, config: OpenChatConfig) {
    this.runtime = runtime;
    this.config = config;
    this.activeClients = new Map();
    this.installations = new Map();

    // Initialize the OpenChat bot client factory
    this.factory = new BotClientFactory({
      openchatPublicKey: config.OPENCHAT_PUBLIC_KEY,
      icHost: config.IC_HOST,
      identityPrivateKey: config.IDENTITY_PRIVATE_KEY,
      openStorageCanisterId: config.STORAGE_INDEX_CANISTER,
    });

    logger.info("[OpenChat] Client initialized");
  }

  /**
   * Create a bot client from a command JWT
   */
  createClientFromJWT(jwt: string): BotClient {
    try {
      const client = this.factory.createClientFromCommandJwt(jwt);
      logger.debug("[OpenChat] Bot client created from JWT");
      return client;
    } catch (error) {
      logger.error({ error }, "[OpenChat] Failed to create client from JWT");
      throw error;
    }
  }

  /**
   * Create a bot client for autonomous operation
   */
  createAutonomousClient(scope: string, apiGatewayUrl: string, permissions?: string[]): BotClient {
    try {
      const client = this.factory.createClientInAutonomouseContext(
        scope,
        apiGatewayUrl,
        permissions
      );
      this.activeClients.set(scope, client);
      logger.debug({ scope }, "[OpenChat] Autonomous bot client created");
      return client;
    } catch (error) {
      logger.error({ error, scope }, "[OpenChat] Failed to create autonomous client");
      throw error;
    }
  }

  /**
   * Register a bot installation
   */
  registerInstallation(
    scope: string,
    permissions: string[],
    chatType: "Group" | "Channel" | "DirectChat" | "Community"
  ): void {
    const installation: InstallationInfo = {
      scope,
      permissions,
      installedAt: new Date(),
      chatType,
    };
    this.installations.set(scope, installation);
    logger.info({ scope, chatType, permissions }, "[OpenChat] Bot installation registered");
  }

  /**
   * Unregister a bot installation
   */
  unregisterInstallation(scope: string): void {
    this.installations.delete(scope);
    this.activeClients.delete(scope);
    logger.info({ scope }, "[OpenChat] Bot installation unregistered");
  }

  /**
   * Get installation info for a scope
   */
  getInstallation(scope: string): InstallationInfo | undefined {
    return this.installations.get(scope);
  }

  /**
   * Check if bot has permission in a scope
   */
  hasPermission(scope: string, permission: string): boolean {
    const installation = this.installations.get(scope);
    if (!installation) {
      return false;
    }
    return installation.permissions.includes(permission);
  }

  /**
   * Get all installations
   */
  getAllInstallations(): InstallationInfo[] {
    return Array.from(this.installations.values());
  }

  /**
   * Send a text message to OpenChat
   */
  async sendTextMessage(
    client: BotClient,
    text: string,
    finalised: boolean = true
  ): Promise<any> {
    try {
      const message = await client.createTextMessage(text);
      message.setFinalised(finalised);
      
      if (finalised) {
        await client.sendMessage(message);
      }
      
      logger.debug({ text: text.substring(0, 50) }, "[OpenChat] Text message sent");
      return message;
    } catch (error) {
      logger.error({ error }, "[OpenChat] Failed to send text message");
      throw error;
    }
  }

  /**
   * Send an image message to OpenChat
   */
  async sendImageMessage(
    client: BotClient,
    imageUrl: string,
    caption?: string,
    finalised: boolean = true
  ): Promise<any> {
    try {
      // Fetch image data
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${imageUrl}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const imageData = new Uint8Array(arrayBuffer);
      
      const message = await client.createImageMessage(
        imageData,
        caption || "",
        "image/png" // TODO: detect actual content type
      );
      message.setFinalised(finalised);
      
      if (finalised) {
        await client.sendMessage(message);
      }
      
      logger.debug({ imageUrl, caption }, "[OpenChat] Image message sent");
      return message;
    } catch (error) {
      logger.error({ error, imageUrl }, "[OpenChat] Failed to send image message");
      throw error;
    }
  }

  /**
   * React to a message
   */
  async reactToMessage(
    client: BotClient,
    messageId: string,
    reaction: string
  ): Promise<void> {
    try {
      await client.addReaction(BigInt(messageId), reaction);
      logger.debug({ messageId, reaction }, "[OpenChat] Added reaction to message");
    } catch (error) {
      logger.error({ error, messageId, reaction }, "[OpenChat] Failed to add reaction");
      throw error;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(client: BotClient, messageId: string): Promise<void> {
    try {
      await client.deleteMessage(BigInt(messageId));
      logger.debug({ messageId }, "[OpenChat] Deleted message");
    } catch (error) {
      logger.error({ error, messageId }, "[OpenChat] Failed to delete message");
      throw error;
    }
  }

  /**
   * Get chat summary/context
   */
  async getChatContext(client: BotClient): Promise<any> {
    try {
      const summary = await client.getChatSummary();
      logger.debug("[OpenChat] Retrieved chat summary");
      return summary;
    } catch (error) {
      logger.error({ error }, "[OpenChat] Failed to get chat summary");
      throw error;
    }
  }

  /**
   * Read messages from a chat
   */
  async readMessages(
    client: BotClient,
    limit: number = 100
  ): Promise<any[]> {
    try {
      const messages = await client.getMessages(limit);
      logger.debug({ count: messages.length }, "[OpenChat] Retrieved messages");
      return messages;
    } catch (error) {
      logger.error({ error }, "[OpenChat] Failed to read messages");
      throw error;
    }
  }
}

/**
 * Global OpenChat client instance
 */
let openChatClientInstance: OpenChatClient | null = null;

/**
 * Initialize the global OpenChat client
 */
export function initializeOpenChatClient(
  runtime: IAgentRuntime,
  config: OpenChatConfig
): OpenChatClient {
  if (!openChatClientInstance) {
    openChatClientInstance = new OpenChatClient(runtime, config);
  }
  return openChatClientInstance;
}

/**
 * Get the global OpenChat client instance
 */
export function getOpenChatClient(): OpenChatClient {
  if (!openChatClientInstance) {
    throw new Error("OpenChat client not initialized. Call initializeOpenChatClient first.");
  }
  return openChatClientInstance;
}
