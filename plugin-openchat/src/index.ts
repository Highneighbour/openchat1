/**
 * @elizaos/plugin-openchat
 * 
 * OpenChat plugin for Eliza OS - Enables AI agents to interact with OpenChat (oc.app)
 * 
 * This plugin provides:
 * - OpenChat bot client integration
 * - Message sending and receiving
 * - Actions for interacting with OpenChat (send, react, delete, get info)
 * - Providers for OpenChat context
 * 
 * @module plugin-openchat
 */

import type { Plugin } from "@elizaos/core";
import { OpenChatClient } from "./client";
import { openChatActions } from "./actions";
import { openChatProviders } from "./providers";

// Export types
export * from "./types";

// Export client
export { OpenChatClient } from "./client";

// Export actions
export * from "./actions";

// Export providers
export * from "./providers";

// Export environment utilities
export * from "./environment";

/**
 * OpenChat Plugin for Eliza OS
 * 
 * Usage:
 * ```typescript
 * import { openChatPlugin } from "@elizaos/plugin-openchat";
 * 
 * const character = {
 *   // ... character config
 *   plugins: [openChatPlugin],
 *   clients: ["openchat"],
 *   settings: {
 *     OPENCHAT_PUBLIC_KEY: "your_public_key",
 *     OPENCHAT_IC_HOST: "https://icp0.io",
 *     OPENCHAT_IDENTITY_PRIVATE_KEY: "your_private_key",
 *     OPENCHAT_STORAGE_CANISTER_ID: "your_canister_id",
 *   }
 * };
 * ```
 */
export const openChatPlugin: Plugin = {
    name: "openchat",
    description: "OpenChat integration plugin for Eliza OS - enables AI agents to interact with OpenChat (oc.app)",
    actions: openChatActions,
    providers: openChatProviders,
    evaluators: [],
    services: [],
};

export default openChatPlugin;
