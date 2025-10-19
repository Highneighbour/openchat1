# OpenChat Integration with ElizaOS

This repository contains a complete integration between OpenChat (oc.app) and ElizaOS, enabling AI agents to interact with the decentralized messaging platform on the Internet Computer.

## Repository Contents

### 1. Basic OpenChat Bot (Root Directory)
A simple example OpenChat bot that demonstrates the basic structure:
- Receives messages from OpenChat
- Sends back responses
- Uses the OpenChat Bot SDK

**Files:**
- `app.ts` - Express application setup
- `server.ts` - Server entry point
- `factory.ts` - Bot client factory
- `handlers/` - Command handlers
- `middleware/` - Bot client middleware

### 2. ElizaOS Plugin (`plugin-openchat/`)
A comprehensive ElizaOS plugin that provides full OpenChat integration:
- Complete bot functionality
- ElizaOS action system
- Provider system for context
- Evaluator system for decision making
- Production-ready implementation

## Quick Navigation

- **Getting Started with the Plugin**: [`plugin-openchat/QUICKSTART.md`](plugin-openchat/QUICKSTART.md)
- **Full Plugin Documentation**: [`plugin-openchat/README.md`](plugin-openchat/README.md)
- **Integration Guide**: [`plugin-openchat/INTEGRATION.md`](plugin-openchat/INTEGRATION.md)
- **Examples**: [`plugin-openchat/examples/`](plugin-openchat/examples/)
- **Implementation Summary**: [`plugin-openchat/SUMMARY.md`](plugin-openchat/SUMMARY.md)

## What is OpenChat?

