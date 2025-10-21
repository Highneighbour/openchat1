# 📦 Complete Installation & Testing Guide

## Overview

This guide walks you through installing and testing the **fully fixed** OpenChat plugin with all 5 working actions.

## Prerequisites

- ElizaOS project set up
- OpenChat account
- LLM API key (OpenRouter, Anthropic, or OpenAI)
- Bot private key generated

## Step-by-Step Installation

### 1. Copy the Universal Character

```bash
# Navigate to your ElizaOS project
cd /path/to/your/elizaos/project

# Copy the universal character
cp /workspace/UNIVERSAL_CHARACTER.ts src/character.ts
```

**Why this character?**
- ✅ Works with OpenChat
- ✅ Works with Discord
- ✅ Works with Telegram
- ✅ Works with ANY plugin you add
- ✅ Auto-enables plugins based on env vars

### 2. Install the Plugin

```bash
# Uninstall old version (if exists)
npm uninstall @elizaos/plugin-openchat

# Install the fixed plugin
npm install /workspace/plugin-openchat

# Build your project
npm run build
```

### 3. Configure Environment Variables

Create or edit `.env` file:

```bash
# === OpenChat Configuration ===
OPENCHAT_BOT_IDENTITY_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----
... your private key here ...
-----END EC PRIVATE KEY-----"

OPENCHAT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
... OpenChat public key ...
-----END PUBLIC KEY-----"

OPENCHAT_IC_HOST="https://ic0.app"
OPENCHAT_STORAGE_INDEX_CANISTER="6hsbt-vqaaa-aaaaf-aaafq-cai"
OPENCHAT_BOT_PORT=3001

# === LLM Provider (choose one) ===
OPENROUTER_API_KEY="sk-or-v1-..."
# OR
# ANTHROPIC_API_KEY="sk-ant-..."
# OR
# OPENAI_API_KEY="sk-..."

# === Optional: Other Platforms ===
# DISCORD_API_TOKEN="..."
# TELEGRAM_BOT_TOKEN="..."
```

### 4. Generate Bot Private Key (if needed)

```bash
# Generate secp256k1 private key
openssl ecparam -genkey -name secp256k1 -out private_key.pem

# View the key
cat private_key.pem

# Copy the entire content (including BEGIN/END lines) to OPENCHAT_BOT_IDENTITY_PRIVATE_KEY
```

### 5. Start Your Bot

```bash
npm start
```

**Look for this message:**
```
╔════════════════════════════════════════════════════════════╗
║                  OpenChat Bot Ready                       ║
╠════════════════════════════════════════════════════════════╣
║  Bot server running on port 3001                          ║
║  Bot definition: http://localhost:3001/bot_definition     ║
║                                                            ║
║  Next steps:                                               ║
║  1. Register bot on OpenChat using /register_bot          ║
║  2. Install bot in desired chats/groups                   ║
║  3. Users can interact via /chat command                  ║
╚════════════════════════════════════════════════════════════╝
```

### 6. Register Bot on OpenChat

On OpenChat (oc.app):

```
/register_bot http://your-server-url:3001
```

**Note:** If testing locally, you need to expose port 3001:
- Use ngrok: `ngrok http 3001`
- Or use a VPS/cloud server

### 7. Install Bot in Group/Channel

1. Go to your OpenChat group or channel
2. Click "Members" → "Add Bots"
3. Find your bot and click "Install"
4. Grant permissions:
   - ✅ **Text** - Send messages
   - ✅ **ReadMessages** - Read chat history
   - ✅ **ReactToMessages** - Add reactions
   - ✅ **DeleteMessages** - Delete messages (moderation)
   - ✅ **ReadChatSummary** - Get group info

## 🧪 Testing Each Action

### Test 1: SEND_OPENCHAT_MESSAGE

