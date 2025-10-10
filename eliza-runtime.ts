/**
 * ElizaOS Runtime Integration for OpenChat
 * This module initializes and manages the ElizaOS agent for processing messages
 */

import {
  AgentRuntime,
  ModelProviderName,
  elizaLogger,
  type Character,
  type IAgentRuntime,
  stringToUuid,
  Memory,
  type UUID,
  generateMessageResponse,
  ModelClass,
  CacheManager,
  type State,
  DbCacheAdapter,
  composeContext,
  type Content,
} from "@ai16z/eliza";
import { SqliteDatabaseAdapter } from "@ai16z/adapter-sqlite";
import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

// Global runtime instance
let agentRuntime: IAgentRuntime | null = null;

/**
 * Load the Eliza character configuration
 */
function loadCharacter(): Character {
  const configPath = path.join(process.cwd(), "eliza-config.json");
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Character config not found at ${configPath}`);
  }

  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  
  // Create a proper Character object with required fields
  const character: Character = {
    id: stringToUuid("eliza-openchat-bot"),
    name: config.name || "ElizaOpenChatBot",
    username: config.username || "eliza",
    system: config.system || "You are a helpful AI assistant integrated with OpenChat.",
    bio: config.bio || ["An AI agent powered by ElizaOS"],
    lore: config.lore || [],
    messageExamples: config.messageExamples || [],
    postExamples: config.postExamples || [],
    topics: config.topics || [],
    adjectives: config.adjectives || ["helpful", "intelligent"],
    style: config.style || {
      all: ["be helpful and informative"],
      chat: ["engage naturally"],
      post: ["be concise"]
    },
    modelProvider: (process.env.MODEL_PROVIDER as ModelProviderName) || ModelProviderName.OPENAI,
    settings: {
      model: process.env.AI_MODEL || config.settings?.model || "gpt-4",
      secrets: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      },
      ...config.settings,
    },
    plugins: [],
    clients: [],
  };

  return character;
}

/**
 * Initialize the ElizaOS agent runtime
 */
export async function initializeElizaRuntime(): Promise<IAgentRuntime> {
  if (agentRuntime) {
    return agentRuntime;
  }

  try {
    elizaLogger.info("Initializing ElizaOS runtime...");

    // Load character configuration
    const character = loadCharacter();

    // Initialize database
    const dbPath = process.env.ELIZA_DB_PATH || "./data/eliza.db";
    const dbDir = path.dirname(dbPath);
    
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create better-sqlite3 database instance
    const sqliteDb = new Database(dbPath);
    const db = new SqliteDatabaseAdapter(sqliteDb);
    await db.init();

    // Create cache manager with DbCacheAdapter
    const agentId = character.id || stringToUuid("eliza-openchat-bot");
    const cacheAdapter = new DbCacheAdapter(db, agentId);
    const cacheManager = new CacheManager(cacheAdapter);

    // Create agent runtime with proper configuration
    agentRuntime = new AgentRuntime({
      databaseAdapter: db,
      token: process.env.OPENAI_API_KEY || "",
      modelProvider: character.modelProvider,
      character,
      plugins: [],
      evaluators: [],
      providers: [],
      actions: [],
      services: [],
      cacheManager,
    });

    // Initialize the runtime
    await agentRuntime.initialize();

    elizaLogger.success("ElizaOS runtime initialized successfully");
    
    return agentRuntime;
  } catch (error) {
    elizaLogger.error("Failed to initialize ElizaOS runtime:", error);
    throw error;
  }
}

/**
 * Get the current agent runtime instance
 */
export function getElizaRuntime(): IAgentRuntime | null {
  return agentRuntime;
}

/**
 * Process a message through ElizaOS and get a response
 */
export async function processMessageWithEliza(
  userId: string,
  userName: string,
  messageText: string,
  roomId: string
): Promise<string> {
  try {
    const runtime = agentRuntime || await initializeElizaRuntime();

    elizaLogger.info(`Processing message from ${userName} (${userId}): ${messageText}`);

    // Create UUIDs for user and room
    const userUuid: UUID = stringToUuid(`openchat-user-${userId}`);
    const roomUuid: UUID = stringToUuid(`openchat-room-${roomId}`);

    // Ensure user and room exist in the database
    await runtime.ensureUserExists(
      userUuid,
      userName,
      userName,
      "openchat"
    );
    await runtime.ensureRoomExists(roomUuid);
    await runtime.ensureParticipantInRoom(userUuid, roomUuid);

    // Create memory for the incoming message
    const memory: Memory = {
      id: stringToUuid(uuidv4()),
      userId: userUuid,
      agentId: runtime.agentId,
      roomId: roomUuid,
      content: {
        text: messageText,
        source: "openchat",
      },
      createdAt: Date.now(),
    };

    // Store the incoming message
    await runtime.messageManager.createMemory(memory);

    // Compose state for the message
    const state: State = await runtime.composeState(memory, {
      userName,
      userId: userUuid,
      roomId: roomUuid,
    });

    // Compose context string for generation
    const context = composeContext({
      state,
      template: runtime.character.templates?.messageHandlerTemplate || 
        "{{recentMessages}}\n\n{{userMessage}}\n\nRespond naturally and helpfully.",
    });

    // Generate response using ElizaOS
    const responseContent: Content = await generateMessageResponse({
      runtime,
      context,
      modelClass: ModelClass.SMALL,
    });

    const responseText = responseContent.text;
    elizaLogger.info(`Generated response: ${responseText}`);

    // Create memory for the agent's response if we got one
    if (responseText && responseText.trim()) {
      const responseMemory: Memory = {
        id: stringToUuid(uuidv4()),
        userId: runtime.agentId,
        agentId: runtime.agentId,
        roomId: roomUuid,
        content: {
          text: responseText,
          source: "openchat",
          inReplyTo: memory.id,
        },
        createdAt: Date.now(),
      };

      await runtime.messageManager.createMemory(responseMemory);
      
      return responseText;
    }

    return "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    elizaLogger.error("Error processing message with Eliza:", error);
    return "I apologize, but I encountered an error processing your message. Please try again.";
  }
}

/**
 * Cleanup function to properly shut down the runtime
 */
export async function shutdownElizaRuntime(): Promise<void> {
  if (agentRuntime) {
    elizaLogger.info("Shutting down ElizaOS runtime...");
    // Add any cleanup logic here if needed
    agentRuntime = null;
  }
}