[OpenChat](https://oc.app) is a fully decentralized chat application built on the Internet Computer blockchain. Unlike traditional messaging apps:
- **Fully on-chain** - All data stored on blockchain
- **No central servers** - Truly decentralized
- **User-owned data** - You control your information
- **Bot-friendly** - Rich bot API and SDK

## What is ElizaOS?

[ElizaOS](https://docs.elizaos.ai/) is an agent operating system that enables the creation and deployment of AI agents with:
- Character-based personalities
- Plugin architecture
- Memory and state management
- Multi-platform support
- Rich action system

## The Integration

This integration combines the best of both platforms:

```
┌─────────────────┐
│   OpenChat      │
│   (oc.app)      │
└────────┬────────┘
         │ Webhooks
         ▼
┌─────────────────┐
│ OpenChat Bot    │
│ Server (Express)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ElizaOS Plugin  │
│ • Actions       │
│ • Providers     │
│ • Evaluators    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ElizaOS Runtime │
│ • Character     │
│ • Memory        │
│ • State         │
└─────────────────┘
```

## Features

### For Users
- 🤖 Deploy AI agents on OpenChat
- 💬 Natural language conversations
- 🎯 Character-based personalities
- 🔄 Real-time responses
- 📊 Rich interactions (polls, reactions, etc.)

### For Developers
- 🛠️ Plugin architecture
- 📦 Modular actions
- 🔌 Extensible providers
- ⚙️ Customizable evaluators
- 📚 Comprehensive documentation
- 💻 TypeScript support

## Getting Started

### Option 1: Use the Plugin (Recommended)

If you want to run an ElizaOS agent on OpenChat:

```bash
# 1. Install ElizaOS
npm install -g @eliza/cli

# 2. Create a new agent
npx eliza create my-openchat-agent

# 3. Install the plugin
cd my-openchat-agent
npm install /path/to/plugin-openchat

# 4. Configure (see QUICKSTART.md)
# 5. Run!
npm start
```

Full guide: [`plugin-openchat/QUICKSTART.md`](plugin-openchat/QUICKSTART.md)

### Option 2: Study the Basic Bot

If you want to understand OpenChat bot basics:

```bash
# 1. Install dependencies
npm install

# 2. Configure .env
cp .env.example .env
# Edit .env with your credentials

# 3. Run the bot
npm start
```

## Configuration

### Required Credentials

Get these from [OpenChat](https://oc.app):
```env
OC_PUBLIC=your_openchat_public_key
IC_HOST=https://icp-api.io
IDENTITY_PRIVATE=your_identity_private_key
STORAGE_INDEX_CANISTER=your_storage_canister_id
```

### Plugin Configuration

See [`plugin-openchat/.env.example`](plugin-openchat/.env.example)

## Architecture Overview

### Basic Bot Architecture
```
OpenChat → Webhook → Express → Handler → Response
```

### Plugin Architecture
```
OpenChat → Bot Server → Client → Runtime → Actions/Providers → Response
```

## Key Capabilities

### Actions
- ✅ Send messages
- ✅ Add reactions
- ✅ Create polls
- ✅ Delete messages
- ✅ Get chat info

### Providers
- ✅ Chat context
- ✅ User information
- ✅ Member lists
- ✅ Chat summaries

### Evaluators
- ✅ Response decisions
- ✅ Sentiment analysis
- ✅ Topic detection

## Documentation

### Plugin Documentation
1. **[QUICKSTART.md](plugin-openchat/QUICKSTART.md)** - Get started in 5 minutes
2. **[README.md](plugin-openchat/README.md)** - Full documentation
3. **[INTEGRATION.md](plugin-openchat/INTEGRATION.md)** - Integration guide
4. **[SUMMARY.md](plugin-openchat/SUMMARY.md)** - Implementation details
5. **[examples/](plugin-openchat/examples/)** - Code examples

### API Documentation
- OpenChat Bot SDK: [GitHub](https://github.com/open-chat-labs/open-chat-bots)
- ElizaOS: [Documentation](https://docs.elizaos.ai/)
- Internet Computer: [Developer Docs](https://internetcomputer.org/docs)

## Examples

### Basic Character Configuration
```json
{
  "name": "MyAgent",
  "plugins": ["@eliza/plugin-openchat"],
  "bio": ["I'm an AI agent on OpenChat"],
  "topics": ["OpenChat", "ICP", "AI"]
}
```

Full examples: [`plugin-openchat/examples/`](plugin-openchat/examples/)

## Development

### Building the Plugin
```bash
cd plugin-openchat
npm install
npm run build
```

### Running Tests
```bash
npm test  # Coming soon
```

### Development Mode
```bash
npm run dev  # Watch mode
```

## Deployment

### Development
- Use ngrok for local testing
- Test all features before production

### Production
- Deploy to Railway, Heroku, or VPS
- Use PM2 for process management
- Enable monitoring and logging
- Set up proper environment variables

See [`plugin-openchat/INTEGRATION.md`](plugin-openchat/INTEGRATION.md) for details.

## Project Structure

```
.
├── app.ts                    # Basic bot app
├── server.ts                 # Basic bot server
├── factory.ts                # Bot client factory
├── handlers/                 # Basic bot handlers
├── middleware/               # Basic bot middleware
├── types.ts                  # Basic bot types
├── plugin-openchat/          # ElizaOS Plugin
│   ├── src/
│   │   ├── actions/          # Plugin actions
│   │   ├── providers/        # Plugin providers
│   │   ├── evaluators/       # Plugin evaluators
│   │   ├── types/            # Plugin types
│   │   ├── client.ts         # OpenChat client
│   │   ├── bot-server.ts     # Bot server
│   │   └── index.ts          # Plugin entry
│   ├── examples/             # Usage examples
│   ├── dist/                 # Compiled code
│   ├── README.md             # Plugin docs
│   ├── QUICKSTART.md         # Quick start
│   ├── INTEGRATION.md        # Integration guide
│   └── SUMMARY.md            # Implementation summary
├── package.json
└── README.md                 # This file
```

## Contributing

Contributions are welcome! Areas for improvement:
- Additional actions
- More evaluators
- Enhanced providers
- Testing suite
- More examples
- Documentation improvements

## Troubleshooting

### Common Issues

**Plugin not loading**
- Check environment variables
- Verify ElizaOS installation
- Review logs for errors

**Bot not responding**
- Verify OpenChat registration
- Check bot server is running
- Test webhook endpoints

**Build errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript version
- Verify dependencies

Full troubleshooting: [`plugin-openchat/QUICKSTART.md`](plugin-openchat/QUICKSTART.md)

## Resources

### Documentation
- [OpenChat Docs](https://oc.app/docs)
- [OpenChat Bot SDK](https://github.com/open-chat-labs/open-chat-bots)
- [ElizaOS Docs](https://docs.elizaos.ai/)
- [Internet Computer](https://internetcomputer.org/)

### Community
- OpenChat Community
- ElizaOS Discord
- ICP Developer Forum

### Support
- GitHub Issues
- Community Forums
- Documentation

## License

MIT License - See [LICENSE](plugin-openchat/LICENSE)

## Acknowledgments

- **OpenChat Team** - For the excellent bot SDK and platform
- **ElizaOS Team** - For the agent framework
- **Internet Computer** - For the decentralized infrastructure
- **Community** - For support and feedback

## Version Information

- **Plugin Version**: 0.1.0
- **OpenChat SDK**: ^1.0.61
- **Node.js**: 18+
- **Status**: Production Ready ✅

## What's Next?

1. **Get Started**: Follow [`QUICKSTART.md`](plugin-openchat/QUICKSTART.md)
2. **Customize**: Check [`examples/`](plugin-openchat/examples/)
3. **Deploy**: Read [`INTEGRATION.md`](plugin-openchat/INTEGRATION.md)
4. **Extend**: Add custom actions and providers
5. **Share**: Contribute back to the community!

---

**Ready to build AI agents on OpenChat?**

Start with: [`plugin-openchat/QUICKSTART.md`](plugin-openchat/QUICKSTART.md)

---

Built with ❤️ for the OpenChat and ElizaOS communities 🚀
