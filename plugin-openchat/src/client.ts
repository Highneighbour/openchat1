import {
    BotClientFactory,
    type BotClient,
} from "@open-ic/openchat-botclient-ts";
import type {
    IAgentRuntime,
    Memory,
    State,
} from "@eliza/core";
import type { OpenChatConfig, OpenChatMessageContext } from "./types/index";

/**
 * OpenChat Client - Manages the connection between Eliza and OpenChat
 */
export class OpenChatClient {
    private factory: BotClientFactory;
    private runtime: IAgentRuntime;
    private config: OpenChatConfig;
    private activeClients: Map<string, BotClient> = new Map();

    constructor(runtime: IAgentRuntime, config: OpenChatConfig) {
        this.runtime = runtime;
        this.config = config;
        
        this.factory = new BotClientFactory({
            openchatPublicKey: config.openchatPublicKey,
            icHost: config.icHost,
            identityPrivateKey: config.identityPrivateKey,
            openStorageCanisterId: config.openStorageCanisterId,
        });

        this.runtime.logger?.info("OpenChat client initialized");
    }

    /**
     * Create a bot client from JWT token
     */
    createClientFromJWT(token: string): BotClient {
        return this.factory.createClientFromCommandJwt(token);
    }

    /**
     * Store an active bot client for a specific context
     */
    setActiveClient(contextId: string, client: BotClient): void {
        this.activeClients.set(contextId, client);
    }

    /**
     * Get an active bot client for a specific context
     */
    getActiveClient(contextId: string): BotClient | undefined {
        return this.activeClients.get(contextId);
    }

    /**
     * Clear an active bot client
     */
    clearActiveClient(contextId: string): void {
        this.activeClients.delete(contextId);
    }

    /**
     * Send a message to OpenChat
     */
    async sendMessage(
        client: BotClient,
        content: string,
        context?: OpenChatMessageContext
    ): Promise<any> {
        try {
            const message = await client.createTextMessage(content);
            const response = await client.sendMessage(message);
            
            this.runtime.logger?.info("Message sent to OpenChat", {
                chatId: context?.chatId,
                messageLength: content.length,
            });

            return response;
        } catch (error) {
            this.runtime.logger?.error("Error sending message to OpenChat", error);
            throw error;
        }
    }

    /**
     * Add a reaction to a message
     */
    async addReaction(
        client: BotClient,
        messageId: bigint,
        reaction: string,
        thread?: number
    ): Promise<any> {
        try {
            const result = await client.addReaction(messageId, reaction, thread);
            this.runtime.logger?.info("Reaction added", { messageId, reaction });
            return result;
        } catch (error) {
            this.runtime.logger?.error("Error adding reaction", error);
            throw error;
        }
    }

    /**
     * Delete messages
     */
    async deleteMessages(
        client: BotClient,
        messageIds: bigint[],
        thread?: number
    ): Promise<any> {
        try {
            const result = await client.deleteMessages(messageIds, thread);
            this.runtime.logger?.info("Messages deleted", { count: messageIds.length });
            return result;
        } catch (error) {
            this.runtime.logger?.error("Error deleting messages", error);
            throw error;
        }
    }

    /**
     * Create a poll
     */
    async createPoll(
        client: BotClient,
        question: string,
        answers: string[]
    ): Promise<any> {
        try {
            const poll = await client.createPollMessage(question, answers);
            const response = await client.sendMessage(poll);
            this.runtime.logger?.info("Poll created", { question, answerCount: answers.length });
            return response;
        } catch (error) {
            this.runtime.logger?.error("Error creating poll", error);
            throw error;
        }
    }

    /**
     * Send an image
     */
    async sendImage(
        client: BotClient,
        imageData: Uint8Array,
        mimeType: string,
        width: number,
        height: number
    ): Promise<any> {
        try {
            const image = await client.createImageMessage(imageData, mimeType, width, height);
            const response = await client.sendMessage(image);
            this.runtime.logger?.info("Image sent", { mimeType, width, height });
            return response;
        } catch (error) {
            this.runtime.logger?.error("Error sending image", error);
            throw error;
        }
    }

    /**
     * Send a file
     */
    async sendFile(
        client: BotClient,
        name: string,
        data: Uint8Array,
        mimeType: string,
        fileSize: number
    ): Promise<any> {
        try {
            const file = await client.createFileMessage(name, data, mimeType, fileSize);
            const response = await client.sendMessage(file);
            this.runtime.logger?.info("File sent", { name, size: fileSize });
            return response;
        } catch (error) {
            this.runtime.logger?.error("Error sending file", error);
            throw error;
        }
    }

    /**
     * Get chat members
     */
    async getChatMembers(client: BotClient, channelId?: bigint): Promise<any> {
        try {
            const members = await client.members(["Admin", "Owner", "Member"], channelId);
            const count = (members as any).participants?.length || 0;
            this.runtime.logger?.info("Fetched chat members", { count });
            return members;
        } catch (error) {
            this.runtime.logger?.error("Error fetching chat members", error);
            throw error;
        }
    }

    /**
     * Get chat summary
     */
    async getChatSummary(client: BotClient, channelId?: bigint): Promise<any> {
        try {
            const summary = await client.chatSummary(channelId);
            this.runtime.logger?.info("Fetched chat summary");
            return summary;
        } catch (error) {
            this.runtime.logger?.error("Error fetching chat summary", error);
            throw error;
        }
    }

    /**
     * Convert OpenChat context to Eliza Memory
     */
    async contextToMemory(
        client: BotClient,
        content: string,
        context: OpenChatMessageContext
    ): Promise<Memory> {
        const memory: Memory = {
            id: `${context.chatId}-${context.messageId}`,
            userId: context.userId as any,
            agentId: this.runtime.agentId,
            roomId: context.chatId as any,
            content: {
                text: content,
                source: "openchat",
                metadata: {
                    messageId: context.messageId.toString(),
                    isThread: context.isThread,
                    threadRootMessageId: context.threadRootMessageId,
                    channelId: context.channelId?.toString(),
                    communityId: context.communityId,
                    timestamp: context.timestamp,
                },
            },
            createdAt: context.timestamp,
        };

        return memory;
    }

    /**
     * Extract message context from BotClient
     */
    extractContext(client: BotClient): OpenChatMessageContext {
        return {
            chatId: client.chatId?.toString() || "",
            messageId: client.messageId || BigInt(0),
            userId: client.initiator || "",
            isThread: client.threadRootMessageId !== undefined && client.threadRootMessageId !== null,
            threadRootMessageId: client.threadRootMessageId,
            channelId: client.channelId,
            communityId: client.communityId?.toString(),
            timestamp: Date.now(),
        };
    }

    /**
     * Get the factory instance
     */
    getFactory(): BotClientFactory {
        return this.factory;
    }

    /**
     * Get the runtime instance
     */
    getRuntime(): IAgentRuntime {
        return this.runtime;
    }
}
