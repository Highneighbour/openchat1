# @elizaos/client-openchat

> **OpenChat Client Plugin for ElizaOS** - Enable your AI agents to interact on the Internet Computer's OpenChat platform

[![npm version](https://img.shields.io/npm/v/@elizaos/client-openchat.svg)](https://www.npmjs.com/package/@elizaos/client-openchat)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This plugin enables [ElizaOS](https://github.com/ai16z/eliza) agents to connect to [OpenChat](https://oc.app), a decentralized messaging platform on the Internet Computer. Your AI agents can interact with users, maintain conversation context, and provide intelligent responses.

## Features

- 🤖 **Full ElizaOS Integration** - Works seamlessly with ElizaOS agents
- 💬 **OpenChat Native** - Built on OpenChat's official bot framework
- 🧠 **Context-Aware** - Maintains conversation history and memory
- 🔒 **Secure** - Uses OpenChat's JWT authentication
- 🌐 **Decentralized** - Runs on Internet Computer blockchain
- 🔌 **Plug & Play** - Easy installation via npm

## Installation

### Using ElizaOS CLI (Recommended)

When creating a new agent with the ElizaOS CLI:

```bash
# Create a new agent
elizaos create my-openchat-agent

# When prompted for clients, select "openchat"
# Or manually add to your character file
```

### Manual Installation

Add to your ElizaOS project:

```bash
npm install @elizaos/client-openchat
```

Or with pnpm:

```bash
pnpm add @elizaos/client-openchat
```

## Quick Start

### 1. Register Your Bot on OpenChat

1. Visit [OpenChat](https://oc.app)
2. Register your bot and get credentials:
   - `OPENCHAT_PUBLIC_KEY`
   - `OPENCHAT_IDENTITY_PRIVATE`
   - `OPENCHAT_STORAGE_CANISTER`

### 2. Configure Environment Variables

Create or update your `.env` file:

```env
# OpenChat Configuration
OPENCHAT_PUBLIC_KEY=your_openchat_public_key
OPENCHAT_IDENTITY_PRIVATE=your_identity_private_key
OPENCHAT_STORAGE_CANISTER=your_storage_canister_id
OPENCHAT_IC_HOST=https://icp-api.io
OPENCHAT_PORT=3000

# AI Provider (at least one required)
OPENAI_API_KEY=your_openai_api_key
MODEL_PROVIDER=openai
```

### 3. Add to Your Character Configuration

In your `character.json`:

```json
{
  "name": "YourAgent",
  "bio": ["Your agent's bio"],
  "modelProvider": "openai",
  "clients": ["openchat"],
  "plugins": []
}
```

### 4. Run Your Agent

```bash
elizaos start
```

Your agent will:
- Start an HTTP server for OpenChat webhooks
- Register the `/prompt` command
- Begin responding to messages on OpenChat

## Usage

### In OpenChat

Once your agent is running and registered:

1. Find your bot on OpenChat
2. Add it to a group or DM
3. Use the `/prompt` command:

```
/prompt Hello! How are you?
```

The bot will:
- Show a "Thinking..." placeholder
- Process your message through ElizaOS
- Return an intelligent, context-aware response

### Programmatic Usage

You can also use this client programmatically:

```typescript
import { OpenChatClient } from "@elizaos/client-openchat";
import { AgentRuntime } from "@ai16z/eliza";

// Create client
const client = new OpenChatClient({
  openchatPublicKey: process.env.OPENCHAT_PUBLIC_KEY!,
  icHost: process.env.OPENCHAT_IC_HOST!,
  identityPrivateKey: process.env.OPENCHAT_IDENTITY_PRIVATE!,
  openStorageCanisterId: process.env.OPENCHAT_STORAGE_CANISTER!,
  port: 3000,
});

// Start with your runtime
await client.start(runtime);
```

## Configuration

### Client Configuration Options

```typescript
interface OpenChatConfig {
  /** OpenChat public key (required) */
  openchatPublicKey: string;
  
  /** Internet Computer host URL (default: https://icp-api.io) */
  icHost?: string;
  
  /** Bot identity private key (required) */
  identityPrivateKey: string;
  
  /** OpenStorage canister ID (required) */
  openStorageCanisterId: string;
  
  /** Server port (default: 3000) */
  port?: number;
  
  /** Enable debug logging (default: false) */
  debug?: boolean;
}
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENCHAT_PUBLIC_KEY` | OpenChat bot public key | Yes | - |
| `OPENCHAT_IDENTITY_PRIVATE` | Bot identity private key | Yes | - |
| `OPENCHAT_STORAGE_CANISTER` | Storage canister ID | Yes | - |
| `OPENCHAT_IC_HOST` | Internet Computer host | No | `https://icp-api.io` |
| `OPENCHAT_PORT` | Server port | No | `3000` |

## API Endpoints

The client automatically sets up these endpoints:

### `GET /` or `GET /bot_definition`

Returns the bot definition for OpenChat registration.

**Response:**
```json
{
  "description": "Agent description",
  "commands": [...],
  "autonomous_config": {...}
}
```

### `POST /execute_command`

Handles OpenChat command execution (called by OpenChat platform).

**Headers:**
- `x-oc-jwt`: OpenChat authentication token

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "client": "openchat"
}
```

## Architecture

```
┌─────────────────┐
│  OpenChat User  │
└────────┬────────┘
         │ /prompt command
         ↓
┌─────────────────┐
│ OpenChat (ICP)  │
└────────┬────────┘
         │ HTTP POST + JWT
         ↓
┌─────────────────┐
│ Your Agent      │
│ + OpenChat      │
│   Client        │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ ElizaOS Runtime │
│ + AI Model      │
└─────────────────┘
```

### Message Flow

1. User sends `/prompt message` in OpenChat
2. OpenChat platform calls your bot's `/execute_command` endpoint
3. Client authenticates request and extracts message
4. Message is processed through ElizaOS runtime:
   - User and room state is ensured in database
   - Message is stored in conversation memory
   - Context is composed from conversation history
   - AI model generates response
   - Response is stored in memory
5. Response is sent back to OpenChat
6. User sees the response

## Examples

See the [`examples/`](./examples) directory for:
- `character.json` - Example agent configuration

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/your-org/client-openchat
cd client-openchat

# Install dependencies
npm install

# Build
npm run build

# Watch mode for development
npm run dev
```

### Testing

```bash
npm test
```

### Publishing

```bash
# Bump version
npm version patch|minor|major

# Publish to npm
npm publish
```

## Troubleshooting

### Bot not responding

**Check environment variables:**
```bash
# Verify all required variables are set
echo $OPENCHAT_PUBLIC_KEY
echo $OPENCHAT_IDENTITY_PRIVATE
echo $OPENCHAT_STORAGE_CANISTER
```

**Check logs:**
```bash
# ElizaOS logs will show connection status
elizaos start --log-level debug
```

**Verify bot registration:**
```bash
# Test the bot definition endpoint
curl http://localhost:3000/bot_definition
```

### Connection errors

- Ensure your server is publicly accessible (OpenChat needs to reach your endpoints)
- Check firewall rules allow traffic on the configured port
- Verify `OPENCHAT_IC_HOST` is correct
- Test Internet Computer connectivity

### Authentication errors

- Verify `OPENCHAT_PUBLIC_KEY` matches your bot registration
- Check `OPENCHAT_IDENTITY_PRIVATE` is correctly formatted
- Ensure credentials haven't expired

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Resources

- **ElizaOS**: https://github.com/ai16z/eliza
- **ElizaOS Docs**: https://docs.elizaos.ai/
- **OpenChat**: https://oc.app
- **OpenChat Bot Framework**: https://github.com/open-chat-labs/open-chat-bots
- **Internet Computer**: https://internetcomputer.org/

## Support

- **Issues**: [GitHub Issues](https://github.com/your-org/client-openchat/issues)
- **ElizaOS Discord**: [Join Discord](https://discord.gg/ai16z)
- **OpenChat Community**: [OpenChat](https://oc.app)

## License

MIT License - see [LICENSE](LICENSE) for details

## Acknowledgments

- Built for [ElizaOS](https://github.com/ai16z/eliza)
- Powered by [OpenChat](https://oc.app)
- Running on [Internet Computer](https://internetcomputer.org/)

---

**Made with ❤️ for the ElizaOS and OpenChat communities**
