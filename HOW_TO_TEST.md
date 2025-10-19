# 🧪 How to Test the OpenChat Plugin

This guide will walk you through testing the OpenChat ElizaOS plugin you just created.

## ✅ Prerequisites

Before testing, ensure you have:
- [x] Node.js 18+ installed
- [x] Access to OpenChat (https://oc.app) or local OpenChat instance
- [x] ElizaOS CLI installed: `npm install -g @elizaos/cli`

## 🚀 Method 1: Quick Local Test (Recommended)

### Step 1: Generate Bot Identity

```bash
# Generate private key
cd /workspace/packages/plugin-openchat
openssl ecparam -genkey -name secp256k1 -out private_key.pem

# IMPORTANT: Keep this file secure! Don't commit it.
```

### Step 2: Get Bot Principal

```bash
# Install required package
npm install -g @dfinity/identity-secp256k1 @dfinity/principal

# Create a quick script
cat > get_principal.js << 'EOF'
const { Secp256k1KeyIdentity } = require('@dfinity/identity-secp256k1');
const fs = require('fs');

const pemKey = fs.readFileSync('private_key.pem', 'utf8');
const identity = Secp256k1KeyIdentity.fromPem(pemKey);
console.log('Your Bot Principal:', identity.getPrincipal().toText());
EOF

# Run it
node get_principal.js

# Save the principal that's printed - you'll need it for registration!
```

### Step 3: Get OpenChat Configuration

1. Go to https://oc.app (or your local OpenChat)
2. Click your profile picture → **Advanced**
3. Click **"Bot client data"**
4. Copy these values:
   - **OpenChat Public Key**
   - **Storage Index Canister ID**
   - **IC Host** (usually `https://ic0.app`)

### Step 4: Create Test Character

```bash
# Copy the example character
cd /workspace/packages/plugin-openchat
cp examples/character.json test-character.json

# Now edit test-character.json and fill in your values:
# - OPENCHAT_PUBLIC_KEY
# - OPENCHAT_IDENTITY_PRIVATE_KEY (paste the FULL PEM file content)
# - OPENCHAT_STORAGE_INDEX_CANISTER
```

**Example test-character.json**:
```json
{
  "name": "TestBot",
  "bio": "A test bot for OpenChat",
  "plugins": ["./packages/plugin-openchat"],
  "settings": {
    "OPENCHAT_PUBLIC_KEY": "PASTE_YOUR_PUBLIC_KEY_HERE",
    "OPENCHAT_IC_HOST": "https://ic0.app",
    "OPENCHAT_IDENTITY_PRIVATE_KEY": "-----BEGIN EC PRIVATE KEY-----\nPASTE_YOUR_PRIVATE_KEY_HERE\n-----END EC PRIVATE KEY-----",
    "OPENCHAT_STORAGE_INDEX_CANISTER": "PASTE_YOUR_CANISTER_ID_HERE",
    "OPENCHAT_BOT_PORT": "3000"
  }
}
```

### Step 5: Start the Bot

```bash
# From the workspace root
cd /workspace

# Create a simple test project
mkdir -p test-openchat-bot
cd test-openchat-bot

# Initialize package.json
npm init -y

# Link the plugin locally
npm link ../packages/plugin-openchat

# Install ElizaOS core
npm install @elizaos/core

# Copy your test character
cp ../packages/plugin-openchat/test-character.json ./character.json

# Start the bot (this will start the OpenChat server on port 3000)
npx @elizaos/cli start --character character.json
```

**Expected Output**:
```
✓ ElizaOS initialized
✓ Loading plugins...
✓ OpenChat plugin loaded
✓ OpenChat bot server running on port 3000
✓ Agent started successfully
```

### Step 6: Verify Server is Running

In another terminal:
```bash
# Test the bot definition endpoint
curl http://localhost:3000/bot_definition

# You should see JSON with bot configuration
```

### Step 7: Register Bot on OpenChat

1. Open https://oc.app in your browser
2. In any chat, type: `/register_bot`
3. Fill in the form:
   - **Bot Name**: TestBot (or whatever you named it)
   - **Principal**: (paste the principal from Step 2)
   - **Endpoint**: `http://localhost:3000`
   - **Description**: "Test bot for development"

4. Click **"Register"**
5. Review the bot definition and confirm

**Note**: For local testing, you'll need OpenChat to be able to reach your localhost. This might require:
- Using ngrok: `ngrok http 3000` and using the ngrok URL
- Or setting up OpenChat locally (see OpenChat docs)

### Step 8: Install Bot in a Chat

1. Create a test group or go to an existing one
2. Click on **Members** panel (right side)
3. Go to **"Add bots"** tab
4. Find your bot and click **"Install"**
5. Grant the requested permissions

### Step 9: Test the Bot!

In your OpenChat chat, try:

```
/chat Hello bot! Can you hear me?
```

The bot should:
1. Show "Thinking..." immediately
2. Then respond with an AI-generated message within a few seconds

Try more:
```
/chat Tell me about OpenChat
/chat What can you do?
/chat Explain the Internet Computer
```

## 🔍 Method 2: Production-Like Testing

### Using ngrok for Public Access

```bash
# Install ngrok
npm install -g ngrok

# In one terminal, start your bot
cd /workspace/test-openchat-bot
npx @elizaos/cli start --character character.json

# In another terminal, expose it publicly
ngrok http 3000

# Use the ngrok URL (e.g., https://abc123.ngrok.io) when registering on oc.app
```

### Using Cloud Deployment

Deploy to a VPS, Heroku, Railway, or similar:

```bash
# Example with Railway
npm install -g railway

# In your bot directory
railway login
railway init
railway up

# Use the Railway URL when registering on OpenChat
```

## 🧪 Automated Testing

### Unit Tests

```bash
cd /workspace/packages/plugin-openchat

# Run tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Manual Integration Tests

1. **Test Case 1: Basic Response**
   - Send: `/chat test`
   - Expected: Bot responds within 5 seconds

2. **Test Case 2: Context Understanding**
   - Send: `/chat My name is Alice`
   - Send: `/chat What's my name?`
   - Expected: Bot remembers "Alice"

3. **Test Case 3: Error Handling**
   - Send: `/chat` (with no message)
   - Expected: Graceful error message

4. **Test Case 4: Multiple Messages**
   - Send several messages quickly
   - Expected: All get responses

## 🐛 Troubleshooting

### Bot Not Responding

**Check 1: Server Running?**
```bash
curl http://localhost:3000/bot_definition
# Should return JSON
```

**Check 2: Check Logs**
Look at the terminal where you started the bot for error messages.

**Check 3: Environment Variables**
```bash
# Verify all variables are set in your character.json
cat character.json | grep -A 5 settings
```

### JWT Validation Errors

```bash
# Error: "Access token not found" or "JWT validation failed"

# Fix: Verify your OPENCHAT_PUBLIC_KEY matches your environment
# - For mainnet: Get from oc.app profile
# - For local: Get from local OpenChat setup
```

### Port Already in Use

```bash
# Error: "Port 3000 already in use"

# Fix 1: Kill existing process
lsof -ti:3000 | xargs kill -9

# Fix 2: Use different port
# In character.json, change OPENCHAT_BOT_PORT to 3001 or another port
```

### Messages Not Sending

```bash
# Check bot has permissions in the chat
# Check chat ID is correct
# Check OpenChat logs
```

## 📊 Verification Checklist

After testing, verify:

- [x] Bot server starts without errors
- [x] `/bot_definition` endpoint returns valid JSON
- [x] Bot registers successfully on OpenChat
- [x] Bot installs in a test group
- [x] Bot responds to `/chat` commands
- [x] Responses are relevant and coherent
- [x] Bot handles errors gracefully
- [x] Multiple messages work correctly
- [x] Context is maintained across messages

## 🎯 Success Criteria

Your test is successful if:

1. ✅ Bot server starts on port 3000
2. ✅ Bot registers on OpenChat
3. ✅ Bot installs in a chat
4. ✅ Bot responds to commands
5. ✅ Responses make sense
6. ✅ No errors in logs

## 📝 Test Report Template

After testing, document your results:

```markdown
## Test Report: OpenChat Plugin

**Date**: 2025-XX-XX
**Tester**: Your Name
**Environment**: Local / Production

### Tests Performed
- [ ] Bot Registration
- [ ] Bot Installation
- [ ] Command Execution
- [ ] Message Responses
- [ ] Error Handling
- [ ] Context Memory

### Results
- Bot responds: YES / NO
- Response quality: Good / Average / Poor
- Performance: < 2s / 2-5s / > 5s
- Errors encountered: None / List them

### Issues Found
1. [Issue description if any]
2. [Issue description if any]

### Conclusion
Plugin is: Ready for use / Needs fixes / Not working
```

## 🆘 Getting Help

If you encounter issues:

1. **Check Documentation**:
   - README.md for API details
   - QUICKSTART.md for setup
   - TESTING.md for comprehensive testing guide

2. **Check Logs**:
   - Look at terminal output
   - Check for TypeScript errors
   - Review OpenChat errors

3. **Verify Configuration**:
   - All environment variables set?
   - Private key matches principal?
   - Public key correct for environment?

4. **Common Fixes**:
   - Restart the bot server
   - Re-register the bot
   - Reinstall the bot in the chat
   - Clear cache and try again

## 🎉 Next Steps After Successful Testing

Once testing is successful:

1. **Customize Your Bot**:
   - Edit character.json personality
   - Add custom actions
   - Adjust behavior

2. **Deploy to Production**:
   - Set up on a server
   - Use production URLs
   - Monitor performance

3. **Extend Functionality**:
   - Add more actions
   - Create custom providers
   - Integrate with other services

---

**Good luck with testing!** 🚀 Your OpenChat ElizaOS plugin is ready to go!