**From ElizaOS Web UI** (http://localhost:3000):

```
User: "Send a message to the OpenChat group saying hello everyone"
```

**Expected Response:**
```
Agent: "Message sent to OpenChat successfully"
```

**Verify on OpenChat:**
- Message "hello everyone" appears in the group

**Logs to check:**
```
[OpenChat] Service found!
[OpenChat] Sending message: "hello everyone"...
[OpenChat] ✅ Message sent successfully
```

---

### Test 2: READ_OPENCHAT_MESSAGES

**From ElizaOS Web UI:**

```
User: "What are the recent messages in the OpenChat group?"
```

**Expected Response:**
```
Agent: "Found 10 messages. Latest: '...'"
```

**Logs to check:**
```
[OpenChat] Reading messages...
[OpenChat] ✅ Read 10 messages
```

---

### Test 3: GET_OPENCHAT_SUMMARY

**From ElizaOS Web UI:**

```
User: "Get the summary of the OpenChat group"
```

**Expected Response:**
```
Agent: "OpenChat Group Summary:
• Latest Event: 12345
• Type: chat
• Status: Active"
```

**Logs to check:**
```
[OpenChat] Getting chat summary...
[OpenChat] ✅ Got chat summary
```

---

### Test 4: REACT_TO_OPENCHAT_MESSAGE

**From ElizaOS Web UI:**

```
User: "React with 👍 to message <messageId>"
```

**Note:** You need to provide messageId in options  
**Expected:** Reaction added to OpenChat message

---

### Test 5: DELETE_OPENCHAT_MESSAGE

**From ElizaOS Web UI:**

```
User: "Delete message <messageId>"
```

**Note:** Requires DeleteMessages permission  
**Expected:** Message deleted from OpenChat

---

## 🔍 Troubleshooting

### Issue: "OpenChat service not available"

**Solution:**
1. Check plugin is in character.ts plugins array
2. Verify env vars are set
3. Look for "OpenChat Bot Ready" message in startup logs
4. Check service registration:
   ```javascript
   const service = runtime.getService("openchat");
   console.log(service);
   ```

### Issue: "No installations found"

**Solution:**
1. Register bot on OpenChat first
2. Install bot in a group/channel
3. Check `/notify` endpoint received installation event
4. Look for log: `[OpenChat] Installation saved: chat-...`

### Issue: "No permission to..."

**Solution:**
1. Grant the required permission when installing bot
2. Reinstall bot with updated permissions
3. Check granted permissions in installation event

### Issue: Actions not triggering

**Solution:**
1. Verify action validation passes (check logs)
2. Ensure character is using `UNIVERSAL_CHARACTER.ts`
3. Check ElizaOS recognizes the action:
   ```
   "actions": ["SEND_OPENCHAT_MESSAGE"]
   ```

### Issue: Messages not appearing on OpenChat

**Solution:**
1. Check `result.kind === "success"` in logs
2. Verify bot has Text permission
3. Check OpenChat group allows bot messages
4. Try a simple test: `/chat hello` on OpenChat

## 📋 Pre-Flight Checklist

Before testing, ensure:

- [ ] `UNIVERSAL_CHARACTER.ts` copied to `src/character.ts`
- [ ] Plugin installed: `npm install /workspace/plugin-openchat`
- [ ] Project built: `npm run build`
- [ ] All env vars set (OpenChat + LLM provider)
- [ ] Bot started: `npm start`
- [ ] "OpenChat Bot Ready" message appears
- [ ] Bot registered on OpenChat
- [ ] Bot installed in a group/channel
- [ ] Permissions granted (at least Text)

## 🎯 Success Criteria

After installation, you should be able to:

✅ Send messages to OpenChat from ElizaOS  
✅ Read OpenChat message history  
✅ Get OpenChat group summaries  
✅ React to OpenChat messages  
✅ Delete OpenChat messages (if granted)  
✅ Chat with bot via `/chat` on OpenChat  
✅ See AI-generated responses  
✅ No error messages in logs  

## 🚀 What's Next?

Once basic actions work:

1. **Autonomous Messaging** - Bot posts without commands
2. **Event Subscriptions** - React to member joins, reactions, etc.
3. **Multiple Groups** - Support multiple OpenChat installations
4. **Advanced Moderation** - Auto-delete spam, warnings
5. **Cross-Platform** - Sync messages between Discord/Telegram/OpenChat
6. **Custom Commands** - Add your own commands
7. **Scheduled Posts** - Automated announcements

## 📞 Support

If you encounter issues:

1. **Check logs** - Look for specific error messages
2. **Verify env vars** - Ensure all required vars are set
3. **Test incrementally** - Start with sendMessage, then add others
4. **Check permissions** - Grant all permissions during installation
5. **Review docs** - See `COMPLETE_PLUGIN_READY.md` for details

---

**All actions are ready and follow proven patterns from production OpenChat bots!** 🎉

Follow this guide step-by-step for successful installation and testing.
