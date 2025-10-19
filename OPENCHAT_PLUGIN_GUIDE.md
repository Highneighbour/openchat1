# OpenChat ElizaOS Plugin - Complete Integration Guide

This document provides a comprehensive guide for the OpenChat plugin integration with ElizaOS.

## 🎯 What This Plugin Does

The `@elizaos/plugin-openchat` bridges ElizaOS AI agents with OpenChat (oc.app), enabling:

1. **Bi-directional Communication**: Your ElizaOS agent can send and receive messages on OpenChat
2. **OpenChat Bot Integration**: The plugin includes a full OpenChat bot server that handles commands
3. **ElizaOS Plugin Architecture**: Follows ElizaOS conventions with actions, providers, and services
4. **Seamless Integration**: Works with existing ElizaOS features like memory, context, and multi-agent systems

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       OpenChat (oc.app)                      │
│                  Internet Computer Blockchain                │
└──────────────────────────┬──────────────────────────────────┘
                           │ JWT Commands
                           │ Messages
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              OpenChat Plugin Express Server                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  /bot_definition   - Bot capabilities schema        │   │
│  │  /execute_command  - Handle user commands           │   │
│  │  /notify          - Autonomous events               │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  OpenChatService (ElizaOS)                   │
│  • Manages bot lifecycle                                     │
│  • Handles JWT authentication                                │
│  • Routes messages to ElizaOS runtime                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    ElizaOS Runtime                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Actions    │  │  Providers   │  │  Evaluators  │     │
│  │              │  │              │  │              │     │
│  │ • Send Msg   │  │ • Context    │  │ • Quality    │     │
│  │ • React      │  │ • History    │  │ • Sentiment  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  • Memory Management                                         │
│  • Context Composition                                       │
│  • AI Model Integration                                      │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Project Structure

```
packages/plugin-openchat/
├── src/
│   ├── actions/              # ElizaOS actions
│   │   ├── sendMessage.ts    # Send messages to OpenChat
│   │   ├── reactToMessage.ts # React to messages
│   │   └── index.ts
│   ├── providers/            # ElizaOS providers
│   │   ├── chatContext.ts    # Current chat context
│   │   ├── messageHistory.ts # Message history
│   │   └── index.ts
│   ├── services/             # ElizaOS services
│   │   └── openchat.service.ts # Main OpenChat service
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   └── index.ts             # Plugin entry point
├── examples/
│   ├── character.json       # Example character file
│   └── usage.md            # Usage examples
├── package.json
├── tsconfig.json
├── README.md               # Plugin documentation
├── QUICKSTART.md          # Quick start guide
└── TESTING.md            # Testing guide
```

## 🚀 Quick Start

### 1. Installation

```bash
# Install the plugin
npm install @elizaos/plugin-openchat

# Or for local development
cd packages/plugin-openchat
npm install
npm run build
```

### 2. Configuration

Create your bot identity:

```bash
# Generate private key
openssl ecparam -genkey -name secp256k1 -out private_key.pem

# Get bot principal (save this for registration)
node -e "
const { Secp256k1KeyIdentity } = require('@dfinity/identity-secp256k1');
const fs = require('fs');
const key = fs.readFileSync('private_key.pem', 'utf8');
const identity = Secp256k1KeyIdentity.fromPem(key);
console.log(identity.getPrincipal().toText());
"
```

Get OpenChat configuration from oc.app:
- Profile → Advanced → "Bot client data"
- Copy: Public Key, Storage Canister, IC Host

### 3. Create Your Agent

```json
{
  "name": "OpenChat Assistant",
  "bio": "Your helpful AI assistant on OpenChat",
  "plugins": ["@elizaos/plugin-openchat"],
  "settings": {
    "OPENCHAT_PUBLIC_KEY": "your_public_key",
    "OPENCHAT_IC_HOST": "https://ic0.app",
    "OPENCHAT_IDENTITY_PRIVATE_KEY": "your_pem_key",
    "OPENCHAT_STORAGE_INDEX_CANISTER": "your_canister_id",
    "OPENCHAT_BOT_PORT": "3000"
  }
}
```

### 4. Run Your Agent

```bash
npx @elizaos/cli start --character character.json
```

### 5. Register on OpenChat

