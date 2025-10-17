# Quick Start Guide - OpenChat Plugin for Eliza OS

Get your OpenChat bot running in 5 minutes! 🚀

## Prerequisites

- Node.js 18+ installed
- An OpenChat bot account (get from [oc.app](https://oc.app))
- OpenAI API key (or other LLM provider)

## Step-by-Step Setup

### 1️⃣ Install Eliza CLI

```bash
npm install -g @elizaos/cli
```

### 2️⃣ Create New Eliza Project

```bash
eliza create my-openchat-bot
cd my-openchat-bot
```

### 3️⃣ Install OpenChat Plugin

```bash
# If plugin is in parent directory
npm install ../plugin-openchat

# Or if published
npm install @elizaos/plugin-openchat
```

### 4️⃣ Set Up Environment

Create `.env` file in your project root:

```env
# OpenChat Configuration
OPENCHAT_PUBLIC_KEY=your_openchat_public_key
OPENCHAT_IC_HOST=https://icp0.io
OPENCHAT_IDENTITY_PRIVATE_KEY=your_bot_private_key
OPENCHAT_STORAGE_CANISTER_ID=your_storage_canister_id
OPENCHAT_BOT_PORT=3000

# AI Model Configuration (choose one)
OPENAI_API_KEY=your_openai_key
# OR
ANTHROPIC_API_KEY=your_anthropic_key
# OR
LLAMACLOUD_API_KEY=your_llamacloud_key
```

### 5️⃣ Create Your Bot Character

Create `characters/my-bot.json`:

```json
{
  "name": "MyBot",
  "bio": ["An AI assistant on OpenChat"],
  "plugins": ["@elizaos/plugin-openchat"],
  "clients": ["openchat"],
  "modelProvider": "openai",
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

### 6️⃣ Start Your Bot

```bash
npm start
```

You should see:
```
🤖 Initializing OpenChat client...
✅ OpenChat client initialized
🚀 OpenChat bot server running on port 3000
```

### 7️⃣ Test Locally

```bash
# In a new terminal
curl http://localhost:3000/bot_definition
```

You should see JSON with your bot's configuration.

### 8️⃣ Expose Locally (for testing)

```bash
# Install ngrok
npm install -g ngrok

# Expose your bot
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

### 9️⃣ Register on OpenChat

1. Go to [OpenChat](https://oc.app)
2. Navigate to Settings → Bots → Register New Bot
3. Enter your bot endpoint URL: `https://abc123.ngrok.io`
4. Complete the registration form
5. Save your bot

### 🔟 Test Your Bot!

In OpenChat:
1. Find your bot in the bot list
2. Send a message: `/chat Hello!`
3. Wait for the AI response
4. Success! 🎉

## Troubleshooting

### Bot not starting?
- Check all environment variables are set
- Verify port 3000 is available
- Check console for error messages

### Can't connect from OpenChat?
- Ensure ngrok is running
- Verify the URL is accessible: `curl https://your-ngrok-url.ngrok.io/bot_definition`
- Check firewall settings

### Bot not responding?
- Check your AI provider API key is valid
- Look at console logs for errors
- Verify OpenChat credentials are correct

## What's Next?

- **Customize**: Edit your character JSON to change personality
- **Deploy**: Move from ngrok to production hosting
- **Extend**: Add custom actions to your bot
- **Monitor**: Set up logging and monitoring

## Resources

- [Full Documentation](./README.md)
- [Integration Guide](./INTEGRATION_GUIDE.md)
- [Testing Guide](./TESTING.md)
- [OpenChat Docs](https://github.com/open-chat-labs/open-chat-bots)
- [Eliza OS Docs](https://docs.elizaos.ai/)

## Need Help?

- Review the [README](./README.md) for detailed info
- Check [TESTING.md](./TESTING.md) for debugging
- See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for advanced setup

---

**You're now running an AI agent on OpenChat!** 🎉🤖

The bot will:
- ✅ Receive messages from OpenChat users
- ✅ Process them with AI (GPT, Claude, etc.)
- ✅ Send intelligent responses back
- ✅ Remember conversation context
- ✅ Work 24/7 autonomously

Enjoy building with Eliza OS and OpenChat! 🚀
