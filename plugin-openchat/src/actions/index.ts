/**
 * OpenChat Plugin Actions
 * Export all available actions for the plugin
 */

export { sendMessageAction } from "./sendMessage";
export { reactToMessageAction } from "./reactToMessage";
export { deleteMessageAction } from "./deleteMessage";
export { getChatInfoAction } from "./getChatInfo";

// Export all actions as array for easy registration
import { sendMessageAction } from "./sendMessage";
import { reactToMessageAction } from "./reactToMessage";
import { deleteMessageAction } from "./deleteMessage";
import { getChatInfoAction } from "./getChatInfo";

export const openChatActions = [
    sendMessageAction,
    reactToMessageAction,
    deleteMessageAction,
    getChatInfoAction,
];

export default openChatActions;