1. Go to OpenChat (https://oc.app)
2. Type `/register_bot`
3. Enter your bot details
4. Install in a test group
5. Test with `/chat Hello!`

## 🎯 Key Features

### Actions

#### SEND_OPENCHAT_MESSAGE
Send messages to OpenChat rooms/channels.

```typescript
await runtime.processAction('SEND_OPENCHAT_MESSAGE', {
  content: { text: 'Hello OpenChat!' },
  roomId: 'your-chat-id'
});
```

#### REACT_TO_OPENCHAT_MESSAGE
React to messages with emojis.

```typescript
await runtime.processAction('REACT_TO_OPENCHAT_MESSAGE', {
  messageId: 'msg-id',
  emoji: '👍'
});
```

### Providers

#### OPENCHAT_CHAT_CONTEXT
Provides current chat context (name, ID, type).

#### OPENCHAT_MESSAGE_HISTORY
Provides recent message history for context.

### Service

#### OpenChatService
- Manages bot server lifecycle
- Handles JWT authentication
- Routes commands to ElizaOS
- Manages message sending

## 🔧 Development

### Building

```bash
cd packages/plugin-openchat
npm run build
```

### Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Local Development with ElizaOS

```bash
# In plugin directory
npm link

# In your ElizaOS project
npm link @elizaos/plugin-openchat

# Start development
npm run dev
```

## 📚 Documentation

- **[README.md](./packages/plugin-openchat/README.md)** - Full plugin documentation
- **[QUICKSTART.md](./packages/plugin-openchat/QUICKSTART.md)** - Get started in minutes
- **[TESTING.md](./packages/plugin-openchat/TESTING.md)** - Testing guide
- **[examples/usage.md](./packages/plugin-openchat/examples/usage.md)** - Usage examples

## 🌐 How It Works

### Message Flow

1. **User sends command on OpenChat**
   ```
   User: /chat Hello bot!
   ```

2. **OpenChat authenticates and sends JWT**
   ```
   POST /execute_command
   Header: x-oc-jwt: <signed-jwt-token>
   ```

3. **Plugin validates JWT and creates BotClient**
   ```typescript
   const botClient = factory.createClientFromCommandJwt(token);
   ```

4. **Create ElizaOS memory from message**
   ```typescript
   const memory: Memory = {
     userId: botClient.context.initiator,
     content: { text: 'Hello bot!' },
     roomId: botClient.chatId,
     // ...
   };
   ```

5. **ElizaOS processes with AI**
   ```typescript
   const state = await runtime.composeState(memory);
   const response = await runtime.generateText(prompt, { state });
   ```

6. **Send response back to OpenChat**
   ```typescript
   await botClient.sendTextMessage(response.text);
   ```

### Bot Definition

The plugin automatically generates a bot definition schema that OpenChat uses:

```typescript
{
  description: "Your bot description",
  commands: [
    {
      name: "chat",
      description: "Chat with the AI",
      params: [/* ... */]
    }
  ],
  autonomous_config: {
    permissions: [/* ... */]
  }
}
```

## 🔐 Security

- **JWT Validation**: All commands are JWT-authenticated by OpenChat
- **Permission System**: Bot requests specific permissions, granted by chat owners
- **Environment Variables**: Sensitive keys stored as environment variables
- **Input Validation**: All inputs sanitized and validated

## 🚢 Deployment

### Development

```bash
npm run dev
# Bot runs on localhost:3000
# Register with http://localhost:3000
```

### Production

```bash
# Build
npm run build

# Set production environment variables
export NODE_ENV=production
export OPENCHAT_PUBLIC_KEY=...
# ... other vars

# Start with PM2
pm2 start npm --name openchat-bot -- start

# Register with your public URL
# https://your-domain.com
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t openchat-bot .
docker run -d -p 3000:3000 --env-file .env openchat-bot
```

## 🤝 Integration with ElizaOS

### Multi-Platform Agents

```json
{
  "plugins": [
    "@elizaos/plugin-openchat",
    "@elizaos/plugin-discord",
    "@elizaos/plugin-telegram"
  ]
}
```

Your agent will respond on all platforms simultaneously!

### Custom Actions

Create actions that work specifically with OpenChat:

```typescript
export const myOpenChatAction: Action = {
  name: 'MY_OPENCHAT_ACTION',
  validate: async (runtime, message, state) => {
    return state?.platform === 'openchat';
  },
  handler: async (runtime, message) => {
    const ocService = runtime.getService('OPENCHAT');
    // Your logic here
  }
};
```

### Memory & Context

The plugin integrates with ElizaOS memory system:
- Messages are stored in memory database
- Context is composed from message history
- Agents remember past conversations
- Works across platforms

## 📊 Monitoring

Recommended monitoring:
- Response times (< 2s target)
- Error rates (< 1% target)
- Memory usage
- OpenChat API calls
- JWT validation success rate

## 🐛 Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check server is running: `curl localhost:3000/bot_definition`
   - Verify environment variables
   - Check logs for errors

2. **JWT validation fails**
   - Verify OPENCHAT_PUBLIC_KEY matches environment
   - Check token expiration

3. **Messages not sending**
   - Verify bot has permissions
   - Check chat ID is correct
   - Review OpenChat API logs

See [TESTING.md](./packages/plugin-openchat/TESTING.md) for detailed debugging.

## 🎓 Learning Resources

- [OpenChat Bot Documentation](https://github.com/open-chat-labs/open-chat-bots)
- [ElizaOS Documentation](https://docs.elizaos.ai)
- [Internet Computer](https://internetcomputer.org)
- [OpenChat Website](https://oc.app)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

## 📝 License

MIT

## 🙏 Acknowledgments

- OpenChat team for the bot SDK
- ElizaOS community
- Internet Computer ecosystem

---

**Ready to deploy your AI agent on OpenChat?** Start with the [Quick Start Guide](./packages/plugin-openchat/QUICKSTART.md)!
