import type { Plugin } from "@elizaos/core";
import { logger } from "@elizaos/core";
import { z } from "zod";
import { OpenChatService } from "./service";
import { initializeOpenChatClient } from "./client";
import * as actions from "./actions";
import * as providers from "./providers";
import type { OpenChatConfig } from "./types";

// Export all public APIs
export * from "./types";
export * from "./client";
export * from "./service";
export * from "./actions";
export * from "./providers";

/**
 * Configuration schema for the OpenChat plugin
 */
const openChatConfigSchema = z.object({
  OPENCHAT_PUBLIC_KEY: z
    .string()
    .min(1, "OpenChat public key is required")
    .describe("OpenChat public key for JWT verification"),
  
  IC_HOST: z
    .string()
    .min(1, "IC host is required")
    .describe("Internet Computer host URL"),
  
  IDENTITY_PRIVATE_KEY: z
    .string()
    .min(1, "Identity private key is required")
    .describe("Bot identity private key in PEM format"),
  
  STORAGE_INDEX_CANISTER: z
    .string()
    .min(1, "Storage index canister is required")
    .describe("OpenStorage canister ID"),
  
  OPENCHAT_BOT_PORT: z
    .string()
    .optional()
    .default("3000")
    .transform((val) => val || "3000")
    .describe("Port for the OpenChat bot server"),
  
  OPENCHAT_AUTONOMOUS: z
    .string()
    .optional()
    .default("false")
    .transform((val) => val === "true")
    .describe("Enable autonomous mode"),
});

/**
 * OpenChat Plugin for ElizaOS
 * 
 * This plugin enables ElizaOS agents to interact with OpenChat (oc.app).
 * It provides:
 * - Message receiving and sending
 * - Actions for interacting with OpenChat (send, react, delete messages)
 * - Providers for context (chat info, user info, installations)
 * - Express server for handling OpenChat bot callbacks
 * 
 * Configuration required:
 * - OPENCHAT_PUBLIC_KEY: Public key from OpenChat for JWT verification
 * - IC_HOST: Internet Computer host URL
 * - IDENTITY_PRIVATE_KEY: Bot's private key (PEM format)
 * - STORAGE_INDEX_CANISTER: OpenChat storage canister ID
 * - OPENCHAT_BOT_PORT: Port for bot server (optional, default: 3000)
 * - OPENCHAT_AUTONOMOUS: Enable autonomous mode (optional, default: false)
 * 
 * Usage:
 * 1. Install the plugin in your ElizaOS project
 * 2. Configure environment variables
 * 3. Add plugin to your agent's character file
 * 4. Register the bot on OpenChat with your bot's endpoint
 * 5. Install the bot in OpenChat chats to start interacting
 */
export const openChatPlugin: Plugin = {
  name: "@elizaos/plugin-openchat",
  description: "OpenChat integration for ElizaOS - enables agents to interact with OpenChat (oc.app)",
  
  config: {
    OPENCHAT_PUBLIC_KEY: process.env.OPENCHAT_PUBLIC_KEY,
    IC_HOST: process.env.IC_HOST,
    IDENTITY_PRIVATE_KEY: process.env.IDENTITY_PRIVATE_KEY,
    STORAGE_INDEX_CANISTER: process.env.STORAGE_INDEX_CANISTER,
    OPENCHAT_BOT_PORT: process.env.OPENCHAT_BOT_PORT,
    OPENCHAT_AUTONOMOUS: process.env.OPENCHAT_AUTONOMOUS,
  },

  /**
   * Initialize the plugin
   */
  async init(config: Record<string, string>) {
    logger.info("[OpenChat] Initializing plugin...");
    
    try {
      // Validate configuration
      const validatedConfig = await openChatConfigSchema.parseAsync(config);

      // Set environment variables
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value !== undefined) {
          process.env[key] = String(value);
        }
      }

      logger.info("[OpenChat] Plugin configuration validated");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues?.map((e) => `${e.path.join(".")}: ${e.message}`)?.join(", ");
        logger.error({ error: errorMessages }, "[OpenChat] Invalid plugin configuration");
        throw new Error(`OpenChat plugin configuration error: ${errorMessages}`);
      }
      throw new Error(
        `OpenChat plugin initialization error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  /**
   * Services - includes the OpenChat bot server
   */
  services: [OpenChatService],

  /**
   * Actions - what the agent can do with OpenChat
   */
  actions: [
    actions.sendMessageAction,
    actions.reactToMessageAction,
    actions.deleteMessageAction,
  ],

  /**
   * Providers - context given to the agent
   */
  providers: [
    providers.chatContextProvider,
    providers.userInfoProvider,
    providers.installationsProvider,
  ],

  /**
   * Event handlers
   */
  events: {
    // Handle when messages are received
    MESSAGE_RECEIVED: [
      async (params) => {
        logger.debug("[OpenChat] MESSAGE_RECEIVED event");
        // Additional message handling if needed
      },
    ],
  },

  /**
   * Custom initialization hook
   */
  async onLoad(runtime) {
    logger.info("[OpenChat] Plugin loaded, initializing client...");
    
    try {
      // Initialize the OpenChat client
      const config: OpenChatConfig = {
        OPENCHAT_PUBLIC_KEY: runtime.getSetting("OPENCHAT_PUBLIC_KEY") || process.env.OPENCHAT_PUBLIC_KEY || "",
        IC_HOST: runtime.getSetting("IC_HOST") || process.env.IC_HOST || "",
        IDENTITY_PRIVATE_KEY: runtime.getSetting("IDENTITY_PRIVATE_KEY") || process.env.IDENTITY_PRIVATE_KEY || "",
        STORAGE_INDEX_CANISTER: runtime.getSetting("STORAGE_INDEX_CANISTER") || process.env.STORAGE_INDEX_CANISTER || "",
        OPENCHAT_BOT_PORT: parseInt(runtime.getSetting("OPENCHAT_BOT_PORT") || process.env.OPENCHAT_BOT_PORT || "3000"),
        OPENCHAT_AUTONOMOUS: runtime.getSetting("OPENCHAT_AUTONOMOUS") === "true" || process.env.OPENCHAT_AUTONOMOUS === "true",
      };

      initializeOpenChatClient(runtime, config);
      logger.info("[OpenChat] Client initialized successfully");
    } catch (error) {
      logger.error({ error }, "[OpenChat] Failed to initialize client");
      throw error;
    }
  },
};

// Default export
export default openChatPlugin;
