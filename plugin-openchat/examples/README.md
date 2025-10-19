# OpenChat Plugin Examples

This directory contains examples for using the OpenChat plugin with ElizaOS.

## Files

### `character.json`
A complete character configuration file that you can use as a template for your own OpenChat bot. This character is designed to be helpful and knowledgeable about OpenChat.

**Usage:**
```bash
# Copy to your Eliza project
cp character.json /path/to/your/eliza-project/characters/openchat-bot.json

# Edit the character file to customize it
# Then run your agent
```

### `basic-agent.ts`
A TypeScript example showing how to programmatically create an OpenChat agent.

**Usage:**
```typescript
import { basicAgent } from "./examples/basic-agent.ts";
import { AgentRuntime } from "@eliza/core";

const runtime = new AgentRuntime({
  character: basicAgent,
  // ... other config
});
```

## Quick Start

### 1. Set Up Environment Variables

Create a `.env` file:
```env
OC_PUBLIC=your_openchat_public_key
IC_HOST=https://icp-api.io
IDENTITY_PRIVATE=your_identity_private_key
STORAGE_INDEX_CANISTER=your_storage_index_canister_id
OPENCHAT_BOT_PORT=3000
```

### 2. Install Dependencies

```bash
npm install @eliza/core @eliza/plugin-openchat
```

### 3. Create Your Agent

**Option A: Using JSON Character File**
```bash
# Copy the example character
cp examples/character.json ./my-agent.json

# Run with Eliza CLI
npx eliza start --character ./my-agent.json
```

**Option B: Using TypeScript**
```typescript
import { Character, AgentRuntime } from "@eliza/core";
import { openChatPlugin } from "@eliza/plugin-openchat";

const character: Character = {
  name: "MyBot",
  plugins: [openChatPlugin],
  // ... rest of your character config
};

const runtime = new AgentRuntime({ character });
```

### 4. Register Your Bot on OpenChat

1. Start your agent (bot server will run on configured port)
2. Go to OpenChat bot registry
3. Register your bot with the URL: `http://your-server:3000/bot_definition`
4. Your bot is now live on OpenChat! 🎉

## Customization Tips

### Personality

Edit the `style` section to change how your bot communicates:
```json
{
  "style": {
    "all": [
      "Be super enthusiastic",
      "Use lots of emojis 🎉",
      "Keep responses short and punchy"
    ]
  }
}
```

### Knowledge

Add topics your bot should be knowledgeable about:
```json
{
  "topics": [
    "Cryptocurrency",
    "DeFi",
    "NFTs",
    "Gaming"
  ]
}
```

### Message Examples

Add more message examples to train your bot's responses:
```json
{
  "messageExamples": [
    [
      {
        "user": "{{user1}}",
        "content": { "text": "Your question" }
      },
      {
        "user": "YourBot",
        "content": { "text": "Your bot's response" }
      }
    ]
  ]
}
```

## Advanced Examples

### Bot with Custom Actions

```typescript
import { openChatPlugin, OpenChatClient } from "@eliza/plugin-openchat";
import { Action } from "@eliza/core";

const customAction: Action = {
  name: "ANNOUNCE_TO_CHAT",
  description: "Makes an announcement to the chat",
  validate: async (runtime, message) => {
    // Your validation logic
    return true;
  },
  handler: async (runtime, message) => {
    const client = runtime.clients.find(
      c => c instanceof OpenChatClient
    );
    // Your custom logic
    return true;
  },
  examples: [],
};

const character: Character = {
  name: "Announcer",
  plugins: [openChatPlugin],
  actions: [customAction],
  // ... rest of config
};
```

### Bot with Memory and Context

```typescript
const character: Character = {
  name: "MemoryBot",
  plugins: [openChatPlugin],
  bio: [
    "I remember our conversations",
    "I can recall previous topics",
  ],
  style: {
    all: [
      "Reference previous conversations when relevant",
      "Build on past topics",
      "Show continuity in discussions",
    ],
  },
};
```

## Testing Your Bot

### Local Testing

1. Start your bot locally:
```bash
npm run dev
```

2. Test the bot definition endpoint:
```bash
curl http://localhost:3000/bot_definition
```

3. Test the health endpoint:
```bash
curl http://localhost:3000/health
```

### Production Deployment

1. Deploy to your preferred hosting (e.g., Railway, Heroku, VPS)
2. Set environment variables in your hosting platform
3. Register the bot on OpenChat with your production URL
4. Monitor logs for any issues

## Troubleshooting

### Bot doesn't respond
- Check that all environment variables are set correctly
- Verify the bot is registered on OpenChat
- Check server logs for errors

### Commands not working
- Ensure the bot has proper permissions in the chat
- Verify the command is defined in bot_definition
- Check that the user has permission to use the command

### Getting help
- Check the main README.md
- Review OpenChat bot documentation
- Join the ElizaOS community

## More Examples Coming Soon!

We're working on more examples including:
- Multi-language bot
- Bot with external API integration
- Bot with database storage
- Bot with scheduled messages
- Community moderation bot

Stay tuned! 🚀
