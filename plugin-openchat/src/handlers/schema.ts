import { BotDefinition, Permissions } from "@open-ic/openchat-botclient-ts";

/**
 * Empty permissions template
 */
const emptyPermissions = {
  chat: [],
  community: [],
  message: [],
};

/**
 * Get the bot definition schema for OpenChat
 * This defines what the bot can do and what permissions it needs
 */
export function getBotDefinition(): BotDefinition {
  return {
    description: "An ElizaOS AI agent integrated with OpenChat. Chat with an intelligent agent that can help with various tasks.",
    
    // Autonomous configuration - what the bot can do proactively
    autonomous_config: {
      permissions: Permissions.encodePermissions({
        ...emptyPermissions,
        message: ["Text", "Image", "Video", "Audio", "File"],
        chat: [
          "ReactToMessages",
          "ReadMessages",
          "ReadChatSummary",
          "SendMessages",
        ],
      }),
    },

    // Default subscriptions to events
    default_subscriptions: {
      community: [],
      chat: ["Message", "MemberJoined", "MemberLeft"],
    },

    // Commands that users can execute
    commands: [
      {
        name: "chat",
        default_role: "Participant",
        description: "Chat with the AI agent",
        permissions: Permissions.encodePermissions({
          ...emptyPermissions,
          message: ["Text", "Image"],
          chat: ["ReadChatSummary", "ReadMessages"],
        }),
        direct_messages: true,
        params: [
          {
            name: "message",
            required: true,
            description: "Your message to the agent",
            placeholder: "Hello! How can you help me?",
            param_type: {
              StringParam: {
                min_length: 1,
                max_length: 5000,
                choices: [],
                multi_line: true,
              },
            },
          },
        ],
      },
      {
        name: "prompt",
        default_role: "Participant",
        description: "Send a prompt to the AI agent",
        permissions: Permissions.encodePermissions({
          ...emptyPermissions,
          message: ["Text", "Image"],
          chat: ["ReadChatSummary", "ReadMessages"],
        }),
        direct_messages: true,
        params: [
          {
            name: "prompt",
            required: true,
            description: "Your prompt for the agent",
            placeholder: "What would you like to know?",
            param_type: {
              StringParam: {
                min_length: 1,
                max_length: 5000,
                choices: [],
                multi_line: true,
              },
            },
          },
        ],
      },
    ],
  };
}
