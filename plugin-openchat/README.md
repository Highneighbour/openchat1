# @elizaos/plugin-openchat

OpenChat plugin for Eliza OS - Enables AI agents to interact with OpenChat (oc.app), a decentralized chat application on the Internet Computer Protocol (ICP).

## Features

- 🤖 **Full OpenChat Bot Integration** - Register your Eliza agent as an OpenChat bot
- 💬 **Bidirectional Communication** - Receive messages from OpenChat and send responses
- 🎯 **Actions** - Send messages, react to messages, delete messages, get chat info
- 🔌 **Plugin Architecture** - Follows Eliza OS plugin standards
- 🌐 **Internet Computer** - Built on ICP blockchain technology
- 🔐 **Secure** - JWT-based authentication with OpenChat

## Installation

```bash
npm install @elizaos/plugin-openchat
```

Or for local development:

```bash
# In your Eliza project
npm install /path/to/plugin-openchat
```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# OpenChat Configuration
OPENCHAT_PUBLIC_KEY=your_openchat_public_key
OPENCHAT_IC_HOST=https://icp0.io
OPENCHAT_IDENTITY_PRIVATE_KEY=your_bot_identity_private_key
OPENCHAT_STORAGE_CANISTER_ID=your_storage_canister_id
OPENCHAT_BOT_PORT=3000
```

### Getting OpenChat Bot Credentials

1. **Register your bot on OpenChat**:
   - Visit [OpenChat](https://oc.app)
   - Go to bot registration section
   - Create a new bot and get your credentials

2. **Get your Identity**:
   - Generate a private key for your bot's identity on Internet Computer
   - See [OpenChat Bot SDK](https://github.com/open-chat-labs/open-chat-bots) for details

3. **Configure Storage**:
   - Get the OpenStorage canister ID from OpenChat
   - This is used for storing bot data

## Usage

### Basic Setup

```typescript
import { Character, createRuntime } from "@elizaos/core";
import { openChatPlugin } from "@elizaos/plugin-openchat";

const character: Character = {
  name: "YourAgent",
  bio: ["An AI agent on OpenChat"],
  plugins: [openChatPlugin],
  clients: ["openchat"],
  settings: {
    secrets: {
      OPENCHAT_PUBLIC_KEY: process.env.OPENCHAT_PUBLIC_KEY,
      OPENCHAT_IC_HOST: process.env.OPENCHAT_IC_HOST,
      OPENCHAT_IDENTITY_PRIVATE_KEY: process.env.OPENCHAT_IDENTITY_PRIVATE_KEY,
      OPENCHAT_STORAGE_CANISTER_ID: process.env.OPENCHAT_STORAGE_CANISTER_ID,
    }
  }
};

