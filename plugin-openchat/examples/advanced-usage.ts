/**
 * Advanced Usage Example for OpenChat Plugin
 * 
 * This example shows advanced features like custom actions and providers
 */

import { 
    Character, 
    ModelProviderName,
    Action,
    IAgentRuntime,
    Memory,
    State,
    HandlerCallback,
    elizaLogger
} from "@elizaos/core";
import { openChatPlugin } from "../src/index";

// Custom action example
const customGreetingAction: Action = {
    name: "OPENCHAT_CUSTOM_GREETING",
    similes: ["GREET_USER", "WELCOME_USER"],
    description: "Send a custom greeting to OpenChat users",
    
    validate: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
        // Only trigger for greeting-related messages
        const text = message.content.text?.toLowerCase() || "";
        return text.includes("hello") || text.includes("hi") || text.includes("hey");
    },
    
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        options?: any,
        callback?: HandlerCallback
    ): Promise<boolean> => {
        try {
            const botClient = options?.botClient;
            if (!botClient) return false;
            
            const agentName = runtime.character.name;
            const greeting = `👋 Hello! I'm ${agentName}, your AI assistant on OpenChat. How can I help you today?`;
            
            await botClient.createTextMessage(greeting);
            
            elizaLogger.success("Custom greeting sent!");
            
            if (callback) {
                callback({
                    text: greeting,
                    action: "OPENCHAT_CUSTOM_GREETING"
                });
            }
            
            return true;
        } catch (error) {
            elizaLogger.error("Error in custom greeting:", error);
            return false;
        }
    },
    
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Hello!" }
            },
            {
                user: "{{agentName}}",
                content: { 
                    text: "👋 Hello! I'm {{agentName}}, your AI assistant on OpenChat. How can I help you today?",
                    action: "OPENCHAT_CUSTOM_GREETING"
                }
            }
        ]
    ]
};

// Advanced character with custom actions
const advancedCharacter: Character = {
    name: "AdvancedOpenChatBot",
    username: "advancedbot",
    
    bio: [
        "An advanced AI assistant with custom capabilities",
        "Powered by Eliza OS with extended functionality",
        "Specialized in OpenChat interactions"
    ],
    
    lore: [
        "Evolved from basic bots to provide enhanced experiences",
        "Equipped with custom actions and behaviors",
        "Continuously learning and adapting"
    ],
    
    knowledge: [
        "Advanced OpenChat features",
        "Custom action handling",
        "Context-aware responses",
        "Multi-modal interactions"
    ],
    
    messageExamples: [
        [
            {
                user: "{{user1}}",
                content: { text: "What makes you advanced?" }
            },
            {
                user: "AdvancedOpenChatBot",
                content: { 
                    text: "I have custom actions and enhanced capabilities! I can perform specialized tasks, handle complex interactions, and provide more personalized responses based on context." 
                }
            }
        ]
    ],
    
    postExamples: [],
    
    topics: [
        "OpenChat Advanced Features",
        "Custom Bot Actions",
        "AI Capabilities",
        "Decentralized Tech",
        "ICP Ecosystem"
    ],
    
    style: {
        all: [
            "Professional and knowledgeable",
            "Detailed when needed",
            "Efficient and precise",
            "Adaptable to user needs"
        ],
        chat: [
            "Context-aware responses",
            "Uses advanced features appropriately",
            "Proactive in offering help",
            "Technical but accessible"
        ],
        post: []
    },
    
    adjectives: [
        "advanced",
        "capable",
        "intelligent",
        "efficient",
        "adaptable"
    ],
    
    // Include both default plugin actions and custom actions
    plugins: [openChatPlugin.name],
    
    // Add custom action to the character
    // Note: In actual implementation, you'd register this through the plugin system
    actions: [
        // OpenChat plugin actions are automatically included
        // Add custom actions here
    ],
    
    clients: [],
    
    modelProvider: ModelProviderName.OPENAI,
    
    settings: {
        secrets: {
            OPENCHAT_PUBLIC_KEY: process.env.OPENCHAT_PUBLIC_KEY,
            OPENCHAT_IC_HOST: process.env.OPENCHAT_IC_HOST || "https://icp0.io",
            OPENCHAT_IDENTITY_PRIVATE_KEY: process.env.OPENCHAT_IDENTITY_PRIVATE_KEY,
            OPENCHAT_STORAGE_CANISTER_ID: process.env.OPENCHAT_STORAGE_CANISTER_ID,
        },
        // Advanced settings
        model: "gpt-4", // Use more powerful model
        temperature: 0.7,
        maxTokens: 2000,
    },
    
    templates: {
        chatTemplate: `{{recentMessages}}

You are {{agentName}}, an advanced AI assistant on OpenChat with enhanced capabilities.
Context: {{context}}

Analyze the conversation and provide an intelligent, context-aware response.
Use your advanced features when appropriate.
Be helpful, precise, and adaptable to the user's needs.`,
    }
};

export { advancedCharacter, customGreetingAction };

/**
 * Example: Running with custom actions
 * 
 * import { createAgent } from "@elizaos/core";
 * 
 * async function main() {
 *     // Create plugin instance with custom actions
 *     const customPlugin = {
 *         ...openChatPlugin,
 *         actions: [
 *             ...openChatPlugin.actions || [],
 *             customGreetingAction
 *         ]
 *     };
 *     
 *     const agent = await createAgent({
 *         character: advancedCharacter,
 *         plugins: [customPlugin],
 *     });
 *     
 *     await agent.start();
 *     console.log("🚀 Advanced OpenChat agent with custom actions is running!");
 * }
 * 
 * main().catch(console.error);
 */
