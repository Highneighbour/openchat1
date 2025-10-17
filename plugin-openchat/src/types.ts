import { BotClient, BotClientFactory, Message, MessageEvent, TextContent, ImageContent } from "@open-ic/openchat-botclient-ts";
import { Request } from "express";

/**
 * Environment configuration for OpenChat plugin
 */
export interface OpenChatConfig {
    /** OpenChat public key for JWT verification */
    openchatPublicKey: string;
    /** Internet Computer host URL */
    icHost: string;
    /** Bot's private key for identity */
    identityPrivateKey: string;
    /** OpenStorage canister ID */
    openStorageCanisterId: string;
    /** Port for the bot server */
    port?: number;
}

/**
 * Extended Express Request with BotClient
 */
export interface WithBotClient extends Request {
    botClient: BotClient;
}

/**
 * Message content types that can be moderated
 */
export type ModeratableContent = MessageEvent<TextContent> | MessageEvent<ImageContent>;

/**
 * OpenChat message context for Eliza
 */
export interface OpenChatMessageContext {
    /** The bot client instance */
    botClient: BotClient;
    /** Original message event */
    event?: MessageEvent<any>;
    /** Chat/Group ID where message was sent */
    chatId?: string;
    /** User ID who sent the message */
    userId?: string;
    /** Thread root message ID if in a thread */
    threadRootMessageId?: bigint;
}

/**
 * OpenChat action parameters
 */
export interface OpenChatActionParams {
    /** Text content to send */
    text?: string;
    /** Message ID to react to */
    messageId?: bigint;
    /** Reaction emoji */
    reaction?: string;
    /** Message ID to delete */
    deleteMessageId?: bigint;
    /** Chat ID for operations */
    chatId?: string;
}

/**
 * OpenChat bot state
 */
export interface OpenChatBotState {
    /** Bot client factory */
    factory: BotClientFactory;
    /** Active bot clients mapped by request/session */
    activeClients: Map<string, BotClient>;
    /** Express app instance */
    app?: any;
    /** Server instance */
    server?: any;
}

/**
 * Message for sending to OpenChat
 */
export interface OutgoingOpenChatMessage {
    text: string;
    messageId?: bigint;
    finalised?: boolean;
}
