/**
 * OpenChat Plugin Providers
 * Export all providers for the plugin
 */

export { openChatMessageProvider } from "./messageProvider";

import { openChatMessageProvider } from "./messageProvider";

export const openChatProviders = [
    openChatMessageProvider,
];

export default openChatProviders;
