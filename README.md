# OpenChat ElizaOS Plugin

This repository contains a comprehensive ElizaOS plugin for OpenChat (oc.app), enabling AI agents to interact seamlessly with the OpenChat platform on the Internet Computer blockchain.

## 🎯 What's Inside

This project includes:

1. **Original OpenChat Bot** (`/` root files) - A basic OpenChat bot example
2. **ElizaOS Plugin** (`/packages/plugin-openchat`) - Full-featured ElizaOS plugin for OpenChat

## 📦 Main Plugin: @elizaos/plugin-openchat

The main deliverable is a production-ready ElizaOS plugin located in `/packages/plugin-openchat/`.

### Features

✅ **Bi-directional Communication** - Send and receive messages on OpenChat  
✅ **Full ElizaOS Integration** - Works with ElizaOS memory, context, and actions  
✅ **OpenChat Bot Server** - Built-in Express server with bot endpoints  
✅ **JWT Authentication** - Secure communication with OpenChat  
✅ **TypeScript** - Fully typed for type safety  
✅ **Actions** - Send messages, react to content, and more  
✅ **Providers** - Chat context and message history  
✅ **Service** - Lifecycle management and bot operations  

## 🚀 Quick Start

See **[HOW_TO_TEST.md](./HOW_TO_TEST.md)** for step-by-step testing instructions.

### Installation

```bash
cd packages/plugin-openchat
npm install
npm run build
```

### Configuration

1. Generate bot identity:
```bash
openssl ecparam -genkey -name secp256k1 -out private_key.pem
```

2. Get OpenChat config from oc.app profile

3. Create character file with your settings

4. Start your agent:
```bash
npx @elizaos/cli start --character character.json
```

## 📚 Documentation

- **[PLUGIN_SUMMARY.md](./PLUGIN_SUMMARY.md)** - Complete overview of what was built
- **[OPENCHAT_PLUGIN_GUIDE.md](./OPENCHAT_PLUGIN_GUIDE.md)** - Comprehensive integration guide
- **[HOW_TO_TEST.md](./HOW_TO_TEST.md)** - Testing instructions
- **[packages/plugin-openchat/README.md](./packages/plugin-openchat/README.md)** - Plugin documentation
- **[packages/plugin-openchat/QUICKSTART.md](./packages/plugin-openchat/QUICKSTART.md)** - Quick start guide
- **[packages/plugin-openchat/TESTING.md](./packages/plugin-openchat/TESTING.md)** - Comprehensive testing guide

## 🏗️ Project Structure

```
.
├── packages/
│   └── plugin-openchat/          # Main ElizaOS plugin
│       ├── src/
│       │   ├── actions/          # ElizaOS actions
│       │   ├── providers/        # Context providers
│       │   ├── services/         # OpenChat service
│       │   └── types/            # TypeScript types
│       ├── examples/             # Example configurations
│       ├── dist/                 # Built files
│       └── README.md            # Plugin documentation
├── app.ts                        # Original bot example
├── server.ts                     # Original bot server
├── handlers/                     # Original bot handlers
├── PLUGIN_SUMMARY.md            # What was built
├── OPENCHAT_PLUGIN_GUIDE.md     # Integration guide
└── HOW_TO_TEST.md               # Testing guide
```

## 🎯 What Makes This Plugin Special

1. **Dual Architecture** - Works as both OpenChat bot and ElizaOS plugin
2. **Full Integration** - Seamlessly integrates with ElizaOS runtime
3. **Production Ready** - Comprehensive error handling and logging
4. **Well Documented** - Extensive documentation and examples
5. **Type Safe** - Full TypeScript support
6. **Tested** - Multiple testing strategies included

## 🔧 Development

### Build the Plugin

```bash
cd packages/plugin-openchat
npm run build
```

### Run Tests

```bash
npm test
```

### Link for Local Development

```bash
cd packages/plugin-openchat
npm link

# In your ElizaOS project
npm link @elizaos/plugin-openchat
```

## 🌐 How It Works

```
User sends command on OpenChat
         ↓
OpenChat authenticates & sends JWT
         ↓
Plugin validates JWT
         ↓
Creates ElizaOS Memory
         ↓
ElizaOS processes with AI
         ↓
Response sent back to OpenChat
```

## 📖 Key Documentation Files

### For Getting Started
- [HOW_TO_TEST.md](./HOW_TO_TEST.md) - Start here for testing
- [packages/plugin-openchat/QUICKSTART.md](./packages/plugin-openchat/QUICKSTART.md) - Quick setup

### For Understanding
- [PLUGIN_SUMMARY.md](./PLUGIN_SUMMARY.md) - What was built
- [OPENCHAT_PLUGIN_GUIDE.md](./OPENCHAT_PLUGIN_GUIDE.md) - Architecture and integration

### For Development
- [packages/plugin-openchat/README.md](./packages/plugin-openchat/README.md) - API docs
- [packages/plugin-openchat/TESTING.md](./packages/plugin-openchat/TESTING.md) - Testing guide

## 🚀 Deployment

The plugin supports multiple deployment options:

1. **Local Development** - Test on localhost
2. **VPS/Cloud** - Deploy to any Node.js hosting
3. **Docker** - Container deployment
4. **PM2** - Process management

See the documentation for detailed deployment guides.

## 🤝 Contributing

Contributions welcome! The plugin follows ElizaOS plugin conventions and is fully typed with TypeScript.

## 📝 License

MIT - See [LICENSE](./packages/plugin-openchat/LICENSE)

## 🙏 Acknowledgments

- OpenChat team for the bot SDK
- ElizaOS community
- Internet Computer ecosystem

## 🔗 Links

- [OpenChat](https://oc.app)
- [OpenChat Bots Documentation](https://github.com/open-chat-labs/open-chat-bots)
- [ElizaOS Documentation](https://docs.elizaos.ai)
- [Internet Computer](https://internetcomputer.org)

---

**Ready to get started?** Head to [HOW_TO_TEST.md](./HOW_TO_TEST.md) for step-by-step testing instructions! 🎉