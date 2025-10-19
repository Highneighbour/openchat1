import type { Plugin, IAgentRuntime } from "@eliza/core";
import { OpenChatClient } from "./client";
import { OpenChatBotServer } from "./bot-server";
import { actions } from "./actions/index";
import { openChatProvider, openChatUserProvider } from "./providers/index";
import { evaluators } from "./evaluators/index";
import type { OpenChatConfig } from "./types/index";

/**
 * OpenChat Plugin for ElizaOS
 * Enables AI agents to interact with OpenChat (oc.app)
 * 
 * Features:
 * - Send and receive messages on OpenChat
 * - Add reactions to messages
 * - Create polls
 * - Delete messages
 * - Get chat and user information
 * - Autonomous message handling
 * - Full ElizaOS integration
 * 
 * @example
 * ```typescript
 * import { openChatPlugin } from "@eliza/plugin-openchat";
 * 
 * const character = {
 *   name: "MyAgent",
 *   plugins: [openChatPlugin],
 *   // ... other character config
 * };
 * ```
 */
export const openChatPlugin: Plugin = {
    name: "openchat",
    description: "OpenChat integration plugin for ElizaOS - enables AI agents to interact with OpenChat (oc.app)",
    
    actions: actions,
    providers: [openChatProvider, openChatUserProvider],
    evaluators: evaluators,
    
    /**
     * Initialize the plugin
     */
    init: async (runtime: IAgentRuntime): Promise<void> => {
        try {
            runtime.logger?.info("Initializing OpenChat plugin...");

            // Get configuration from environment
            const config: OpenChatConfig = {
                openchatPublicKey: process.env.OC_PUBLIC || "",
                icHost: process.env.IC_HOST || "https://icp-api.io",
                identityPrivateKey: process.env.IDENTITY_PRIVATE || "",
                openStorageCanisterId: process.env.STORAGE_INDEX_CANISTER || "",
                port: parseInt(process.env.OPENCHAT_BOT_PORT || "3000"),
            };

            // Validate configuration
            if (!config.openchatPublicKey || !config.identityPrivateKey || !config.openStorageCanisterId) {
                throw new Error(
                    "OpenChat plugin requires OC_PUBLIC, IDENTITY_PRIVATE, and STORAGE_INDEX_CANISTER environment variables"
                );
            }

            // Create OpenChat client
            const openChatClient = new OpenChatClient(runtime, config);

            // Add client to runtime
            if (!runtime.clients) {
                runtime.clients = [];
            }
            runtime.clients.push(openChatClient as any);

            // Start bot server
            const botServer = new OpenChatBotServer(runtime, openChatClient, config);
            botServer.start();

            if (runtime.logger?.success) {
                runtime.logger.success("OpenChat plugin initialized successfully");
            } else {
                console.log("OpenChat plugin initialized successfully");
            }
        } catch (error) {
            runtime.logger?.error("Failed to initialize OpenChat plugin", error);
            throw error;
        }
    },
};

// Export everything for individual imports
export * from "./client";
export * from "./bot-server";
export * from "./actions/index";
export * from "./providers/index";
export * from "./evaluators/index";
export * from "./types/index";

// Default export
export default openChatPlugin;
