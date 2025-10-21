export { sendMessageAction } from "./sendMessage.js";

// Export all actions as array for plugin registration
import { sendMessageAction } from "./sendMessage.js";
import { reactToMessageAction } from "./reactToMessage.js";
import { deleteMessageAction } from "./deleteMessage.js";
import { getChatSummaryAction } from "./getChatSummary.js";
import { readMessagesAction } from "./readMessages.js";

export const actions = [
    sendMessageAction,
    reactToMessageAction,
    deleteMessageAction,
    getChatSummaryAction,
    readMessagesAction,
];

export default actions;
