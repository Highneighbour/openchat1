import { BotClientFactory } from "@open-ic/openchat-botclient-ts";

/**
 * Global factory instance for creating OpenChat bot clients
 * This follows the pattern from the YouTube bot example
 */
export function createBotClientFactory(config: {
    openchatPublicKey: string;
    icHost: string;
    identityPrivateKey: string;
    openStorageCanisterId: string;
}): BotClientFactory {
    return new BotClientFactory({
        openchatPublicKey: config.openchatPublicKey,
        icHost: config.icHost,
        identityPrivateKey: config.identityPrivateKey,
        openStorageCanisterId: config.openStorageCanisterId,
    });
}
