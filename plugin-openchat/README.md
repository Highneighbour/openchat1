# @eliza/plugin-openchat

OpenChat plugin for ElizaOS - Enables AI agents to interact with OpenChat (oc.app), the decentralized chat platform on the Internet Computer.

## Features

- 🤖 **Full OpenChat Bot Integration** - Run your Eliza agent as an OpenChat bot
- 💬 **Message Handling** - Send and receive messages in OpenChat chats
- 👍 **Reactions** - Add emoji reactions to messages
- 📊 **Polls** - Create interactive polls
- 🗑️ **Message Management** - Delete messages when needed
- 👥 **Chat Information** - Get chat summaries, member lists, and more
- 🔄 **Autonomous Operation** - Agents can monitor and respond to messages automatically
- 🎯 **Action System** - Rich set of actions for OpenChat interactions
- 📦 **Provider System** - Access OpenChat data in your prompts and evaluations

## Installation

```bash
npm install @eliza/plugin-openchat
```

Or add to your package.json:

```json
{
  "dependencies": {
    "@eliza/plugin-openchat": "*"
  }
}
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# Required: OpenChat Bot Configuration
OC_PUBLIC=your_openchat_public_key
IC_HOST=https://icp-api.io
IDENTITY_PRIVATE=your_identity_private_key
STORAGE_INDEX_CANISTER=your_storage_index_canister_id

# Optional: Server Configuration
OPENCHAT_BOT_PORT=3000
```

### Getting OpenChat Bot Credentials

