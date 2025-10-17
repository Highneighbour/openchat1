# 🚀 Quick Start - Get Your Bot Running NOW

## The Problem
You got HTML instead of JSON because:
- **Port 3000** = Eliza Web UI (HTML)
- **OpenChat Bot** = Needs its own port (JSON)

## The Solution (3 Steps)

### Step 1: Configure (30 seconds)

```bash
cd /workspace/plugin-openchat
cp .env.test .env
```

Edit `.env` and add your OpenChat credentials:

```env
OPENCHAT_PUBLIC_KEY=your_key_here
OPENCHAT_IC_HOST=https://icp0.io
OPENCHAT_IDENTITY_PRIVATE_KEY=your_private_key_here
OPENCHAT_STORAGE_CANISTER_ID=your_canister_id_here
OPENCHAT_BOT_PORT=3001
BOT_NAME=MyBot
BOT_BIO=An AI assistant on OpenChat
```

### Step 2: Run Bot Server (10 seconds)

```bash
npm run start:bot
```

Wait for:
```
✅ OpenChat bot server is running!
📡 Bot definition available at: http://localhost:3001/bot_definition
```

### Step 3: Test (5 seconds)

Open a **new terminal**:

```bash
curl http://localhost:3001/bot_definition
```

**Expected**: JSON with bot configuration ✅  
**If you see HTML**: Check you're using port 3001, not 3000

---

## What's Running Where

```
Port 3000: Eliza Web UI       → Returns HTML (for humans)
Port 3001: OpenChat Bot API   → Returns JSON (for OpenChat)
```

**For OpenChat bot, use port 3001!**

---

## Next Steps After Testing

Once you see JSON response:

1. **Expose with ngrok**:
   ```bash
   ngrok http 3001
   ```

2. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

3. **Register on OpenChat**:
   - Go to oc.app
   - Bot settings → Register
   - Enter your ngrok URL
   - Save

4. **Test in OpenChat**:
   ```
   /chat Hello!
   ```

5. **See your bot respond!** 🎉

---

## If You Don't Have OpenChat Credentials Yet

Get them from: https://github.com/open-chat-labs/open-chat-bots

You need:
- Public key
- Private identity key
- Storage canister ID
- IC host (use `https://icp0.io`)

---

## Commands Reference

```bash
# Start bot server
cd /workspace/plugin-openchat
npm run start:bot

# Test in another terminal
curl http://localhost:3001/bot_definition

# Expose with ngrok
ngrok http 3001

# Stop bot
Press Ctrl+C
```

---

## Troubleshooting

**"Port already in use"**
```env
# Use different port in .env
OPENCHAT_BOT_PORT=3002
```

**"Missing environment variables"**
- Check `.env` file exists in `/workspace/plugin-openchat/`
- Verify all variables are set
- No quotes needed for values

**Still seeing HTML?**
- Make sure bot server is running (check terminal output)
- Use port 3001, not 3000
- Try: `curl -v http://localhost:3001/bot_definition`

---

## That's It!

You're ready to test your OpenChat bot. Follow the 3 steps above and you'll be chatting with your AI agent on OpenChat in minutes! 🚀

For more details, see:
- [SOLUTION.md](/workspace/SOLUTION.md) - Complete solution guide
- [HOW_TO_RUN.md](/workspace/plugin-openchat/HOW_TO_RUN.md) - Detailed instructions
