# OpenChat Plugin - Quick Start Guide

Get your ElizaOS agent running on OpenChat in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- ElizaOS CLI installed (`npm install -g @eliza/cli` or similar)
- OpenChat bot credentials (get them from [oc.app](https://oc.app))

## Step 1: Install the Plugin

### In an existing ElizaOS project:

```bash
# Navigate to your project
cd my-eliza-project

# Install the plugin locally
npm install /path/to/plugin-openchat

# Or if published to npm:
npm install @eliza/plugin-openchat
```

### Creating a new project with ElizaOS:

```bash
# Create a new Eliza agent
npx eliza create my-openchat-agent
cd my-openchat-agent

# Install the plugin
npm install /path/to/plugin-openchat
```

## Step 2: Get OpenChat Bot Credentials

1. Visit [OpenChat](https://oc.app)
2. Go to Settings → Bots → Register New Bot
3. Note down these credentials:
   - `OC_PUBLIC` - Your bot's public key
   - `IDENTITY_PRIVATE` - Your bot's private identity key
   - `STORAGE_INDEX_CANISTER` - Storage canister ID

## Step 3: Configure Environment

Create a `.env` file in your project root:

```env
# Required: OpenChat credentials
OC_PUBLIC=your_public_key_here
IDENTITY_PRIVATE=your_private_key_here
STORAGE_INDEX_CANISTER=your_canister_id_here

# Required: Internet Computer host
IC_HOST=https://icp-api.io

# Optional: Custom port
OPENCHAT_BOT_PORT=3000
```

## Step 4: Configure Your Character

Create or edit `characters/my-agent.json`:

```json
{
  "name": "MyAgent",
  "plugins": ["@eliza/plugin-openchat"],
  "bio": [
    "I'm an AI agent on OpenChat",
    "I can help with various tasks"
  ],
  "lore": ["I run on ElizaOS and the Internet Computer"],
  "messageExamples": [
    [
      {
        "user": "{{user1}}",
        "content": { "text": "Hello!" }
      },
      {
        "user": "MyAgent",
        "content": { "text": "Hi! How can I help you?" }
      }
    ]
  ],
  "topics": ["OpenChat", "AI", "Help"],
  "style": {
    "all": ["Be friendly and helpful"],
    "chat": ["Respond promptly"]
  }
}
```

## Step 5: Start Your Agent

```bash
# Using Eliza CLI
npx eliza start --character ./characters/my-agent.json

# Or with npm script
npm run dev

# Or with pnpm
pnpm start
```

You should see:
```
✓ OpenChat plugin initialized successfully
✓ OpenChat bot server running on port 3000
ℹ Bot definition available at http://localhost:3000/bot_definition
```

## Step 6: Make Your Bot Accessible

### For Local Testing (ngrok):

```bash
# In a new terminal
ngrok http 3000

# Note the HTTPS URL (e.g., https://abc123.ngrok.io)
```

### For Production:

Deploy to a hosting service:
- Railway: `railway up`
- Heroku: `git push heroku main`
- VPS: Use PM2 or systemd

## Step 7: Register on OpenChat

1. Go to [OpenChat](https://oc.app)
2. Navigate to Settings → Bots → My Bots
3. Click "Add Bot Endpoint"
4. Enter your bot definition URL:
   - Local: `https://your-ngrok-url.ngrok.io/bot_definition`
   - Production: `https://your-domain.com/bot_definition`
5. Save and activate your bot

## Step 8: Test Your Bot

1. Find your bot on OpenChat
2. Send a message using the `/chat` command:
   ```
   /chat message: Hello, bot!
   ```
3. Your bot should respond!

## Troubleshooting

### Bot not responding?

Check the logs:
```bash
# Your agent logs should show incoming requests
```

Verify bot definition:
```bash
curl http://localhost:3000/bot_definition
```

Check health:
```bash
curl http://localhost:3000/health
```

### "Cannot find module" errors?

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Port already in use?

Change the port:
```bash
OPENCHAT_BOT_PORT=3001 npm start
```

## Next Steps

- 📖 Read the [full documentation](README.md)
- 🔧 Customize your agent's personality
- 🚀 Explore [advanced features](INTEGRATION.md)
- 💡 Check out [examples](examples/)

## Common Commands

```bash
# Start in development mode
npm run dev

# Build the plugin
npm run build

# Check health
curl http://localhost:3000/health

# View bot definition
curl http://localhost:3000/bot_definition

# View logs
tail -f logs/agent.log  # if you set up logging
```

## Example Character (Copy-Paste Ready)

```json
{
  "name": "OpenChatHelper",
  "plugins": ["@eliza/plugin-openchat"],
  "bio": [
    "I'm a helpful assistant on OpenChat",
    "I can answer questions and chat with you",
    "I'm powered by ElizaOS and run on ICP"
  ],
  "lore": [
    "I was created to help users on OpenChat",
    "I understand the Internet Computer ecosystem"
  ],
  "messageExamples": [
    [
      { "user": "{{user1}}", "content": { "text": "What can you do?" } },
      { 
        "user": "OpenChatHelper", 
        "content": { 
          "text": "I can help with many things! I can answer questions, have conversations, and provide information about OpenChat and the Internet Computer. What would you like to know?"
        }
      }
    ],
    [
      { "user": "{{user1}}", "content": { "text": "Tell me about OpenChat" } },
      { 
        "user": "OpenChatHelper", 
        "content": { 
          "text": "OpenChat is a decentralized messaging platform built on the Internet Computer blockchain. It's fully on-chain, which means your messages and data are stored on the blockchain, not on centralized servers. Pretty cool, right?"
        }
      }
    ]
  ],
  "topics": ["OpenChat", "ICP", "Blockchain", "Crypto", "AI", "Help"],
  "adjectives": ["helpful", "friendly", "knowledgeable", "patient"],
  "style": {
    "all": [
      "Be conversational and friendly",
      "Provide clear, helpful answers",
      "Show enthusiasm for OpenChat and ICP"
    ],
    "chat": [
      "Respond promptly",
      "Ask follow-up questions",
      "Use emojis occasionally 😊"
    ]
  }
}
```

## Support

- **Issues**: [GitHub Issues](#)
- **Discord**: Join the ElizaOS community
- **OpenChat**: Join the OpenChat developer community
- **Docs**: [Full Documentation](README.md)

---

**Built with ❤️ for OpenChat and ElizaOS**

Need help? Feel free to reach out to the community!
