import type { Content, EntityPayload, MessagePayload, WorldPayload } from '@elizaos/core';
import type { BotClient, MessageEvent as OpenChatMessageEvent, TextContent, ImageContent } from '@open-ic/openchat-botclient-ts';

/**
 * OpenChat-specific content extension
 */
export interface OpenChatContent extends Content {
    /** OpenChat message ID */
    messageId?: bigint;
    /** OpenChat chat ID */
    chatId?: string;
    /** OpenChat user principal */
    userPrincipal?: string;
    /** Whether message is finalized */
    finalized?: boolean;
}

/**
 * OpenChat-specific event types
 */
export enum OpenChatEventTypes {
    WORLD_JOINED = "OPENCHAT_WORLD_JOINED",
    WORLD_CONNECTED = "OPENCHAT_WORLD_CONNECTED",
    WORLD_LEFT = "OPENCHAT_WORLD_LEFT",
    ENTITY_JOINED = "OPENCHAT_ENTITY_JOINED",
    ENTITY_LEFT = "OPENCHAT_ENTITY_LEFT",
    MESSAGE_RECEIVED = "OPENCHAT_MESSAGE_RECEIVED",
    MESSAGE_SENT = "OPENCHAT_MESSAGE_SENT",
    COMMAND_EXECUTED = "OPENCHAT_COMMAND_EXECUTED",
    BOT_INSTALLED = "OPENCHAT_BOT_INSTALLED",
    BOT_UNINSTALLED = "OPENCHAT_BOT_UNINSTALLED"
}

/**
 * OpenChat-specific event payload map
 */
export interface OpenChatEventPayloadMap {
    [OpenChatEventTypes.MESSAGE_RECEIVED]: OpenChatMessageReceivedPayload;
    [OpenChatEventTypes.MESSAGE_SENT]: OpenChatMessageSentPayload;
    [OpenChatEventTypes.COMMAND_EXECUTED]: OpenChatCommandPayload;
    [OpenChatEventTypes.WORLD_JOINED]: OpenChatWorldPayload;
    [OpenChatEventTypes.WORLD_CONNECTED]: OpenChatWorldPayload;
    [OpenChatEventTypes.WORLD_LEFT]: OpenChatWorldPayload;
    [OpenChatEventTypes.ENTITY_JOINED]: OpenChatEntityPayload;
    [OpenChatEventTypes.ENTITY_LEFT]: OpenChatEntityPayload;
    [OpenChatEventTypes.BOT_INSTALLED]: OpenChatInstallPayload;
    [OpenChatEventTypes.BOT_UNINSTALLED]: OpenChatInstallPayload;
}

/**
 * OpenChat-specific message received payload
 */
export interface OpenChatMessageReceivedPayload extends MessagePayload {
    /** The OpenChat bot client */
    botClient: BotClient;
    /** The original OpenChat message event */
    originalMessage: OpenChatMessageEvent<TextContent>;
}

/**
 * OpenChat-specific message sent payload
 */
export interface OpenChatMessageSentPayload extends MessagePayload {
    /** The chat ID where the message was sent */
    chatId: string;
    /** The message ID */
    messageId: bigint;
}

/**
 * OpenChat-specific command payload
 */
export interface OpenChatCommandPayload {
    /** The bot client */
    botClient: BotClient;
    /** Command name */
    commandName: string;
    /** Command arguments */
    args: Record<string, any>;
}

/**
 * OpenChat-specific world payload
 */
export interface OpenChatWorldPayload extends WorldPayload {
    chatId: string;
    chatName?: string;
    chatType: 'direct' | 'group' | 'channel' | 'community';
}

/**
 * OpenChat-specific entity payload
 */
export interface OpenChatEntityPayload extends EntityPayload {
    openChatUser: {
        principal: string;
        username?: string;
        displayName?: string;
    };
}

/**
 * OpenChat-specific installation payload
 */
export interface OpenChatInstallPayload {
    chatId: string;
    chatType: 'direct' | 'group' | 'channel' | 'community';
    permissions: string[];
}

/**
 * OpenChat bot configuration
 */
export interface OpenChatConfig {
    openchatPublicKey: string;
    icHost: string;
    identityPrivateKey: string;
    openStorageCanisterId: string;
    botPort?: number;
}

/**
 * Type for moderatable content (text or image)
 */
export type ModeratableContent = OpenChatMessageEvent<TextContent> | OpenChatMessageEvent<ImageContent>;
