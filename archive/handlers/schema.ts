import { BotDefinition, Permissions } from "@open-ic/openchat-botclient-ts";
import { Request, Response } from "express";

const emptyPermissions = {
  chat: [],
  community: [],
  message: [],
};

function getBotDefinition(): BotDefinition {
  return {
    description:
      "An intelligent AI agent powered by ElizaOS - capable of context-aware conversations, memory retention, and sophisticated reasoning",
    autonomous_config: {
      permissions: Permissions.encodePermissions({
        ...emptyPermissions,
        message: ["Text"],
        chat: [
          "ReactToMessages",
          "ReadMessages",
          "ReadChatSummary",
          "DeleteMessages",

        ],
      }),
    },
    default_subscriptions: {
      community: [],
      chat: ["Message"],
    },
    commands: [
      {
        name: "prompt",
        default_role: "Participant",
        description: "Send a message to the ElizaOS AI agent for intelligent responses",
        permissions: Permissions.encodePermissions({
          ...emptyPermissions,
          message: ["Text"],
          chat: ["ReadChatSummary"],
        }),
        direct_messages: true,
        params: [
          {
            name: "prompt",
            required: true,
            description: "Your message to the ElizaOS AI agent",
            placeholder: "Ask me anything...",
            param_type: {
              StringParam: {
                min_length: 1,
                max_length: 1000,
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

export default function schema(_: Request, res: Response) {
  res.status(200).json(getBotDefinition());
}