import {
    BotClient,
    BotEvent,
    handleNotification,
    InstallationRecord,
} from "@open-ic/openchat-botclient-ts";
import { Request, Response } from "express";
import { IAgentRuntime } from "@elizaos/core";
import { BotClientFactory } from "@open-ic/openchat-botclient-ts";

/**
 * Get raw bytes from request body
 */
function getRawBytes(req: Request): Buffer {
    if (Buffer.isBuffer(req.body)) {
        return req.body;
    }
    if (typeof req.body === 'string') {
        return Buffer.from(req.body, 'utf-8');
    }
    return Buffer.from(JSON.stringify(req.body), 'utf-8');
}

/**
 * Handle bot event notifications
 * Based on YouTube bot's notify handler
 */
export function createNotifyHandler(
    factory: BotClientFactory,
    runtime: IAgentRuntime,
    onInstall: (location: any, record: InstallationRecord) => Promise<void>,
    onUninstall: (location: any) => Promise<void>
) {
    return async (req: Request, res: Response) => {
        const signature = req.headers["x-oc-signature"] as string;
        const rawBytes = getRawBytes(req);

        return handleNotification(
            signature,
            rawBytes,
            factory,
            async (client: BotClient, event: BotEvent, apiGateway: string) => {
                console.log("[OpenChat] Received event:", event.kind);

                if (event.kind === "bot_installed_event") {
                    const location = event.location;
                    const record = new InstallationRecord(
                        apiGateway,
                        event.grantedAutonomousPermissions,
                        event.grantedCommandPermissions
                    );

                    await onInstall(location, record);
                    console.log("[OpenChat] Bot installed in:", location);
                }

                if (event.kind === "bot_uninstalled_event") {
                    const location = event.location;
                    await onUninstall(location);
                    console.log("[OpenChat] Bot uninstalled from:", location);
                }

                // Handle other event types in the future
                // Note: Check BotEvent types for available event kinds

                return {
                    statusCode: 200,
                };
            },
            (error) => {
                console.error("[OpenChat] Bot event parsing failed:", error);
                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        message: "Failed to parse bot event",
                        error,
                    }),
                };
            }
        );
    };
}
