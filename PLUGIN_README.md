# OpenChat Plugin for Eliza OS

This repository contains a complete **OpenChat plugin for Eliza OS** that enables AI agents to interact with OpenChat (oc.app), a decentralized chat platform on the Internet Computer Protocol.

## 📁 Repository Structure

```
.
├── plugin-openchat/           # The Eliza OS plugin (main deliverable)
│   ├── src/
│   │   ├── index.ts          # Plugin entry point
│   │   ├── client.ts         # OpenChat client integration
│   │   ├── types.ts          # TypeScript definitions
│   │   ├── environment.ts    # Environment configuration
│   │   ├── actions/          # Plugin actions
│   │   │   ├── sendMessage.ts
│   │   │   ├── reactToMessage.ts
│   │   │   ├── deleteMessage.ts
│   │   │   ├── getChatInfo.ts
│   │   │   └── index.ts
│   │   └── providers/        # Context providers
│   │       ├── messageProvider.ts
│   │       └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md             # Plugin documentation
│   ├── INTEGRATION_GUIDE.md  # Step-by-step integration guide
│   ├── CHANGELOG.md          # Version history
│   ├── .env.example          # Environment variables template
│   └── example-character.json # Example agent configuration
│
└── [original bot files]       # Original OpenChat bot example
    ├── app.ts
    ├── server.ts
    ├── factory.ts
    ├── handlers/
    └── middleware/
```

## 🚀 What Was Built

### 1. **Complete Eliza OS Plugin** (`plugin-openchat/`)

A production-ready plugin that follows Eliza OS plugin architecture:

- ✅ **Client Integration**: Full OpenChat bot client that integrates with Eliza runtime
- ✅ **Actions**: 4 core actions for interacting with OpenChat
- ✅ **Providers**: Context providers for enriching agent responses
- ✅ **TypeScript**: Fully typed with comprehensive type definitions
- ✅ **Documentation**: Extensive docs with examples and guides

### 2. **Key Features**

#### OpenChat Client (`src/client.ts`)
- Express server with bot endpoints
- JWT authentication with OpenChat
- Command handling (chat, prompt, ask)
- Integration with Eliza runtime for AI responses
- Memory management for conversations
- Bot definition endpoint for OpenChat registration

#### Actions (`src/actions/`)
- **Send Message**: Send text messages to OpenChat
- **React to Message**: Add emoji reactions
- **Delete Message**: Remove messages
- **Get Chat Info**: Retrieve chat/conversation details

#### Providers (`src/providers/`)
- **Message Provider**: Provides OpenChat context to the agent

#### Environment Management (`src/environment.ts`)
- Validation of required environment variables
- Configuration management
- Helpful error messages

### 3. **Documentation**

- **README.md**: Complete plugin documentation
- **INTEGRATION_GUIDE.md**: Step-by-step integration instructions
- **CHANGELOG.md**: Version history and roadmap
- **.env.example**: Template for environment variables
- **example-character.json**: Example agent configuration

## 🎯 How It Works

### Architecture Flow

```
OpenChat User → OpenChat Platform → Bot Endpoint (/execute_command)
                                          ↓
                                    OpenChat Client
                                          ↓
                                    Eliza Runtime
                                          ↓
                                    AI Model (GPT, Claude, etc.)
                                          ↓
                                    Response Generation
                                          ↓
                                    OpenChat Client
                                          ↓
                            OpenChat Platform → OpenChat User
```

### Integration Points

1. **Express Server**: Handles HTTP requests from OpenChat
2. **Bot Client**: Uses `@open-ic/openchat-botclient-ts` SDK
3. **Eliza Runtime**: Processes messages and generates responses
4. **Memory System**: Stores conversation history
5. **Actions**: Provide additional capabilities to the agent

## 📦 Installation & Usage

### For Testing in Eliza OS

1. **Install Eliza CLI** (if not already):
```bash
npm install -g @elizaos/cli
```

2. **Create new Eliza project**:
```bash
eliza create my-openchat-agent
cd my-openchat-agent
```

3. **Install the plugin locally**:
```bash
npm install /path/to/this/repo/plugin-openchat
```

4. **Configure environment** (`.env`):
```env
OPENCHAT_PUBLIC_KEY=your_key
OPENCHAT_IC_HOST=https://icp0.io
OPENCHAT_IDENTITY_PRIVATE_KEY=your_private_key
OPENCHAT_STORAGE_CANISTER_ID=your_canister_id
```

5. **Create character** using `example-character.json` as template

6. **Run your agent**:
```bash
npm start
```

### Character Configuration

```json
{
  "name": "MyAgent",
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

## 🧪 Testing

### 1. Start Your Agent
```bash
npm start
```

### 2. Check Bot Definition
```bash
curl http://localhost:3000/bot_definition
```

### 3. Test with ngrok (for local dev)
```bash
ngrok http 3000
# Use the ngrok URL to register bot on OpenChat
```

### 4. Register on OpenChat
1. Go to [OpenChat](https://oc.app)
2. Navigate to bot settings
3. Register your bot with the endpoint URL
4. Test by sending commands to your bot!

## 🔑 Getting OpenChat Credentials

To use this plugin, you need:

1. **OpenChat Public Key**: For JWT verification
2. **Identity Private Key**: Your bot's identity on Internet Computer
3. **Storage Canister ID**: For storing bot data
4. **IC Host**: Usually `https://icp0.io`

See [OpenChat Bot Documentation](https://github.com/open-chat-labs/open-chat-bots) for details on obtaining these credentials.

## 📚 Available Commands

Once registered, your bot will respond to:

- `/chat <message>` - Chat with your AI agent
- `/prompt <text>` - Send a prompt to your agent

The agent uses your character configuration and Eliza's AI to generate natural, contextual responses.

## 🛠️ Development

### Build Plugin
```bash
cd plugin-openchat
npm run build
```

### Watch Mode
```bash
npm run dev
```

### Clean Build
```bash
npm run clean
```

## 🌟 Features Summary

✅ **Full Plugin Implementation**
- Client, Actions, Providers
- TypeScript with full type safety
- Follows Eliza OS plugin standards

✅ **Bidirectional Communication**
- Receive messages from OpenChat
- Send AI-generated responses
- React, delete, and manage messages

✅ **Production Ready**
- Error handling
- Logging with elizaLogger
- Environment validation
- Comprehensive documentation

✅ **Extensible**
- Easy to add new actions
- Customizable character templates
- Pluggable architecture

## 📖 Resources

- [Eliza OS Documentation](https://docs.elizaos.ai/)
- [OpenChat Bot SDK](https://github.com/open-chat-labs/open-chat-bots)
- [Internet Computer](https://internetcomputer.org/)
- [OpenChat Platform](https://oc.app)

## 🤝 Contributing

This plugin is ready for:
- Testing and feedback
- Feature additions
- Bug reports
- Documentation improvements

## 📄 License

MIT

---

**Built for the Eliza OS and OpenChat communities** 🚀

This plugin enables AI agents to join the decentralized web through OpenChat on the Internet Computer Protocol. It's a bridge between advanced AI (Eliza OS) and decentralized communication (OpenChat).
