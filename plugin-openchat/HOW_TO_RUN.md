# How to Run the OpenChat Bot

There are **two ways** to run the OpenChat bot:

## Option 1: Standalone Bot Server (Recommended for Testing)

Run the bot server independently, separate from Eliza:

### Step 1: Configure Environment

Create `.env` in the `plugin-openchat/` directory:

```env
# OpenChat Configuration
OPENCHAT_PUBLIC_KEY=your_openchat_public_key
OPENCHAT_IC_HOST=https://icp0.io
OPENCHAT_IDENTITY_PRIVATE_KEY=your_bot_private_key
OPENCHAT_STORAGE_CANISTER_ID=your_storage_canister_id
OPENCHAT_BOT_PORT=3001

# Bot Configuration
BOT_NAME=MyElizaBot
BOT_BIO=An AI assistant on OpenChat
```

### Step 2: Build and Run

```bash
cd plugin-openchat

# Install dependencies (if not already done)
npm install

# Build
npm run build

# Run the bot server
npm run start:bot
```

### Step 3: Test It

```bash
# In another terminal
curl http://localhost:3001/bot_definition
```

You should see JSON with your bot configuration! ✅

### Step 4: Expose with ngrok (for OpenChat registration)

```bash
ngrok http 3001
```

Use the ngrok URL to register your bot on OpenChat.

---

## Option 2: Integrated with Eliza Runtime

Run as part of a full Eliza OS project:

### Step 1: Create Eliza Project

```bash
# Create new project
npx create-eliza-app my-openchat-bot
cd my-openchat-bot
```

### Step 2: Install Plugin

```bash
npm install /path/to/plugin-openchat
```

### Step 3: Create Character

Create `characters/openchat-bot.character.json`:

```json
{
  "name": "OpenChatBot",
  "bio": ["An AI assistant on OpenChat"],
  "plugins": ["@elizaos/plugin-openchat"],
  "clients": [],
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

### Step 4: Create Custom Entry Point

Create `src/openchat-bot.ts`:

```typescript
import { createAgent } from "@elizaos/core";
import { OpenChatClient } from "@elizaos/plugin-openchat";
import fs from "fs";
import path from "path";

async function main() {
    // Load character
    const characterPath = path.join(__dirname, "../characters/openchat-bot.character.json");
    const character = JSON.parse(fs.readFileSync(characterPath, "utf-8"));

    // Create agent
    const agent = await createAgent(character);

    // Start OpenChat client
    const openchatClient = new OpenChatClient(agent.runtime);
    await openchatClient.start();

    console.log("✅ OpenChat bot is running!");
}

main().catch(console.error);
```

### Step 5: Configure and Run

```bash
# Set environment variables in .env
# (same as Option 1)

# Build
npm run build

# Run
node dist/openchat-bot.js
```

---

## Quick Comparison

| Feature | Option 1: Standalone | Option 2: Integrated |
|---------|---------------------|---------------------|
| Setup Complexity | ⭐ Simple | ⭐⭐⭐ Complex |
| AI Integration | ❌ Basic echo | ✅ Full Eliza AI |
| Good for Testing | ✅ Yes | ❌ Not ideal |
| Good for Production | ⚠️ Limited | ✅ Yes |
| Memory/Context | ❌ No | ✅ Yes |
| Custom Actions | ❌ No | ✅ Yes |

---

## Recommended Workflow

1. **Start with Option 1** to verify OpenChat integration works
2. **Test bot registration** on OpenChat
3. **Verify commands work** (`/chat`, `/prompt`)
4. **Then move to Option 2** for full AI capabilities

---

## Troubleshooting

### Port Already in Use

If port 3000 is taken by Eliza web UI:

```env
# Use a different port
OPENCHAT_BOT_PORT=3001
```

Then test: `curl http://localhost:3001/bot_definition`

### Environment Variables Not Loading

Make sure `.env` is in the same directory where you run the command:

```bash
cd plugin-openchat
npm run start:bot
```

### Bot Definition Returns HTML

This means you're hitting the wrong server. Make sure:
1. OpenChat bot server is running on the correct port
2. You're curling the right port
3. Check `OPENCHAT_BOT_PORT` in your `.env`

---

## Next Steps

Once your bot server is running:

1. ✅ Test `/bot_definition` endpoint
2. ✅ Expose with ngrok
3. ✅ Register on OpenChat
4. ✅ Test with `/chat` command
5. ✅ Celebrate! 🎉

---

Need help? Check:
- [README.md](./README.md) - Full documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick setup
- [TESTING.md](./TESTING.md) - Testing guide
