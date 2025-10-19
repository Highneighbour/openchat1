import { z } from 'zod';
import { BotClientFactory, ChatActionScope, ChatIdentifier } from '@open-ic/openchat-botclient-ts';
import express from 'express';
import cors from 'cors';

// Define types locally since we don't have @elizaos/core available
interface Action {
  name: string;
  similes: string[];
  description: string;
  validate: (runtime: any, message: Memory, state?: any) => Promise<boolean>;
  handler: (runtime: any, message: Memory, state?: any, options?: any, callback?: HandlerCallback, responses?: Memory[]) => Promise<ActionResult>;
  examples: any[][];
}

interface ActionResult {
  text?: string;
  success: boolean;
  error?: Error;
  data?: any;
}

interface HandlerCallback {
  (params: { text: string; actions: string[]; source: string }): Promise<void>;
}

interface Memory {
  id: string;
  userId: string;
  agentId: string;
  roomId: string;
  content: {
    text: string;
    source: string;
  };
  createdAt: Date;
  tokenCount: number;
}

interface Plugin {
  name: string;
  description: string;
  config: Record<string, any>;
  init: (config: Record<string, string>) => Promise<void>;
  models?: Record<string, any>;
  routes?: any[];
  events?: Record<string, any[]>;
  services?: any[];
  actions?: Action[];
  providers?: Provider[];
}

interface Provider {
  name: string;
  description: string;
  get: (runtime: any, message: Memory, state?: any) => Promise<ProviderResult>;
}

interface ProviderResult {
  text: string;
  values: Record<string, any>;
  data: Record<string, any>;
}

// Mock logger
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => console.log(`[DEBUG] ${message}`, ...args),
  error: (obj: any, message: string) => console.error(`[ERROR] ${message}`, obj),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
};

// Mock ModelType
const ModelType = {
  TEXT_SMALL: 'TEXT_SMALL',
  TEXT_LARGE: 'TEXT_LARGE',
};

/**
 * Configuration schema for the OpenChat plugin
 */
const configSchema = z.object({
  OC_PUBLIC: z.string().min(1, 'OpenChat public key is required'),
  IC_HOST: z.string().min(1, 'IC host is required'),
  IDENTITY_PRIVATE: z.string().min(1, 'Identity private key is required'),
  STORAGE_INDEX_CANISTER: z.string().min(1, 'Storage index canister ID is required'),
  BOT_SERVER_URL: z.string().url('Bot server URL must be a valid URL').optional(),
});

/**
 * OpenChat Bot Client Factory instance
 */
let botFactory: BotClientFactory | null = null;

/**
 * Express app for handling OpenChat webhooks
 */
let expressApp: express.Application | null = null;

/**
 * Action to send a message to OpenChat
 */
const sendMessageAction: Action = {
  name: 'SEND_OPENCHAT_MESSAGE',
  similes: ['SEND_MESSAGE', 'REPLY_TO_MESSAGE', 'OPENCHAT_SEND'],
  description: 'Sends a message to an OpenChat conversation',

  validate: async (
    _runtime: any,
    message: Memory,
    _state: any
  ): Promise<boolean> => {
    // Validate that we have the necessary data
    return !!(message.content.text && message.content.source);
  },

  handler: async (
    runtime: any,
    message: Memory,
    _state: any,
    _options: any,
    callback?: HandlerCallback,
    _responses?: Memory[]
  ): Promise<ActionResult> => {
    try {
      if (!botFactory) {
        throw new Error('OpenChat bot factory not initialized');
      }

      // Extract chat ID and message content
      const chatId = message.content.source;
      const messageText = message.content.text;

      if (!chatId || !messageText) {
        throw new Error('Missing chat ID or message text');
      }

      // Create a bot client for this specific chat
      const chatIdentifier = ChatIdentifier.fromJson({ groupId: chatId, kind: "group_chat" });
      const botClient = botFactory.createClientInAutonomouseContext(
        new ChatActionScope(chatIdentifier),
        process.env.IC_HOST!
      );

      // Send the message
      await botClient.createTextMessage(messageText);

      const response = `Message sent to OpenChat chat ${chatId}: ${messageText}`;

      if (callback) {
        await callback({
          text: response,
          actions: ['SEND_OPENCHAT_MESSAGE'],
          source: message.content.source,
        });
      }

      return {
        text: response,
        success: true,
        data: {
          actions: ['SEND_OPENCHAT_MESSAGE'],
          source: message.content.source,
          chatId,
        },
      };
    } catch (error) {
      logger.error({ error }, 'Error in sendMessageAction:');
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: '{{userName}}',
        content: {
          text: 'Send a message to OpenChat saying hello',
          actions: [],
        },
      },
      {
        name: '{{agentName}}',
        content: {
          text: 'Message sent to OpenChat chat: hello',
          actions: ['SEND_OPENCHAT_MESSAGE'],
        },
      },
    ],
  ],
};

