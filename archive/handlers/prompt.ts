import { Response } from "express";
import { WithBotClient } from "../types";
import { success } from "./success";
import { argumentsInvalid } from "@open-ic/openchat-botclient-ts";
import { processMessageWithEliza, initializeElizaRuntime } from "../eliza-runtime";

export default async function prompt(req: WithBotClient, res: Response) {
  const client = req.botClient;
  
  // Send initial "thinking" message
  const placeholder = (
    await client.createTextMessage("Thinking ...")
  ).setFinalised(false);
  res.status(200).json(success(placeholder));

  const promptText = client.stringArg("prompt");
  
  if (promptText === undefined) {
    res.status(400).send(argumentsInvalid());
    return;
  }

  try {
    // Initialize ElizaOS runtime if not already initialized
    await initializeElizaRuntime();

    // Get user information from the bot client
    const userId = client.initiator || "unknown";
    const userName = client.initiator || "User";
    const roomId = client.chatId?.toString() || "default";

    // Process the message through ElizaOS
    const response = await processMessageWithEliza(
      userId,
      userName,
      promptText,
      roomId
    );

    // Send the ElizaOS response back to OpenChat
    const responseMessage = await client.createTextMessage(response);
    
    // Update the placeholder message with the actual response
    await client.sendMessage(responseMessage);
    
  } catch (error) {
    console.error("Error processing message with ElizaOS:", error);
    
    // Send error message back to user
    const errorMessage = await client.createTextMessage(
      "I apologize, but I encountered an error processing your message. Please ensure the ElizaOS agent is properly configured."
    );
    await client.sendMessage(errorMessage);
  }
}