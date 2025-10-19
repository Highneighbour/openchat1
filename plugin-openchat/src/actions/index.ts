export { sendMessageAction } from "./sendMessage";
export { addReactionAction } from "./addReaction";
export { createPollAction } from "./createPoll";
export { deleteMessageAction } from "./deleteMessage";
export { getChatInfoAction } from "./getChatInfo";

import { sendMessageAction } from "./sendMessage";
import { addReactionAction } from "./addReaction";
import { createPollAction } from "./createPoll";
import { deleteMessageAction } from "./deleteMessage";
import { getChatInfoAction } from "./getChatInfo";

export const actions = [
    sendMessageAction,
    addReactionAction,
    createPollAction,
    deleteMessageAction,
    getChatInfoAction,
];
