#!/usr/bin/env node
/**
 * Standalone OpenChat Bot Server
 * 
 * Run this to start the OpenChat bot server independently
 * Usage: node dist/standalone-server.js
 * or: npm run start:bot
 */

import { OpenChatClient } from "./client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create a minimal runtime mock for standalone mode
const mockRuntime = {
    character: {
        name: process.env.BOT_NAME || "ElizaBot",
        bio: [process.env.BOT_BIO || "An AI assistant on OpenChat"]
    },
    getSetting: (key: string) => process.env[key],
} as any;

async function main() {
    console.log("🚀 Starting OpenChat Bot Server (Standalone Mode)...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    try {
        const client = new OpenChatClient(mockRuntime);
        await client.start();
        
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("✅ OpenChat bot server is running!");
        console.log("");
        console.log("📡 Endpoints:");
        console.log(`   • Bot Definition: http://localhost:${process.env.OPENCHAT_BOT_PORT || 3000}/bot_definition`);
        console.log(`   • Execute Command: http://localhost:${process.env.OPENCHAT_BOT_PORT || 3000}/execute_command`);
        console.log("");
        console.log("🔗 Use this URL to register your bot on OpenChat");
        console.log("");
        console.log("Press Ctrl+C to stop the server");
        
        // Handle graceful shutdown
        process.on("SIGINT", async () => {
            console.log("\n\n🛑 Shutting down...");
            await client.stop();
            process.exit(0);
        });
        
        process.on("SIGTERM", async () => {
            console.log("\n\n🛑 Shutting down...");
            await client.stop();
            process.exit(0);
        });
        
    } catch (error: any) {
        console.error("❌ Failed to start OpenChat bot server:");
        console.error(error.message);
        console.error("");
        console.error("💡 Make sure you have set all required environment variables:");
        console.error("   • OPENCHAT_PUBLIC_KEY");
        console.error("   • OPENCHAT_IC_HOST");
        console.error("   • OPENCHAT_IDENTITY_PRIVATE_KEY");
        console.error("   • OPENCHAT_STORAGE_CANISTER_ID");
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main().catch(console.error);
}

export { main };
