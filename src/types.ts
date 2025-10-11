/**
 * OpenChat client configuration
 */
export interface OpenChatConfig {
  /** OpenChat public key */
  openchatPublicKey: string;
  /** Internet Computer host URL */
  icHost: string;
  /** Bot identity private key */
  identityPrivateKey: string;
  /** OpenStorage canister ID */
  openStorageCanisterId: string;
  /** Server port (default: 3000) */
  port?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * OpenChat message context
 */
export interface OpenChatMessageContext {
  userId: string;
  userName: string;
  chatId: string;
  messageText: string;
  messageId?: bigint;
}
