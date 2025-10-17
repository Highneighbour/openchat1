# OpenChat Plugin Integration Guide

This guide will walk you through integrating the OpenChat plugin into your Eliza OS agent.

## Quick Start

### Step 1: Install Dependencies

In your Eliza project:

```bash
npm install /path/to/plugin-openchat
# or if published
npm install @elizaos/plugin-openchat
```

### Step 2: Set Up Environment Variables

Create or update your `.env` file:

```env
# OpenChat Bot Credentials
OPENCHAT_PUBLIC_KEY=your_openchat_public_key
OPENCHAT_IC_HOST=https://icp0.io
OPENCHAT_IDENTITY_PRIVATE_KEY=your_identity_private_key
OPENCHAT_STORAGE_CANISTER_ID=your_storage_canister_id
OPENCHAT_BOT_PORT=3000

# Optional: Your AI model API key
OPENAI_API_KEY=your_openai_key
# or
ANTHROPIC_API_KEY=your_anthropic_key
```

### Step 3: Create Character Configuration

Create a character file (`agent/characters/openchat-agent.json`):

```json
{
  "name": "MyOpenChatBot",
  "bio": ["An AI assistant on OpenChat"],
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

### Step 4: Create Main Entry Point

Create `src/index.ts`:

```typescript
import { createAgent } from "@elizaos/core";
import { openChatPlugin } from "@elizaos/plugin-openchat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  // Load character
  const characterPath = path.join(__dirname, "../agent/characters/openchat-agent.json");
  const character = JSON.parse(fs.readFileSync(characterPath, "utf-8"));

  // Create agent with OpenChat plugin
  const agent = await createAgent({
    character,
    plugins: [openChatPlugin],
  });

  // Start agent
  await agent.start();

  console.log("🚀 OpenChat agent is running!");
  console.log("📡 Bot server listening on port 3000");
  console.log("🤖 Bot definition: http://localhost:3000/bot_definition");
}

main().catch(console.error);
```

### Step 5: Run Your Agent

```bash
npm start
```

Your bot should now be running on `http://localhost:3000`!

## Registering Your Bot on OpenChat

### Option 1: Local Testing with ngrok

For local development, use ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose port 3000
ngrok http 3000

# You'll get a URL like: https://abc123.ngrok.io
```

### Option 2: Deploy to Production

Deploy your bot to a cloud service:

- **Vercel**: Serverless deployment
- **Railway**: Container deployment
- **DigitalOcean**: VPS deployment
- **AWS/GCP/Azure**: Cloud deployment

### Register Bot on OpenChat

1. Go to [OpenChat](https://oc.app)
2. Navigate to bot registration
3. Enter your bot's endpoint URL
4. Configure bot permissions
5. Test your bot!

## Advanced Configuration

### Custom Actions

You can add custom actions to your bot:

```typescript
import { Action } from "@elizaos/core";
import { openChatPlugin } from "@elizaos/plugin-openchat";

const customAction: Action = {
  name: "CUSTOM_OPENCHAT_ACTION",
  description: "A custom action for OpenChat",
  validate: async (runtime, message) => true,
  handler: async (runtime, message, state, options, callback) => {
    // Your custom logic here
    const botClient = options?.botClient;
    if (botClient) {
      await botClient.createTextMessage("Custom action executed!");
    }
    return true;
  },
  examples: [],
};

// Add to your character
character.actions = [
  ...openChatPlugin.actions,
  customAction,
];
```

### Custom Message Templates

Customize how your agent responds:

```json
{
  "templates": {
    "chatTemplate": "{{recentMessages}}\n\nRespond as {{agentName}}, a helpful AI on OpenChat. Be friendly and concise.",
    "messageHandlerTemplate": "Context: {{context}}\nMessage: {{message}}\n\nAs {{agentName}}, provide a helpful response."
  }
}
```

### Multiple Agents

Run multiple OpenChat agents:

```typescript
const agent1 = await createAgent({
  character: character1,
  plugins: [openChatPlugin],
});

const agent2 = await createAgent({
  character: character2,
  plugins: [openChatPlugin],
});

// Use different ports
process.env.OPENCHAT_BOT_PORT = "3000";
await agent1.start();

process.env.OPENCHAT_BOT_PORT = "3001";
await agent2.start();
```

## Testing Your Integration

### 1. Check Bot Definition

```bash
curl http://localhost:3000/bot_definition
```

Should return your bot's schema.

### 2. Test Command Endpoint

```bash
curl -X POST http://localhost:3000/execute_command \
  -H "Content-Type: text/plain" \
  -H "x-oc-jwt: your_test_jwt" \
  -d "test message"
```

### 3. Monitor Logs

Watch your console for logs:
- ✅ Success messages (green)
- ⚠️ Warnings (yellow)
- ❌ Errors (red)
- ℹ️ Info messages (blue)

## Troubleshooting

### Bot Not Responding

1. Check environment variables are set
2. Verify bot server is running
3. Check OpenChat bot registration
4. Review console logs for errors

### Authentication Errors

1. Verify `OPENCHAT_PUBLIC_KEY` is correct
2. Check JWT token is valid
3. Ensure private key is properly formatted

### Cannot Connect to Internet Computer

1. Check `OPENCHAT_IC_HOST` is correct
2. Verify network connectivity
3. Check firewall settings

## Production Checklist

- [ ] Environment variables secured
- [ ] Bot registered on OpenChat
- [ ] Server deployed and accessible
- [ ] HTTPS enabled
- [ ] Logging configured
- [ ] Error handling tested
- [ ] Rate limiting configured
- [ ] Monitoring set up

## Resources

- [OpenChat Documentation](https://github.com/open-chat-labs/open-chat-bots)
- [Eliza OS Documentation](https://docs.elizaos.ai/)
- [Internet Computer Documentation](https://internetcomputer.org/docs)

## Support

For issues or questions:
- Open an issue on GitHub
- Join the Eliza OS Discord
- Check OpenChat community channels

Happy bot building! 🤖✨
