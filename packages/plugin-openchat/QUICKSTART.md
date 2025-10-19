# OpenChat Plugin Quick Start Guide

This guide will help you set up and test the OpenChat plugin for ElizaOS in minutes.

## Prerequisites

- Node.js 18+ installed
- ElizaOS CLI installed (`npm install -g @elizaos/cli`)
- Access to OpenChat (oc.app) or a local OpenChat instance

## Step 1: Generate Bot Identity

First, generate a private key for your bot:

```bash
# Generate a secp256k1 private key
openssl ecparam -genkey -name secp256k1 -out private_key.pem

# View the key (keep this secure!)
cat private_key.pem
```

Get your bot's principal:

```bash
# You'll need @dfinity/identity-secp256k1 package
npm install -g @dfinity/identity-secp256k1 @dfinity/principal

# Create a script to get the principal
cat > get_principal.js << 'EOF'
const { Secp256k1KeyIdentity } = require('@dfinity/identity-secp256k1');
const fs = require('fs');

const pemKey = fs.readFileSync('private_key.pem', 'utf8');
const identity = Secp256k1KeyIdentity.fromPem(pemKey);
console.log('Bot Principal:', identity.getPrincipal().toText());
EOF

node get_principal.js
```

Save the principal - you'll need it to register your bot.

## Step 2: Get OpenChat Configuration

1. Go to OpenChat (https://oc.app or your local instance)
2. Click your profile → Advanced
3. Click "Bot client data"
4. Copy:
   - OpenChat Public Key
   - OpenStorage Canister ID
   - IC Host URL

## Step 3: Set Up ElizaOS Project

```bash
# Create a new ElizaOS project
npx @elizaos/cli create my-openchat-bot

# Navigate to project
cd my-openchat-bot

# Install the OpenChat plugin (local development)
npm install /path/to/plugin-openchat

# Or if published:
# npm install @elizaos/plugin-openchat
```

## Step 4: Configure Your Agent

Create or edit your character file at `characters/openchat-agent.json`:

```json
{
  "name": "OpenChat Assistant",
  "bio": "A helpful AI assistant on OpenChat",
  "lore": [
    "I'm an ElizaOS agent running on OpenChat",
    "I can help with questions and conversations"
  ],
  "messageExamples": [
    [
      {
        "user": "{{user1}}",
        "content": { "text": "Hello!" }
      },
      {
        "user": "OpenChat Assistant",
        "content": { "text": "Hi! How can I help you?" }
      }
    ]
  ],
  "plugins": ["@elizaos/plugin-openchat"],
  "settings": {
    "OPENCHAT_PUBLIC_KEY": "paste_your_public_key_here",
    "OPENCHAT_IC_HOST": "https://ic0.app",
    "OPENCHAT_IDENTITY_PRIVATE_KEY": "paste_your_pem_key_here",
    "OPENCHAT_STORAGE_INDEX_CANISTER": "paste_your_canister_id_here",
    "OPENCHAT_BOT_PORT": "3000"
  }
}
```

**Important**: Replace the placeholder values with your actual configuration!

## Step 5: Start Your Agent

```bash
# Start the agent
npm run dev

# Or use the ElizaOS CLI
npx @elizaos/cli start --character characters/openchat-agent.json
```

You should see:
```
✓ ElizaOS initialized
✓ OpenChat plugin loaded
✓ OpenChat bot server running on port 3000
```

## Step 6: Register Your Bot on OpenChat

1. Open OpenChat (https://oc.app)
2. In any chat, type `/register_bot`
3. Fill in the registration form:
   - **Name**: OpenChat Assistant (or your bot name)
   - **Principal**: (paste the principal from Step 1)
   - **Endpoint**: 
     - Local: `http://localhost:3000`
     - Production: `https://your-domain.com`
4. Review the bot definition and click "Register"

## Step 7: Install Your Bot

1. Create a test group or go to an existing one
2. Click on members panel
3. Go to "Add bots" tab
4. Find your bot and click "Install"
5. Grant the requested permissions

## Step 8: Test Your Bot

In your OpenChat chat, try:

```
/chat Hello! What can you do?
```

The bot should respond with an AI-generated message!

Try more commands:
```
/chat Tell me about OpenChat
/chat What's the weather like?
/chat Can you help me with something?
```

## Troubleshooting

### Bot Not Responding

1. **Check the server is running**:
   ```bash
   curl http://localhost:3000/bot_definition
   ```
   You should see JSON with your bot definition.

2. **Check logs**:
   Look at your terminal where the agent is running for error messages.

3. **Verify configuration**:
   - Ensure all environment variables are set correctly
   - Check that the principal matches your private key
   - Verify the public key is correct for your environment

### JWT Validation Errors

- Make sure `OPENCHAT_PUBLIC_KEY` matches your OpenChat environment
- Verify your private key is properly formatted with line breaks

### "Bot client not initialized" Error

- Check that the JWT token is being sent in the `x-oc-jwt` header
- Verify your OpenChat instance is sending requests correctly

### Port Already in Use

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port in your character settings
"OPENCHAT_BOT_PORT": "3001"
```

## Next Steps

### Customize Your Bot

Edit your character file to:
- Change personality and behavior
- Add custom message examples
- Adjust topics and adjectives
- Add more lore

### Add More Actions

Create custom actions that work with OpenChat:

```typescript
// In your project
import type { Action } from '@elizaos/core';

export const customAction: Action = {
  name: 'MY_CUSTOM_ACTION',
  description: 'Does something cool',
  validate: async (runtime, message) => true,
  handler: async (runtime, message) => {
    // Your logic here
    return { success: true };
  }
};
```

### Deploy to Production

1. Set up a server (VPS, cloud, etc.)
2. Install Node.js and dependencies
3. Set production environment variables
4. Start your bot with PM2 or similar:
   ```bash
   npm install -g pm2
   pm2 start npm --name "openchat-bot" -- start
   ```
5. Register your bot with the production URL

### Multi-Platform Integration

Add more platforms:

```json
{
  "plugins": [
    "@elizaos/plugin-openchat",
    "@elizaos/plugin-discord",
    "@elizaos/plugin-telegram"
  ]
}
```

## Getting Help

- **OpenChat Documentation**: https://github.com/open-chat-labs/open-chat-bots
- **ElizaOS Documentation**: https://docs.elizaos.ai
- **OpenChat Community**: Join on oc.app
- **GitHub Issues**: Report bugs or request features

## Advanced Configuration

### Custom Bot Definition

You can customize the bot definition by modifying the service:

```typescript
// In your custom service extension
private getBotDefinition() {
  return {
    description: "Custom description",
    commands: [
      {
        name: "custom_command",
        description: "A custom command",
        // ... more config
      }
    ]
  };
}
```

### Multiple Commands

Add more commands to your bot by extending the bot definition in the service.

### Autonomous Mode

The plugin supports autonomous mode where the bot can:
- React to messages without being explicitly called
- Monitor conversations
- Send proactive messages

This requires configuring the `default_subscriptions` in the bot definition.

## Example Projects

Check out complete example projects:
- [Simple Q&A Bot](./examples/simple-bot)
- [Multi-Platform Bot](./examples/multi-platform)
- [Advanced AI Assistant](./examples/advanced-assistant)

---

**Congratulations!** 🎉 You now have an ElizaOS agent running on OpenChat!
