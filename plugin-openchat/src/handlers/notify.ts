import { Request, Response } from "express";
import type { IAgentRuntime } from "@elizaos/core";
import { logger } from "@elizaos/core";
import { getOpenChatClient } from "../client";
import { OpenChatEventType } from "../types";

/**
 * Handle notification events from OpenChat
 * These are sent when the bot is installed/uninstalled or when events occur
 */
export async function handleNotification(
  req: Request,
  res: Response,
  runtime: IAgentRuntime
): Promise<void> {
  try {
    const client = getOpenChatClient();
    
    // Parse the notification body
    // OpenChat sends notifications as msgpack, but we'll also support JSON for testing
    let notification: any;
    
    if (req.headers["content-type"]?.includes("msgpack")) {
      // TODO: Handle msgpack properly with a msgpack library
      logger.warn("[OpenChat] msgpack notifications not fully implemented yet");
      notification = req.body;
    } else {
      notification = req.body;
    }

    logger.debug({ notification }, "[OpenChat] Received notification");

    // Handle different event types
    const eventType = notification.type || notification.event_type;

    switch (eventType) {
      case OpenChatEventType.INSTALLED:
      case "bot_installed":
        await handleBotInstalled(notification, client, runtime);
        break;

      case OpenChatEventType.UNINSTALLED:
      case "bot_uninstalled":
        await handleBotUninstalled(notification, client, runtime);
        break;

      case OpenChatEventType.MESSAGE:
      case "message":
        await handleMessage(notification, client, runtime);
        break;

      case OpenChatEventType.MEMBER_JOINED:
      case "member_joined":
        await handleMemberJoined(notification, client, runtime);
        break;

      case OpenChatEventType.MEMBER_LEFT:
      case "member_left":
        await handleMemberLeft(notification, client, runtime);
        break;

      default:
        logger.debug({ eventType }, "[OpenChat] Unhandled notification type");
    }

    res.status(200).send("OK");
  } catch (error) {
    logger.error({ error }, "[OpenChat] Error handling notification");
    res.status(500).send("Error handling notification");
  }
}

/**
 * Handle bot installation event
 */
async function handleBotInstalled(
  notification: any,
  client: any,
  runtime: IAgentRuntime
): Promise<void> {
  try {
    const scope = notification.scope || notification.chat_id;
    const permissions = notification.permissions || [];
    const chatType = notification.chat_type || "Group";

    client.registerInstallation(scope, permissions, chatType);

    logger.info(
      { scope, chatType, permissions },
      "[OpenChat] Bot installed"
    );

    // Optionally send a welcome message
    // This would require creating an autonomous client for this scope
  } catch (error) {
    logger.error({ error }, "[OpenChat] Error handling bot installation");
  }
}

/**
 * Handle bot uninstallation event
 */
async function handleBotUninstalled(
  notification: any,
  client: any,
  runtime: IAgentRuntime
): Promise<void> {
  try {
    const scope = notification.scope || notification.chat_id;
    client.unregisterInstallation(scope);

    logger.info({ scope }, "[OpenChat] Bot uninstalled");
  } catch (error) {
    logger.error({ error }, "[OpenChat] Error handling bot uninstallation");
  }
}

/**
 * Handle message event
 * This is for autonomous message handling (not command-based)
 */
async function handleMessage(
  notification: any,
  client: any,
  runtime: IAgentRuntime
): Promise<void> {
  try {
    logger.debug({ notification }, "[OpenChat] Received message notification");
    
    // In autonomous mode, we could process messages here
    // For now, we'll mainly handle commands through execute_command
  } catch (error) {
    logger.error({ error }, "[OpenChat] Error handling message notification");
  }
}

/**
 * Handle member joined event
 */
async function handleMemberJoined(
  notification: any,
  client: any,
  runtime: IAgentRuntime
): Promise<void> {
  try {
    const scope = notification.scope || notification.chat_id;
    const userId = notification.user_id;
    const userName = notification.user_name;

    logger.info(
      { scope, userId, userName },
      "[OpenChat] Member joined"
    );

    // Optionally send a welcome message to the new member
  } catch (error) {
    logger.error({ error }, "[OpenChat] Error handling member joined");
  }
}

/**
 * Handle member left event
 */
async function handleMemberLeft(
  notification: any,
  client: any,
  runtime: IAgentRuntime
): Promise<void> {
  try {
    const scope = notification.scope || notification.chat_id;
    const userId = notification.user_id;

    logger.info({ scope, userId }, "[OpenChat] Member left");
  } catch (error) {
    logger.error({ error }, "[OpenChat] Error handling member left");
  }
}
