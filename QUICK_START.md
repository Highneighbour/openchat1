# 🚀 OpenChat Plugin - Quick Start

## ✅ Plugin is Built and Ready!

```
✅ npm run build - SUCCESS
✅ All 5 actions working
✅ No TypeScript errors
✅ Ready to install
```

## 3-Step Installation

### Step 1: Install Plugin

```bash
cd /your/elizaos/project

# Install the plugin
npm install /workspace/plugin-openchat

# Build your project
npm run build
```

### Step 2: Use Universal Character

```bash
# Copy the character
cp /workspace/UNIVERSAL_CHARACTER.ts src/character.ts
```

Or manually add to your character:

```typescript
import type { Character } from '@elizaos/core';

export const character: Character = {
  name: 'Eliza',
  
  plugins: [
    '@elizaos/plugin-sql',
    '@elizaos/plugin-bootstrap',
    
    // Add OpenChat - it will auto-load if env vars are set
    ...(process.env.OPENCHAT_BOT_IDENTITY_PRIVATE_KEY?.trim() 
      ? ['@elizaos/plugin-openchat'] 
      : []),
    
    // Add your LLM provider
    '@elizaos/plugin-openrouter', // or anthropic, openai, etc.
  ],
  
  // ... rest of character config
};
```

### Step 3: Configure Environment

Add to `.env`:

```bash
# OpenChat Bot Configuration
OPENCHAT_BOT_IDENTITY_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----
... your private key ...
-----END EC PRIVATE KEY-----"

OPENCHAT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
... openchat public key ...
-----END PUBLIC KEY-----"

OPENCHAT_IC_HOST="https://ic0.app"
OPENCHAT_STORAGE_INDEX_CANISTER="6hsbt-vqaaa-aaaaf-aaafq-cai"
OPENCHAT_BOT_PORT=3001

# LLM Provider (choose one)
OPENROUTER_API_KEY="sk-or-v1-..."
# or ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.
```

Then start:

```bash
npm start
```

## ✅ Expected Output

You should see:

```
Info #Eliza Initializing OpenChat plugin...
Info #Eliza OpenChat Client Service initialized
Info #Eliza Bot definition available at: http://localhost:3001/bot_definition

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

## 🧪 Quick Test

### 1. Register on OpenChat

On OpenChat (oc.app), use:

```
/register_bot http://your-server-url:3001
```

> **Local Testing:** Use ngrok to expose localhost:
> ```bash
> ngrok http 3001
> ```
> Then use the ngrok URL

### 2. Install in a Group

1. Go to OpenChat group/channel
2. Click "Members" → "Add Bots"
3. Find your bot
4. Click "Install"
5. Grant permissions:
   - ✅ Text (send messages)
   - ✅ ReadMessages (optional: read history)
   - ✅ ReactToMessages (optional: reactions)
   - ✅ DeleteMessages (optional: moderation)
   - ✅ ReadChatSummary (optional: get info)

### 3. Test Actions

**From ElizaOS Web UI** (http://localhost:3000):

```
"Send a message to the OpenChat group saying hello everyone"
```

**Expected:**
- ✅ ElizaOS responds: "Message sent to OpenChat successfully"
- ✅ Message appears in OpenChat group: "hello everyone"

**Logs:**
```
[OpenChat] Service found!
[OpenChat] Sending message: "hello everyone"...
[OpenChat] ✅ Message sent successfully
```

## 🎯 All Available Actions

| Action | What It Does | Permission Needed |
|--------|-------------|-------------------|
| **SEND_OPENCHAT_MESSAGE** | Send messages to OpenChat | Text |
| **READ_OPENCHAT_MESSAGES** | Read chat history | ReadMessages |
| **GET_OPENCHAT_SUMMARY** | Get group info | ReadChatSummary |
| **REACT_TO_OPENCHAT_MESSAGE** | Add emoji reactions | ReactToMessages |
| **DELETE_OPENCHAT_MESSAGE** | Delete messages | DeleteMessages |

## 🐛 Troubleshooting

### Issue: "OpenChat service not available"

**Check:**
1. Is `@elizaos/plugin-openchat` in character plugins?
2. Are env vars set correctly?
3. Does startup show "OpenChat Bot Ready"?

**Solution:**
```typescript
// In character.ts, ensure plugin is listed:
plugins: [
  '@elizaos/plugin-openchat', // Make sure this is here
  // ... other plugins
]
```

### Issue: "No installations found"

**Solution:**
1. Register bot on OpenChat first
2. Install bot in a group/channel
3. Check logs for: `[OpenChat] Installation saved`

### Issue: Actions not working

**Solution:**
1. Grant required permissions when installing bot
2. Check action validation in logs
3. Ensure bot is installed in the correct group

## 📚 Full Documentation

For detailed information:

- **Installation:** See `INSTALLATION_GUIDE.md`
- **Features:** See `COMPLETE_PLUGIN_READY.md`
- **Technical:** See `ACTIONS_FIXED_FROM_WORKING_EXAMPLES.md`
- **Character:** Use `UNIVERSAL_CHARACTER.ts`

## ✅ Success Checklist

After installation:

- [ ] Plugin installed: `npm install /workspace/plugin-openchat`
- [ ] Project builds: `npm run build`
- [ ] Character configured (includes plugin)
- [ ] Env vars set (OpenChat credentials)
- [ ] Bot started: `npm start`
- [ ] "OpenChat Bot Ready" message appears
- [ ] Bot registered on OpenChat
- [ ] Bot installed in a group
- [ ] Test message sent successfully

## 🎉 That's It!

You now have a **fully working OpenChat plugin** with:

- ✅ 5 production-ready actions
- ✅ Universal character (works with any plugin)
- ✅ Clean build (no errors)
- ✅ Complete documentation

**Start building your OpenChat agents!** 🚀