/**
 * Action to react to a message in OpenChat
 */
const reactToMessageAction: Action = {
  name: 'REACT_TO_OPENCHAT_MESSAGE',
  similes: ['REACT_TO_MESSAGE', 'OPENCHAT_REACT', 'ADD_REACTION'],
  description: 'Reacts to a message in OpenChat with an emoji',

  validate: async (
    _runtime: any,
    message: Memory,
    _state: any
  ): Promise<boolean> => {
    return !!(message.content.text && message.content.source);
  },

  handler: async (
    runtime: any,
    message: Memory,
    _state: any,
    _options: any,
    callback?: HandlerCallback,
    _responses?: Memory[]
  ): Promise<ActionResult> => {
    try {
      if (!botFactory) {
        throw new Error('OpenChat bot factory not initialized');
      }

      // Extract reaction data from message content
      const reactionData = JSON.parse(message.content.text);
      const { chatId, messageId, reaction } = reactionData;

      if (!chatId || !messageId || !reaction) {
        throw new Error('Missing chat ID, message ID, or reaction');
      }

      const chatIdentifier = ChatIdentifier.fromJson({ groupId: chatId, kind: "group_chat" });
      const botClient = botFactory.createClientInAutonomouseContext(
        new ChatActionScope(chatIdentifier),
        process.env.IC_HOST!
      );

      // Add reaction to the message
      await botClient.addReaction(messageId, reaction);

      const response = `Reacted with ${reaction} to message ${messageId} in chat ${chatId}`;

      if (callback) {
        await callback({
          text: response,
          actions: ['REACT_TO_OPENCHAT_MESSAGE'],
          source: message.content.source,
        });
      }

      return {
        text: response,
        success: true,
        data: {
          actions: ['REACT_TO_OPENCHAT_MESSAGE'],
          source: message.content.source,
          chatId,
          messageId,
          reaction,
        },
      };
    } catch (error) {
      logger.error({ error }, 'Error in reactToMessageAction:');
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: '{{userName}}',
        content: {
          text: 'React to the last message with a thumbs up',
          actions: [],
        },
      },
      {
        name: '{{agentName}}',
        content: {
          text: 'Reacted with 👍 to message in OpenChat',
          actions: ['REACT_TO_OPENCHAT_MESSAGE'],
        },
      },
    ],
  ],
};

/**
 * Action to read messages from OpenChat
 */
