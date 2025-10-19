import type { BotClient } from "@open-ic/openchat-botclient-ts";
import type { Request } from "express";

/**
 * Extended Express Request with BotClient
 */
export interface WithBotClient extends Request {
    botClient: BotClient;
}

/**
 * OpenChat Environment Configuration
 */
export interface OpenChatConfig {
    openchatPublicKey: string;
    icHost: string;
    identityPrivateKey: string;
    openStorageCanisterId: string;
    port?: number;
}

/**
 * OpenChat Message Context
 */
export interface OpenChatMessageContext {
    chatId: string;
    messageId: bigint;
    userId: string;
    userName?: string;
    isThread: boolean;
    threadRootMessageId?: number | null;
    channelId?: bigint;
    communityId?: string;
    timestamp: number;
}

/**
 * OpenChat Action Result
 */
export interface OpenChatActionResult {
    success: boolean;
    message?: string;
    data?: any;
    error?: string;
}

/**
 * OpenChat Member Info
 */
export interface OpenChatMember {
    userId: string;
    username?: string;
    displayName?: string;
    role?: string;
    isBot: boolean;
}

/**
 * OpenChat Chat Summary
 */
export interface OpenChatChatSummary {
    chatId: string;
    name?: string;
    description?: string;
    memberCount: number;
    isPublic: boolean;
    latestMessage?: {
        content: string;
        sender: string;
        timestamp: number;
    };
}

/**
 * OpenChat Reaction
 */
export interface OpenChatReaction {
    messageId: bigint;
    reaction: string;
    userId: string;
}

/**
 * OpenChat Poll
 */
export interface OpenChatPoll {
    question: string;
    options: string[];
    allowMultipleVotes?: boolean;
    endDate?: Date;
}

/**
 * OpenChat File Upload
 */
export interface OpenChatFile {
    name: string;
    data: Uint8Array;
    mimeType: string;
    size: number;
}

/**
 * OpenChat Image Upload
 */
export interface OpenChatImage {
    data: Uint8Array;
    mimeType: string;
    width: number;
    height: number;
}

/**
 * Plugin State for storing runtime data
 */
export interface OpenChatPluginState {
    isRunning: boolean;
    botClients: Map<string, BotClient>;
    lastMessageTimestamp: number;
    activeChats: Set<string>;
}

export type OpenChatEventType = 
    | "message"
    | "reaction"
    | "member_joined"
    | "member_left"
    | "poll_created"
    | "poll_voted";

export interface OpenChatEvent {
    type: OpenChatEventType;
    chatId: string;
    timestamp: number;
    data: any;
}