1. Visit [OpenChat Bot Registry](https://oc.app)
2. Register your bot
3. Get your credentials:
   - `OC_PUBLIC`: Your bot's public key
   - `IDENTITY_PRIVATE`: Your bot's identity private key
   - `STORAGE_INDEX_CANISTER`: Storage canister ID

## Usage

### Basic Setup

```typescript
import { Character, AgentRuntime } from "@eliza/core";
import { openChatPlugin } from "@eliza/plugin-openchat";

const character: Character = {
  name: "MyAgent",
  plugins: [openChatPlugin],
  // ... other character configuration
};

// The plugin will automatically start the OpenChat bot server
```

### Using with Eliza CLI

1. Create a new Eliza project:
```bash
npx eliza create my-openchat-agent
cd my-openchat-agent
```

2. Install the plugin:
```bash
npm install /path/to/plugin-openchat
```

3. Add to your character file (`characters/my-agent.json`):
```json
{
  "name": "MyAgent",
  "plugins": ["@eliza/plugin-openchat"],
  "bio": "An AI agent on OpenChat",
  "lore": ["I help users on OpenChat"],
  "messageExamples": [
    [
      { "user": "user", "content": { "text": "Hello!" } },
      { "user": "MyAgent", "content": { "text": "Hi! How can I help you?" } }
    ]
  ]
}
```

4. Set up your `.env` file with OpenChat credentials

5. Run your agent:
```bash
npm run dev
```

### Registering Your Bot on OpenChat

1. Start your agent (the bot server will run on the configured port)
2. Get your bot definition URL: `http://your-server:3000/bot_definition`
3. Register the bot on OpenChat using this URL
4. Your agent will now be available on OpenChat!

## Architecture

### Components

#### OpenChatClient
Main client for interacting with OpenChat. Handles:
- Bot client factory management
- Message sending and receiving
- Context extraction and memory conversion
- Integration with Eliza runtime

#### OpenChatBotServer
Express server that handles OpenChat webhook requests:
- `/bot_definition` - Returns bot configuration
- `/execute_command` - Handles bot commands
- `/health` - Health check endpoint

#### Actions

1. **SEND_OPENCHAT_MESSAGE** - Send text messages
2. **ADD_OPENCHAT_REACTION** - Add emoji reactions
3. **CREATE_OPENCHAT_POLL** - Create polls
4. **DELETE_OPENCHAT_MESSAGE** - Delete messages
5. **GET_OPENCHAT_INFO** - Get chat information

#### Providers

1. **openChatProvider** - Provides chat context and information
2. **openChatUserProvider** - Provides user and member information

#### Evaluators

1. **shouldRespondEvaluator** - Determines if agent should respond
2. **sentimentEvaluator** - Analyzes message sentiment
3. **topicEvaluator** - Identifies conversation topics

## Advanced Usage

### Custom Actions

You can extend the plugin with custom actions:

```typescript
import { Action, IAgentRuntime, Memory, State } from "@eliza/core";
import { OpenChatClient } from "@eliza/plugin-openchat";

const customAction: Action = {
  name: "MY_CUSTOM_ACTION",
  description: "Does something custom",
  validate: async (runtime, message, state) => true,
  handler: async (runtime, message, state, options, callback) => {
    const client = runtime.clients.find(c => c instanceof OpenChatClient);
    // Your custom logic here
    return true;
  },
  examples: [],
};
```

### Using Providers in Prompts

Providers automatically inject context into your agent's prompts:

```typescript
// The openChatProvider will add chat information
// The openChatUserProvider will add user information
// These are automatically available in the agent's context
```

### Monitoring and Logging

The plugin uses Eliza's logging system:

```typescript
runtime.logger.info("OpenChat message received");
runtime.logger.error("Failed to send message", error);
runtime.logger.debug("Processing command", { command });
```

## API Reference

### OpenChatClient

```typescript
class OpenChatClient {
  constructor(runtime: IAgentRuntime, config: OpenChatConfig);
  
  // Message operations
  async sendMessage(client: BotClient, content: string, context?: OpenChatMessageContext): Promise<any>;
  async addReaction(client: BotClient, messageId: bigint, reaction: string, thread?: number): Promise<any>;
  async deleteMessages(client: BotClient, messageIds: bigint[], thread?: number): Promise<any>;
  
  // Media operations
  async createPoll(client: BotClient, question: string, answers: string[]): Promise<any>;
  async sendImage(client: BotClient, imageData: Uint8Array, mimeType: string, width: number, height: number): Promise<any>;
  async sendFile(client: BotClient, name: string, data: Uint8Array, mimeType: string, fileSize: number): Promise<any>;
  
  // Information operations
  async getChatMembers(client: BotClient, channelId?: bigint): Promise<any>;
  async getChatSummary(client: BotClient, channelId?: bigint): Promise<any>;
  
  // Context operations
  async contextToMemory(client: BotClient, content: string, context: OpenChatMessageContext): Promise<Memory>;
  extractContext(client: BotClient): OpenChatMessageContext;
}
```

### Configuration Types

```typescript
interface OpenChatConfig {
  openchatPublicKey: string;
  icHost: string;
  identityPrivateKey: string;
  openStorageCanisterId: string;
  port?: number;
}

interface OpenChatMessageContext {
  chatId: string;
  messageId: bigint;
  userId: string;
  userName?: string;
  isThread: boolean;
  threadRootMessageId?: number | null;
  channelId?: bigint;
  communityId?: string;
  timestamp: number;
}
```

## Troubleshooting

### Bot Not Receiving Messages
- Verify your `OC_PUBLIC` and `IDENTITY_PRIVATE` are correct
- Check that your bot server is accessible from OpenChat
- Ensure the bot is properly registered on OpenChat

### "Bot client not initialized" Error
- Make sure the OpenChat plugin is in your character's plugins array
- Verify all required environment variables are set
- Check server logs for initialization errors

### Messages Not Sending
- Verify bot has proper permissions in the chat
- Check that the chat/channel IDs are correct
- Review OpenChat SDK logs for detailed errors

## Examples

### Simple Echo Bot

```typescript
import { Character } from "@eliza/core";
import { openChatPlugin } from "@eliza/plugin-openchat";

const echoBot: Character = {
  name: "EchoBot",
  plugins: [openChatPlugin],
  bio: "I repeat what you say!",
  messageExamples: [
    [
      { "user": "user", "content": { "text": "Hello!" } },
      { "user": "EchoBot", "content": { "text": "Hello!" } }
    ]
  ],
  postExamples: [],
  topics: [],
  adjectives: [],
  style: {
    all: ["I repeat messages back"],
    chat: ["I echo what you say"],
  }
};
```

### Advanced Bot with Custom Behavior

See the `/examples` directory for more complex examples.

## Contributing

Contributions are welcome! Please see the main ElizaOS contributing guidelines.

## License

MIT

## Links

- [OpenChat](https://oc.app)
- [OpenChat Bot Documentation](https://github.com/open-chat-labs/open-chat-bots)
- [ElizaOS Documentation](https://docs.elizaos.ai/)
- [Internet Computer](https://internetcomputer.org/)

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- OpenChat Community: Join the OpenChat developer community
- ElizaOS Discord: Join the ElizaOS community

---

Built with ❤️ for the OpenChat and ElizaOS communities