const readMessagesAction: Action = {
  name: 'READ_OPENCHAT_MESSAGES',
  similes: ['READ_MESSAGES', 'GET_MESSAGES', 'OPENCHAT_READ'],
  description: 'Reads recent messages from an OpenChat conversation',

  validate: async (
    _runtime: any,
    message: Memory,
    _state: any
  ): Promise<boolean> => {
    return !!(message.content.source);
  },

  handler: async (
    runtime: any,
    message: Memory,
    _state: any,
    _options: any,
    callback?: HandlerCallback,
    _responses?: Memory[]
  ): Promise<ActionResult> => {
    try {
      if (!botFactory) {
        throw new Error('OpenChat bot factory not initialized');
      }

      const chatId = message.content.source;
      if (!chatId) {
        throw new Error('Missing chat ID');
      }

      const chatIdentifier = ChatIdentifier.fromJson({ groupId: chatId, kind: "group_chat" });
      const botClient = botFactory.createClientInAutonomouseContext(
        new ChatActionScope(chatIdentifier),
        process.env.IC_HOST!
      );

      // Read recent messages using chat events
      const chatSummary = await botClient.chatSummary();
      let messages: any[] = [];
      
      if (chatSummary.kind !== "error") {
        const resp = await botClient.chatEvents({
          kind: "chat_events_page",
          ascending: false,
          startEventIndex: chatSummary.latestEventIndex,
          maxEvents: 10,
          maxMessages: 10,
        });
        
        if (resp.kind === "success") {
          messages = resp.events.map(ev => ({
            messageId: ev.index,
            content: ev.event.kind === "message" && ev.event.content.kind === "text_content" 
              ? { text: ev.event.content.text } 
              : { text: "" },
            sender: ev.event.kind === "message" ? ev.event.sender : "",
            timestamp: ev.timestamp
          }));
        }
      }

      const response = `Read ${messages.length} messages from OpenChat chat ${chatId}`;

      if (callback) {
        await callback({
          text: response,
          actions: ['READ_OPENCHAT_MESSAGES'],
          source: message.content.source,
        });
      }

      return {
        text: response,
        success: true,
        data: {
          actions: ['READ_OPENCHAT_MESSAGES'],
          source: message.content.source,
          chatId,
          messageCount: messages.length,
          messages: messages.map((msg: any) => ({
            id: msg.messageId,
            text: msg.content.text,
            sender: msg.sender,
            timestamp: msg.timestamp
          }))
        },
      };
    } catch (error) {
      logger.error({ error }, 'Error in readMessagesAction:');
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: '{{userName}}',
        content: {
          text: 'Read the recent messages from OpenChat',
          actions: [],
        },
      },
      {
        name: '{{agentName}}',
        content: {
          text: 'Read 5 messages from OpenChat chat',
          actions: ['READ_OPENCHAT_MESSAGES'],
        },
      },
    ],
  ],
};

/**
 * Provider for OpenChat chat information
 */
const openChatProvider: Provider = {
  name: 'OPENCHAT_PROVIDER',
  description: 'Provides information about OpenChat chats and messages',

  get: async (
    _runtime: any,
    message: Memory,
    _state: any
  ): Promise<ProviderResult> => {
    try {
      if (!botFactory) {
        return {
          text: 'OpenChat provider not available',
          values: {},
          data: {},
        };
      }

      const chatId = message.content.source;
      if (!chatId) {
        return {
          text: 'No chat ID provided',
          values: {},
          data: {},
        };
      }

      const chatIdentifier = ChatIdentifier.fromJson({ groupId: chatId, kind: "group_chat" });
      const botClient = botFactory.createClientInAutonomouseContext(
        new ChatActionScope(chatIdentifier),
        process.env.IC_HOST!
      );

      // Get chat summary
      const chatSummary = await botClient.chatSummary();
      let messages: any[] = [];
      
      if (chatSummary.kind !== "error") {
        const resp = await botClient.chatEvents({
          kind: "chat_events_page",
          ascending: false,
          startEventIndex: chatSummary.latestEventIndex,
          maxEvents: 5,
          maxMessages: 5,
        });
        
        if (resp.kind === "success") {
          messages = resp.events.map(ev => ({
            messageId: ev.index,
            content: ev.event.kind === "message" && ev.event.content.kind === "text_content" 
              ? { text: ev.event.content.text } 
              : { text: "" },
            sender: ev.event.kind === "message" ? ev.event.sender : "",
            timestamp: ev.timestamp
          }));
        }
      }

      const isGroupChat = chatSummary.kind !== "error" && chatSummary.kind === "group_chat";
      
      return {
        text: `OpenChat chat: ${chatSummary.kind !== "error" ? (isGroupChat ? chatSummary.name : 'Direct Chat') : 'Unknown'}`,
        values: {
          chatId,
          title: chatSummary.kind !== "error" ? (isGroupChat ? chatSummary.name : 'Direct Chat') : 'Unknown',
          description: chatSummary.kind !== "error" && isGroupChat ? chatSummary.description : '',
          memberCount: chatSummary.kind !== "error" && isGroupChat ? (chatSummary as any).participantCount || 2 : 2,
          lastActivity: chatSummary.kind !== "error" ? chatSummary.lastUpdated : 0,
          recentMessages: messages.length
        },
        data: {
          chatSummary,
          recentMessages: messages
        },
      };
    } catch (error) {
      logger.error({ error }, 'Error in openChatProvider:');
      return {
        text: 'Error retrieving OpenChat information',
        values: {},
        data: { error: error instanceof Error ? error.message : String(error) },
      };
    }
  },
};

