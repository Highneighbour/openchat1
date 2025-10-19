# OpenChat Plugin - Quick Start Guide

## 🚀 Get Your ElizaOS Agent on OpenChat in 5 Steps!

---

## Step 1: Install Dependencies

```bash
cd plugin-openchat
npm install
npm run build
```

---

## Step 2: Generate Bot Identity

```bash
# Generate private key
openssl ecparam -genkey -name secp256k1 -out private_key.pem

# Note: You'll need this key for configuration
cat private_key.pem
```

---

## Step 3: Get OpenChat Configuration

1. Visit [oc.app](https://oc.app) and log in
2. Click your profile → **Advanced**
3. Click **"Bot client data"**
4. Copy these values:
   - OpenChat Public Key
   - IC Host URL  
   - Storage Index Canister ID

---

## Step 4: Configure Environment

Create `.env` file:

```env
# Paste the values from Step 3
OPENCHAT_PUBLIC_KEY=<from_openchat>
IC_HOST=https://ic0.app
IDENTITY_PRIVATE_KEY=<paste_private_key_pem_contents>
STORAGE_INDEX_CANISTER=<from_openchat>

# Optional
OPENCHAT_BOT_PORT=3000
```

---

## Step 5: Test Locally with ElizaOS

### Option A: Using ElizaOS CLI

```bash
# Install ElizaOS CLI
npm install -g @elizaos/cli

# Create a test agent
elizaos create my-openchat-agent
cd my-openchat-agent

# Link the plugin
npm link /workspace/plugin-openchat

# Edit character file to include plugin
# Add: "plugins": ["@elizaos/plugin-openchat"]

# Start the agent
elizaos start
```

### Option B: Import in Your ElizaOS Project

```bash
cd /your/elizaos/project
npm install /workspace/plugin-openchat
```

Add to your character file:
```json
{
  "name": "MyAgent",
  "plugins": ["@elizaos/plugin-openchat"],
  "settings": {
    "secrets": {
      "OPENCHAT_PUBLIC_KEY": "${OPENCHAT_PUBLIC_KEY}",
      "IC_HOST": "${IC_HOST}",
      "IDENTITY_PRIVATE_KEY": "${IDENTITY_PRIVATE_KEY}",
      "STORAGE_INDEX_CANISTER": "${STORAGE_INDEX_CANISTER}"
    }
  }
}
```

---

## Step 6: Register Bot on OpenChat

1. **Enable Developer Mode** in OpenChat:
   - Settings → Advanced → Enable "Developer mode"

2. **Get Your Bot's Principal**:
   ```bash
   # You'll need the OpenChat SDK for this
   # Or get it from the bot when it starts
   ```

3. **Register the Bot**:
   - In any OpenChat chat, type: `/register_bot`
   - Fill in:
     - **Name**: YourBotName
     - **Principal**: Your bot's principal
     - **Endpoint**: `http://localhost:3000`
   - Click **Register**

4. **OpenChat validates** your bot by calling `/bot_definition`

---

## Step 7: Install in a Chat

1. **Create a test group**:
   - Click "New Group" in OpenChat
   - Name it "Bot Test"
   - Create

2. **Add the bot**:
   - Open group members panel
   - Click "Add bots" tab
   - Select your bot
   - Click "Install"

---

## Step 8: Test It!

In your test group, send a message:

```
/chat Hello bot!
```

You should see:
```
🤔 Thinking...
Hello! I'm an AI agent powered by ElizaOS. How can I help you today?
```

**🎉 Success! Your agent is now live on OpenChat!**

---

## 🔧 Troubleshooting

### Bot Not Responding?

**Check the logs:**
```bash
# Look for these messages in your terminal:
[OpenChat] Bot server started on port 3000
[OpenChat] Executing command: chat
[OpenChat] Chat command handled
```

**Common fixes:**
- Make sure port 3000 is available
- Check `.env` file has all required variables
- Verify bot is installed in the chat
- Check endpoint is correct in bot registration

### Can't Register Bot?

**Verify bot definition is accessible:**
```bash
curl http://localhost:3000/bot_definition
```

Should return JSON with bot definition.

**Check:**
- Server is running
- Port is correct
- No firewall blocking

### Need Public URL?

For production or testing from OpenChat servers:

```bash
# Use ngrok or similar
ngrok http 3000

# Use the ngrok URL when registering:
# https://abc123.ngrok.io
```

---

## 📚 Need More Help?

- **Full Documentation**: See `/workspace/plugin-openchat/README.md`
- **Testing Guide**: See `/workspace/plugin-openchat/TESTING.md`
- **Technical Details**: See `/workspace/plugin-openchat/SUMMARY.md`
- **Status Report**: See `/workspace/OPENCHAT_PLUGIN_STATUS.md`

---

## 🎯 What You Have

✅ Full OpenChat bot integration
✅ AI-powered responses via ElizaOS
✅ Message sending and receiving
✅ Context awareness (chat history, user info)
✅ Event handling (installs, member changes)
✅ Production-ready architecture

---

## 🚀 Next Steps

1. **Customize your agent** - Edit the character file
2. **Add more actions** - Extend functionality
3. **Deploy to production** - Use PM2 or Docker
4. **Publish your bot** - Make it public on OpenChat
5. **Scale up** - Add to multiple chats

---

**Happy building! 🤖✨**

*For detailed instructions, see: `/workspace/plugin-openchat/TESTING.md`*
