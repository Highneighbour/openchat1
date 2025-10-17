# Solution: Running the OpenChat Bot Server

## The Issue You Encountered

When you ran `curl http://localhost:3000/bot_definition`, you got HTML (the Eliza web UI) instead of JSON. This happened because:

1. **Port 3000** is being used by the Eliza OS web client
2. **The OpenChat bot server** (which should return JSON) is **NOT running**
3. These are **two separate servers** that need to run independently

---

## ✅ Solution: Run on Different Port

The OpenChat bot server needs its own port. Here's how to set it up:

### Quick Fix (5 minutes)

```bash
# 1. Go to the plugin directory
cd plugin-openchat

# 2. Create .env file
cp .env.test .env

# 3. Edit .env and set your OpenChat credentials
nano .env  # or use your favorite editor

# 4. Set the bot port to 3001 (not 3000)
# Add this line in .env:
OPENCHAT_BOT_PORT=3001

# 5. Run the bot server
npm run start:bot
```

### Test It

In another terminal:

```bash
curl http://localhost:3001/bot_definition
```

You should now see **JSON** with your bot configuration! ✅

---

## Step-by-Step Guide

### 1. Configure Environment

Create `/workspace/plugin-openchat/.env`:

```env
# OpenChat Configuration
OPENCHAT_PUBLIC_KEY=your_actual_public_key
OPENCHAT_IC_HOST=https://icp0.io
OPENCHAT_IDENTITY_PRIVATE_KEY=your_actual_private_key
OPENCHAT_STORAGE_CANISTER_ID=your_actual_canister_id

# Use port 3001 (since 3000 is taken by Eliza UI)
OPENCHAT_BOT_PORT=3001

# Bot info
BOT_NAME=MyElizaBot
BOT_BIO=An AI assistant on OpenChat
```

### 2. Build the Plugin

```bash
cd /workspace/plugin-openchat
npm install
npm run build
```

### 3. Start the Bot Server

```bash
npm run start:bot
```

You should see:

```
🚀 Starting OpenChat Bot Server (Standalone Mode)...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Initializing OpenChat client...
✅ OpenChat client initialized
📡 OpenChat bot routes configured
🚀 OpenChat bot server running on port 3001
📡 Bot definition available at: http://localhost:3001/bot_definition
💬 Command endpoint at: http://localhost:3001/execute_command
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ OpenChat bot server is running!

📡 Endpoints:
   • Bot Definition: http://localhost:3001/bot_definition
   • Execute Command: http://localhost:3001/execute_command

🔗 Use this URL to register your bot on OpenChat

Press Ctrl+C to stop the server
```

### 4. Test the Endpoints

```bash
# In another terminal
curl http://localhost:3001/bot_definition
```

Expected output (JSON):

```json
{
  "description": "MyElizaBot - An AI assistant on OpenChat",
  "autonomous_config": {
    "permissions": "..."
  },
  "commands": [
    {
      "name": "chat",
      "description": "Chat with MyElizaBot",
      ...
    }
  ]
}
```

✅ **Success!** Your bot server is running correctly.

---

## Using the Test Script

I've created a helper script for you:

```bash
cd /workspace/plugin-openchat
./test-bot.sh
```

This script will:
- ✅ Check for .env file
- ✅ Build if needed
- ✅ Start the bot server
- ✅ Show helpful messages

---

## Expose for OpenChat Registration

Once your bot is running locally, expose it with ngrok:

```bash
# Install ngrok (if not installed)
npm install -g ngrok

# Expose port 3001
ngrok http 3001
```

You'll get a URL like: `https://abc123.ngrok.io`

**Use this URL to register your bot on OpenChat!**

---

## Architecture Diagram

```
┌─────────────────────────────────────┐
│  Eliza OS Web Client                │
│  http://localhost:3000              │  ← Your existing Eliza UI
│  (Returns HTML)                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  OpenChat Bot Server                │
│  http://localhost:3001              │  ← NEW: Bot API server
│  (Returns JSON for OpenChat)       │
│                                     │
│  Endpoints:                         │
│  • GET  /bot_definition             │
│  • POST /execute_command            │
└─────────────────────────────────────┘
            ↕
┌─────────────────────────────────────┐
│  OpenChat Platform (oc.app)         │
│  • Sends commands to bot            │
│  • Receives responses               │
└─────────────────────────────────────┘
```

---

## Two Ways to Run

### Option A: Standalone (What you're doing now)

✅ **Good for**: Testing, development, simple bots  
✅ **Setup**: Very simple  
❌ **AI**: Basic echo responses only  

```bash
cd plugin-openchat
npm run start:bot
```

### Option B: Fully Integrated with Eliza

✅ **Good for**: Production, full AI capabilities  
✅ **AI**: Full Eliza AI with memory, context, etc.  
❌ **Setup**: More complex  

See [HOW_TO_RUN.md](./plugin-openchat/HOW_TO_RUN.md) for details.

---

## Troubleshooting

### Still Getting HTML?

**Check:**
1. Is bot server actually running? (Look for the success message)
2. Are you curling the right port? (3001, not 3000)
3. Is `OPENCHAT_BOT_PORT=3001` set in .env?

**Try:**
```bash
# Check what's running on each port
curl http://localhost:3000  # Should return Eliza web UI (HTML)
curl http://localhost:3001  # Should return bot definition (JSON)
```

### Port Already in Use

If you get "port already in use":

```env
# Use a different port
OPENCHAT_BOT_PORT=3002
```

Then test: `curl http://localhost:3002/bot_definition`

### Missing Environment Variables

If you see errors about missing env vars:

1. Make sure `.env` file exists in `/workspace/plugin-openchat/`
2. Check all required variables are set:
   - `OPENCHAT_PUBLIC_KEY`
   - `OPENCHAT_IC_HOST`
   - `OPENCHAT_IDENTITY_PRIVATE_KEY`
   - `OPENCHAT_STORAGE_CANISTER_ID`

---

## Next Steps

1. ✅ **Get bot running** - Follow steps above
2. ✅ **Test endpoints** - Verify JSON responses
3. ✅ **Expose with ngrok** - Make accessible to OpenChat
4. ✅ **Register on OpenChat** - Use ngrok URL
5. ✅ **Test with /chat** - Send a message!
6. 🚀 **Deploy to production** - Move from ngrok to real hosting

---

## Files to Check

- `/workspace/plugin-openchat/.env` - Your configuration
- `/workspace/plugin-openchat/HOW_TO_RUN.md` - Detailed run guide
- `/workspace/plugin-openchat/test-bot.sh` - Quick test script
- `/workspace/plugin-openchat/QUICKSTART.md` - General quick start

---

## Summary

The key insight is:

> **Eliza Web UI (port 3000)** and **OpenChat Bot Server (port 3001)** are separate services.

You need to:
1. Run the OpenChat bot server on a different port (3001)
2. Test it with curl to verify JSON responses
3. Use ngrok to expose it
4. Register that URL on OpenChat

**You're almost there!** Just need to get the bot server running on its own port. 🚀

---

Need help? Read:
- [HOW_TO_RUN.md](./plugin-openchat/HOW_TO_RUN.md)
- [TESTING.md](./plugin-openchat/TESTING.md)
- [QUICKSTART.md](./plugin-openchat/QUICKSTART.md)