/**
 * Base Service class
 */
abstract class Service {
  static serviceType: string;
  capabilityDescription!: string;
  protected runtime: any;

  constructor(runtime: any) {
    this.runtime = runtime;
  }

  abstract stop(): void;
}

/**
 * OpenChat Service for managing bot connections
 */
export class OpenChatService extends Service {
  static serviceType = 'openchat';
  capabilityDescription = 'Manages OpenChat bot connections and handles incoming messages';

  constructor(protected runtime: any) {
    super(runtime);
  }

  static async start(runtime: any) {
    logger.info('Starting OpenChat service');
    const service = new OpenChatService(runtime);
    
    // Initialize the bot factory
    const config = runtime.getConfig ? runtime.getConfig() : {};
    botFactory = new BotClientFactory({
      openchatPublicKey: config.OC_PUBLIC || process.env.OC_PUBLIC,
      icHost: config.IC_HOST || process.env.IC_HOST,
      identityPrivateKey: config.IDENTITY_PRIVATE || process.env.IDENTITY_PRIVATE,
      openStorageCanisterId: config.STORAGE_INDEX_CANISTER || process.env.STORAGE_INDEX_CANISTER,
    });

    // Start the Express server for webhooks
    await service.startWebhookServer();

    return service;
  }

  static async stop(runtime: any) {
    logger.info('Stopping OpenChat service');
    const service = runtime.getService ? runtime.getService(OpenChatService.serviceType) : null;
    if (!service) {
      throw new Error('OpenChat service not found');
    }
    service.stop();
  }

  async startWebhookServer() {
    if (expressApp) {
      return; // Already started
    }

    expressApp = express();
    expressApp.use(cors());
    expressApp.use(express.json());
    expressApp.use(express.text());

    // Bot definition endpoint
    expressApp.get('/bot_definition', (req, res) => {
      res.json({
        description: "ElizaOS Agent Bot for OpenChat",
        autonomous_config: {
          permissions: {
            chat: ["ReactToMessages", "ReadMessages", "ReadChatSummary", "SendMessages"],
            community: [],
            message: ["Text"],
          },
        },
        default_subscriptions: {
          community: [],
          chat: ["Message"],
        },
        commands: [
          {
            name: "chat",
            default_role: "Participant",
            description: "Chat with the ElizaOS agent",
            permissions: {
              chat: ["ReadChatSummary", "SendMessages"],
              message: ["Text"],
              community: [],
            },
            direct_messages: true,
            params: [
              {
                name: "message",
                required: true,
                description: "Message to send to the agent",
                placeholder: "Hello! How can I help you?",
                param_type: {
                  StringParam: {
                    min_length: 1,
                    max_length: 1000,
                    choices: [],
                    multi_line: true,
                  },
                },
              },
            ],
          },
        ],
      });
    });

    // Command execution endpoint
    expressApp.post('/execute_command', async (req, res) => {
      try {
        const token = req.headers['x-oc-jwt'] as string;
        if (!token) {
          return res.status(400).send('Missing JWT token');
        }

        if (!botFactory) {
          return res.status(500).send('Bot factory not initialized');
        }

        const botClient = botFactory.createClientFromCommandJwt(token);
        const commandName = botClient.commandName;

        if (commandName === 'chat') {
          const message = botClient.stringArg('message');
          if (!message) {
            return res.status(400).send('Missing message parameter');
          }

          // Create a placeholder response
          const placeholder = await botClient.createTextMessage('Thinking...');
          placeholder.setFinalised(false);
          res.status(200).json({ message: placeholder.toResponse() });

          // Process the message with the agent
          try {
            // Create a memory object for the agent
            const memory: Memory = {
              id: `openchat_${Date.now()}`,
              userId: (botClient as any).userId || 'unknown',
              agentId: this.runtime.character?.name || 'ElizaOS Agent',
              roomId: String((botClient as any).chatId || 'unknown'),
              content: {
                text: message,
                source: String((botClient as any).chatId || 'unknown'),
              },
              createdAt: new Date(),
              tokenCount: message.length,
            };

            // Simple response generation (replace with actual agent processing)
            const response = `I received your message: "${message}". This is a placeholder response from the ElizaOS OpenChat plugin.`;

            // Send the response back to OpenChat
            await botClient.createTextMessage(response);

          } catch (error) {
            logger.error({ error }, 'Error processing message:');
            await botClient.createTextMessage('I encountered an error while processing your message.');
          }
        } else {
          res.status(400).send('Unknown command');
        }
      } catch (error) {
        logger.error({ error }, 'Error in command execution:');
        res.status(500).send('Internal server error');
      }
    });

    // Notification endpoint for events
    expressApp.post('/notify', async (req, res) => {
      try {
        // Handle OpenChat events here
        logger.debug('Received OpenChat notification');
        res.status(200).send('OK');
      } catch (error) {
        logger.error({ error }, 'Error handling notification:');
        res.status(500).send('Error');
      }
    });

    const port = process.env.PORT || 3000;
    expressApp.listen(port, () => {
      logger.info(`OpenChat webhook server running on port ${port}`);
    });
  }

