import type { BotClient, BotClientFactory, MessageEvent, TextContent, ImageContent } from "@open-ic/openchat-botclient-ts";
import type { IAgentRuntime } from "@elizaos/core";

/**
 * OpenChat plugin configuration
 */
export interface OpenChatConfig {
  /** OpenChat public key for JWT verification */
  OPENCHAT_PUBLIC_KEY: string;
  /** Internet Computer host URL */
  IC_HOST: string;
  /** Bot identity private key (PEM format) */
  IDENTITY_PRIVATE_KEY: string;
  /** OpenStorage canister ID */
  STORAGE_INDEX_CANISTER: string;
  /** Port for the OpenChat bot server (default: 3000) */
  OPENCHAT_BOT_PORT?: number;
  /** Enable autonomous mode (default: false) */
  OPENCHAT_AUTONOMOUS?: boolean;
}

/**
 * OpenChat client wrapper for ElizaOS
 */
export interface OpenChatClientWrapper {
  factory: BotClientFactory;
  runtime: IAgentRuntime;
  activeClients: Map<string, BotClient>;
  installations: Map<string, InstallationInfo>;
}

/**
 * Installation information for tracking where the bot is installed
 */
export interface InstallationInfo {
  scope: string;
  permissions: string[];
  installedAt: Date;
  chatType: "Group" | "Channel" | "DirectChat" | "Community";
}

/**
 * OpenChat message context for ElizaOS
 */
export interface OpenChatMessageContext {
  chatId: string;
  messageId: string;
  senderId: string;
  senderName?: string;
  threadRoot?: string;
  chatType: "Group" | "Channel" | "DirectChat";
  timestamp: Date;
}

/**
 * Extended message event types
 */
export type ModeratableContent = MessageEvent<TextContent> | MessageEvent<ImageContent>;

/**
 * OpenChat command context
 */
export interface OpenChatCommandContext {
  commandName: string;
  args: Record<string, any>;
  botClient: BotClient;
  messageContext: OpenChatMessageContext;
}

/**
 * OpenChat event types for notifications
 */
export enum OpenChatEventType {
  INSTALLED = "Installed",
  UNINSTALLED = "Uninstalled",
  MESSAGE = "Message",
  MEMBER_JOINED = "MemberJoined",
  MEMBER_LEFT = "MemberLeft",
  CHAT_UPDATED = "ChatUpdated",
}

/**
 * OpenChat notification event
 */
export interface OpenChatNotificationEvent {
  type: OpenChatEventType;
  scope: string;
  data: any;
  timestamp: Date;
}

/**
 * OpenChat action result
 */
export interface OpenChatActionResult {
  success: boolean;
  messageId?: string;
  error?: string;
  data?: any;
}
