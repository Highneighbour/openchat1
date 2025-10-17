import { OpenChatConfig } from "./types";

/**
 * Validates and returns OpenChat configuration from environment variables
 */
export function validateOpenChatConfig(): OpenChatConfig {
    const openchatPublicKey = process.env.OPENCHAT_PUBLIC_KEY;
    const icHost = process.env.OPENCHAT_IC_HOST;
    const identityPrivateKey = process.env.OPENCHAT_IDENTITY_PRIVATE_KEY;
    const openStorageCanisterId = process.env.OPENCHAT_STORAGE_CANISTER_ID;

    if (!openchatPublicKey) {
        throw new Error("OPENCHAT_PUBLIC_KEY environment variable is required");
    }
    if (!icHost) {
        throw new Error("OPENCHAT_IC_HOST environment variable is required");
    }
    if (!identityPrivateKey) {
        throw new Error("OPENCHAT_IDENTITY_PRIVATE_KEY environment variable is required");
    }
    if (!openStorageCanisterId) {
        throw new Error("OPENCHAT_STORAGE_CANISTER_ID environment variable is required");
    }

    return {
        openchatPublicKey,
        icHost,
        identityPrivateKey,
        openStorageCanisterId,
        port: process.env.OPENCHAT_BOT_PORT ? parseInt(process.env.OPENCHAT_BOT_PORT) : 3000
    };
}

/**
 * Check if OpenChat is properly configured
 */
export function isOpenChatConfigured(): boolean {
    try {
        validateOpenChatConfig();
        return true;
    } catch {
        return false;
    }
}
