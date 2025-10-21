import { BotClient, BotClientFactory } from "@open-ic/openchat-botclient-ts";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware to extract JWT from request and create BotClient
 * Based on the YouTube bot's withBotClient helper
 */
export function createJwtMiddleware(factory: BotClientFactory) {
    return (req: Request, res: Response, next: NextFunction) => {
        const jwt = req.headers["x-oc-jwt"] as string;
        
        if (!jwt) {
            return res.status(400).json({
                error: "Missing x-oc-jwt header"
            });
        }

        try {
            // Create bot client from JWT token
            const client = factory.createClientFromCommandJwt(jwt);
            console.log("[OpenChat] Bot client created from JWT");
            
            // Attach client to request
            (req as any).botClient = client;
            next();
        } catch (error) {
            console.error("[OpenChat] JWT validation failed:", error);
            return res.status(401).json({
                error: "Invalid JWT token"
            });
        }
    };
}

/**
 * Helper to get bot client from request
 */
export function getBotClient(req: Request): BotClient | undefined {
    return (req as any).botClient;
}
