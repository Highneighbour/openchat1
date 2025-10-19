import type { Plugin } from '@elizaos/core';
import { OpenChatService } from './services/openchat.service.js';
import { sendMessageAction, reactToMessageAction } from './actions/index.js';
import { chatContextProvider, messageHistoryProvider } from './providers/index.js';

/**
 * OpenChat Plugin for ElizaOS
 * 
 * This plugin enables ElizaOS agents to interact with OpenChat (oc.app),
 * functioning both as an OpenChat bot and as an ElizaOS plugin.
 * 
 * Features:
 * - Receive and respond to messages from OpenChat
 * - Execute commands triggered by users
 * - Send messages to OpenChat channels/groups
 * - React to messages
 * - Provide chat context and message history
 * - Full integration with ElizaOS runtime
 * 
 * Configuration:
 * Required environment variables:
 * - OPENCHAT_PUBLIC_KEY: OpenChat public key for JWT verification
 * - OPENCHAT_IC_HOST: Internet Computer host URL
 * - OPENCHAT_IDENTITY_PRIVATE_KEY: Bot identity private key (PEM format)
 * - OPENCHAT_STORAGE_INDEX_CANISTER: OpenStorage canister ID
 * - OPENCHAT_BOT_PORT: (Optional) Port for bot server (default: 3000)
 */
export const openChatPlugin: Plugin = {
    name: 'openchat',
    description: 'OpenChat integration plugin for ElizaOS - enables agents to interact with OpenChat (oc.app)',
    
    // Actions that agents can perform
    actions: [
        sendMessageAction,
        reactToMessageAction,
    ],
    
    // Providers for context and data
    providers: [
        chatContextProvider,
        messageHistoryProvider,
    ],
    
    // Services
    services: [OpenChatService as any],
    
    // Evaluators (can be added for message quality, sentiment, etc.)
    evaluators: [],
    
    // Plugin configuration
    config: {
        OPENCHAT_PUBLIC_KEY: process.env.OPENCHAT_PUBLIC_KEY || '',
        OPENCHAT_IC_HOST: process.env.OPENCHAT_IC_HOST || 'https://ic0.app',
        OPENCHAT_IDENTITY_PRIVATE_KEY: process.env.OPENCHAT_IDENTITY_PRIVATE_KEY || '',
        OPENCHAT_STORAGE_INDEX_CANISTER: process.env.OPENCHAT_STORAGE_INDEX_CANISTER || '',
        OPENCHAT_BOT_PORT: process.env.OPENCHAT_BOT_PORT || '3000',
    },
};

// Export types
export * from './types/index.js';

// Export service for direct access if needed
export { OpenChatService } from './services/openchat.service.js';

// Export actions
export * from './actions/index.js';

// Export providers
export * from './providers/index.js';

// Default export
export default openChatPlugin;