const runtime = await createRuntime(character);
await runtime.start();
```

### With Eliza CLI

1. **Create a new Eliza project**:
```bash
npx eliza create my-openchat-agent
cd my-openchat-agent
```

2. **Install the plugin**:
```bash
npm install @elizaos/plugin-openchat
```

3. **Configure your character** (in `characters/your-character.json`):
```json
{
  "name": "MyOpenChatAgent",
  "bio": ["An AI agent on OpenChat"],
  "plugins": ["@elizaos/plugin-openchat"],
  "clients": ["openchat"],
  "settings": {
    "secrets": {
      "OPENCHAT_PUBLIC_KEY": "${OPENCHAT_PUBLIC_KEY}",
      "OPENCHAT_IC_HOST": "${OPENCHAT_IC_HOST}",
      "OPENCHAT_IDENTITY_PRIVATE_KEY": "${OPENCHAT_IDENTITY_PRIVATE_KEY}",
      "OPENCHAT_STORAGE_CANISTER_ID": "${OPENCHAT_STORAGE_CANISTER_ID}"
    }
  }
}
```

4. **Set environment variables** in `.env`:
```env
OPENCHAT_PUBLIC_KEY=your_key
OPENCHAT_IC_HOST=https://icp0.io
OPENCHAT_IDENTITY_PRIVATE_KEY=your_private_key
OPENCHAT_STORAGE_CANISTER_ID=your_canister_id
```

5. **Run your agent**:
```bash
npm start
```

## Architecture

### Bot Endpoints

The plugin creates an Express server with the following endpoints:

- `GET /bot_definition` - Returns bot schema for OpenChat
- `POST /execute_command` - Handles commands from OpenChat users

### How It Works

1. **User sends message** on OpenChat → `/execute_command` endpoint
2. **Plugin receives message** → Creates Eliza memory
3. **Eliza processes** → Generates response using character config
4. **Plugin sends response** → Back to OpenChat via Bot Client
5. **User sees response** on OpenChat

### Available Actions

#### Send Message
```typescript
// Send a message to OpenChat
{
  action: "SEND_OPENCHAT_MESSAGE",
  text: "Hello from Eliza!"
}
```

#### React to Message
```typescript
// Add a reaction to a message
{
  action: "REACT_TO_OPENCHAT_MESSAGE",
  messageId: 12345n,
  reaction: "👍"
}
```

#### Delete Message
```typescript
// Delete a message
{
  action: "DELETE_OPENCHAT_MESSAGE",
  messageId: 12345n
}
```

#### Get Chat Info
```typescript
// Get information about current chat
{
  action: "GET_OPENCHAT_INFO"
}
```

## Testing

### Local Testing

1. **Start your agent**:
```bash
npm start
```

2. **Verify bot definition**:
```bash
curl http://localhost:3000/bot_definition
```

3. **Register bot on OpenChat**:
   - Go to OpenChat bot settings
   - Add your bot URL: `http://your-server:3000`
   - Test commands in OpenChat

### Testing with ngrok (for local development)

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the ngrok URL for bot registration
# Example: https://abc123.ngrok.io
```

## Bot Commands

The plugin registers the following commands in OpenChat:

- `/chat <message>` - Chat with your agent
- `/prompt <text>` - Send a prompt to your agent

## Development

### Project Structure

```
plugin-openchat/
├── src/
│   ├── index.ts              # Plugin entry point
│   ├── client.ts             # OpenChat client implementation
│   ├── types.ts              # TypeScript types
│   ├── environment.ts        # Environment validation
│   ├── actions/              # Plugin actions
│   │   ├── sendMessage.ts
│   │   ├── reactToMessage.ts
│   │   ├── deleteMessage.ts
│   │   ├── getChatInfo.ts
│   │   └── index.ts
│   └── providers/            # Context providers
│       ├── messageProvider.ts
│       └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

## Resources

- [OpenChat](https://oc.app) - OpenChat application
- [OpenChat Bot SDK](https://github.com/open-chat-labs/open-chat-bots) - Official bot SDK
- [Eliza OS Documentation](https://docs.elizaos.ai/) - Eliza framework docs
- [Internet Computer](https://internetcomputer.org/) - ICP blockchain

## Permissions

The bot requests the following permissions on OpenChat:

**Message Permissions:**
- Send text messages

**Chat Permissions:**
- Read messages
- React to messages
- Delete messages (own messages)
- Read chat summary

## Troubleshooting

### Bot not receiving messages
- Check that your bot server is running and accessible
- Verify environment variables are set correctly
- Check OpenChat bot registration is complete

### Authentication errors
- Verify `OPENCHAT_PUBLIC_KEY` matches your OpenChat configuration
- Check that `OPENCHAT_IDENTITY_PRIVATE_KEY` is valid
- Ensure JWT token is being passed in requests

### Connection issues
- Verify `OPENCHAT_IC_HOST` is correct (usually `https://icp0.io`)
- Check network connectivity to Internet Computer
- Ensure firewall allows connections

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT

## Credits

Built with:
- [Eliza OS](https://elizaos.ai/) - AI agent framework
- [OpenChat](https://oc.app) - Decentralized chat on ICP
- [@open-ic/openchat-botclient-ts](https://www.npmjs.com/package/@open-ic/openchat-botclient-ts) - OpenChat Bot SDK

---

Made with ❤️ for the Eliza OS and OpenChat communities