  async stop() {
    logger.info('Stopping OpenChat service');
    if (expressApp) {
      // Close the Express server
      expressApp = null;
    }
  }
}

/**
 * Main OpenChat plugin
 */
export const openChatPlugin: Plugin = {
  name: 'plugin-openchat',
  description: 'ElizaOS plugin for OpenChat integration',
  config: {
    OC_PUBLIC: process.env.OC_PUBLIC,
    IC_HOST: process.env.IC_HOST,
    IDENTITY_PRIVATE: process.env.IDENTITY_PRIVATE,
    STORAGE_INDEX_CANISTER: process.env.STORAGE_INDEX_CANISTER,
    BOT_SERVER_URL: process.env.BOT_SERVER_URL,
  },

  async init(config: Record<string, string>) {
    logger.debug('Initializing OpenChat plugin');
    try {
      const validatedConfig = await configSchema.parseAsync(config);

      // Set environment variables
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value) process.env[key] = value;
      }

      logger.info('OpenChat plugin initialized successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues?.map((e) => e.message)?.join(', ') || 'Unknown validation error';
        throw new Error(`Invalid OpenChat plugin configuration: ${errorMessages}`);
      }
      throw new Error(
        `Invalid OpenChat plugin configuration: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  models: {
    [ModelType.TEXT_SMALL]: async (
      _runtime: any,
      { prompt, stopSequences = [] }: any
    ) => {
      // Simple text generation for small models
      return `OpenChat response: ${prompt}`;
    },
    [ModelType.TEXT_LARGE]: async (
      _runtime: any,
      {
        prompt,
        stopSequences = [],
        maxTokens = 8192,
        temperature = 0.7,
        frequencyPenalty = 0.7,
        presencePenalty = 0.7,
      }: any
    ) => {
      // Enhanced text generation for large models
      return `Enhanced OpenChat response: ${prompt}`;
    },
  },

  routes: [
    {
      name: 'openchat-status',
      path: '/openchat/status',
      type: 'GET',
      handler: async (_req: any, res: any) => {
        res.json({
          status: 'active',
          service: 'OpenChat Plugin',
          timestamp: new Date().toISOString(),
          botFactory: !!botFactory,
          expressApp: !!expressApp,
        });
      },
    },
    {
      name: 'openchat-chats',
      path: '/openchat/chats',
      type: 'GET',
      handler: async (_req: any, res: any) => {
        // Return available chats (placeholder implementation)
        res.json({
          chats: [],
          message: 'Chat list endpoint - implement based on your needs',
        });
      },
    },
  ],

  events: {
    MESSAGE_RECEIVED: [
      async (params: any) => {
        logger.debug('MESSAGE_RECEIVED event in OpenChat plugin');
        // Handle message received events
      },
    ],
    WORLD_CONNECTED: [
      async (params: any) => {
        logger.debug('WORLD_CONNECTED event in OpenChat plugin');
        // Handle world connection events
      },
    ],
  },

  services: [OpenChatService],
  actions: [sendMessageAction, reactToMessageAction, readMessagesAction],
  providers: [openChatProvider],
};

export default openChatPlugin;