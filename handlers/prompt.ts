import { Response } from "express";
import { WithBotClient } from "../types";
import { success } from "./success";

import { argumentsInvalid } from "@open-ic/openchat-botclient-ts";

export default async function prompt(req: WithBotClient, res: Response) {
  const client = req.botClient;
  const placeholder = (
    await client.createTextMessage("Thinking ...")
  ).setFinalised(false);
  res.status(200).json(success(placeholder));

  const prompt = client.stringArg("prompt");
  if (prompt === undefined) {
    res.status(400).send(argumentsInvalid());
  } else {
    
            client
              .createTextMessage(
                "HELLO WORLD"
              )
            
  }
}