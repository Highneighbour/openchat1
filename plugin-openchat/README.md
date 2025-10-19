# @elizaos/plugin-openchat

OpenChat integration plugin for ElizaOS agents. This plugin enables your ElizaOS AI agents to interact with [OpenChat (oc.app)](https://oc.app), a decentralized chat platform on the Internet Computer.

## Features

- 🤖 **Full Bot Integration**: Run your ElizaOS agent as an OpenChat bot
- 💬 **Message Handling**: Receive and respond to messages from OpenChat users
- 🎯 **Actions**: Send messages, react to messages, delete messages
- 📊 **Context Providers**: Access chat context, user info, and installation details
- 🔄 **Event Handling**: Respond to installation, member join/leave events
- 🌐 **Express Server**: Built-in server for OpenChat bot callbacks

## Installation

```bash
npm install @elizaos/plugin-openchat
```

Or if developing locally:

```bash
npm install /path/to/plugin-openchat
```

## Configuration

### Required Environment Variables

Create a `.env` file with the following variables:

```env
# OpenChat Configuration
OPENCHAT_PUBLIC_KEY=your_openchat_public_key
IC_HOST=https://ic0.app
IDENTITY_PRIVATE_KEY=your_bot_private_key_pem
STORAGE_INDEX_CANISTER=your_storage_canister_id

# Optional Configuration
OPENCHAT_BOT_PORT=3000
OPENCHAT_AUTONOMOUS=false
```

### Getting Configuration Values

1. **OpenChat Public Key, IC Host, Storage Canister**:
   - Navigate to your OpenChat user profile
   - Open the Advanced section
   - Click "Bot client data"
   - Copy the values for your environment

2. **Identity Private Key**:
   - Generate a new private key:
     ```bash
     openssl ecparam -genkey -name secp256k1 -out private_key.pem
     ```
   - Get the principal (needed for bot registration):
     ```bash
     # Use the OpenChat SDK script
     node ./scripts/report_principal.js private_key.pem
     ```
   - Copy the PEM file contents to your `.env` file

3. **Bot Registration**:
   - In OpenChat, use `/register_bot` command
   - Enter your bot's principal (from step 2)
   - Enter your bot's endpoint (e.g., `http://localhost:3000`)
   - OpenChat will validate your bot definition at `/bot_definition`

## Usage

### 1. Add Plugin to Your Agent

In your agent's character file:

```json
{
  "name": "MyAgent",
  "plugins": ["@elizaos/plugin-openchat"],
  "settings": {
    "OPENCHAT_PUBLIC_KEY": "...",
    "IC_HOST": "https://ic0.app",
    "IDENTITY_PRIVATE_KEY": "...",
    "STORAGE_INDEX_CANISTER": "..."
  }
}
```

### 2. Start Your Agent

```bash
# Using ElizaOS CLI
npx elizaos start

# Or in your code
import { openChatPlugin } from "@elizaos/plugin-openchat";

const runtime = await createAgentRuntime({
  // ... your config
  plugins: [openChatPlugin],
});
```

### 3. Register Bot on OpenChat

1. Open OpenChat in developer mode
2. Run `/register_bot` command
3. Fill in:
   - **Name**: Your bot's name
   - **Principal**: From `report_principal.js`
   - **Endpoint**: Your server URL (e.g., `http://localhost:3000`)
4. OpenChat will load and validate your bot definition

### 4. Install Bot in a Chat

1. Create a test group in OpenChat
2. Open the members panel
3. Click "Add bots"
4. Select your bot and install it
5. Start chatting with your agent!

## Available Commands

Once installed, users can interact with your bot using:

- `/chat <message>` - Chat with the AI agent
- `/prompt <prompt>` - Send a prompt to the agent

## Actions

The plugin provides these actions for your agent:

### Send Message
```typescript
{
  name: "SEND_OPENCHAT_MESSAGE",
  description: "Send a message to OpenChat"
}
```

### React to Message
```typescript
{
  name: "REACT_OPENCHAT_MESSAGE",
  description: "Add a reaction to a message"
}
```

### Delete Message
```typescript
{
  name: "DELETE_OPENCHAT_MESSAGE",
  description: "Delete a message"
}
```

## Providers

Context providers available to your agent:

### Chat Context
```typescript
{
  name: "OPENCHAT_CHAT_CONTEXT",
  description: "Current chat summary and recent messages"
}
```

### User Info
```typescript
{
  name: "OPENCHAT_USER_INFO",
  description: "Information about the current user"
}
```

### Installations
```typescript
{
  name: "OPENCHAT_INSTALLATIONS",
  description: "Where the bot is installed"
}
```

## Bot Definition

The plugin automatically provides a bot definition at `/bot_definition` that includes:

- **Commands**: `/chat` and `/prompt` commands
- **Permissions**: Read messages, send messages, react to messages
- **Subscriptions**: Message events, member join/leave events
- **Autonomous Config**: Optional autonomous operation

## API Endpoints

The plugin creates these endpoints:

- `GET /` - Bot definition (same as `/bot_definition`)
- `GET /bot_definition` - OpenChat bot definition schema
- `POST /execute_command` - Handle bot commands from OpenChat
- `POST /notify` - Handle event notifications from OpenChat
- `GET /health` - Health check endpoint

## Architecture

```
┌─────────────────┐
│   OpenChat      │
│   (oc.app)      │
└────────┬────────┘
         │
         │ HTTP Callbacks
         ↓
┌─────────────────┐
│ Express Server  │
│  (Port 3000)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐      ┌──────────────────┐
│ OpenChat Client │◄────►│  ElizaOS Runtime │
│   (Bot Client)  │      │  (Your Agent)    │
└─────────────────┘      └──────────────────┘
```

## Development

### Project Structure

```
plugin-openchat/
├── src/
│   ├── index.ts           # Main plugin export
│   ├── types.ts           # TypeScript types
│   ├── client.ts          # OpenChat client wrapper
│   ├── service.ts         # Express server service
│   ├── actions/           # Agent actions
│   │   ├── sendMessage.ts
│   │   ├── reactToMessage.ts
│   │   └── deleteMessage.ts
│   ├── providers/         # Context providers
│   │   ├── chatContext.ts
│   │   ├── userInfo.ts
│   │   └── installations.ts
│   └── handlers/          # Request handlers
│       ├── schema.ts
│       └── notify.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
npm run build
```

### Local Testing

1. Build the plugin: `npm run build`
2. Link locally: `npm link`
3. In your ElizaOS project: `npm link @elizaos/plugin-openchat`
4. Start your agent
5. Register and test on OpenChat

## Troubleshooting

### Bot Not Responding
- Check that the Express server is running (look for "Bot server started" log)
- Verify your endpoint is accessible from OpenChat
- Check the bot is properly installed in the chat

### JWT Verification Failed
- Ensure OPENCHAT_PUBLIC_KEY is correct
- Verify you're using the right environment (IC_HOST)

### Permission Denied
- Check bot permissions in OpenChat
- Verify installation was successful
- Review the permissions granted during installation

## Examples

### Basic Agent with OpenChat

```typescript
import { openChatPlugin } from "@elizaos/plugin-openchat";
import { createAgentRuntime } from "@elizaos/core";

const runtime = await createAgentRuntime({
  character: {
    name: "MyBot",
    plugins: ["@elizaos/plugin-openchat"],
  },
  settings: {
    OPENCHAT_PUBLIC_KEY: process.env.OPENCHAT_PUBLIC_KEY,
    IC_HOST: process.env.IC_HOST,
    IDENTITY_PRIVATE_KEY: process.env.IDENTITY_PRIVATE_KEY,
    STORAGE_INDEX_CANISTER: process.env.STORAGE_INDEX_CANISTER,
  },
});
```

## Contributing

Contributions are welcome! Please open issues and pull requests on the GitHub repository.

## License

MIT

## Resources

- [OpenChat Bot Documentation](https://github.com/open-chat-labs/open-chat-bots)
- [OpenChat Website](https://oc.app)
- [ElizaOS Documentation](https://elizaos.ai)
- [Internet Computer](https://internetcomputer.org)

## Support

For issues and questions:
- GitHub Issues: [Your repo URL]
- ElizaOS Discord: [Discord link]
- OpenChat Community: [OpenChat link]
