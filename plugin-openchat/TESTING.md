# Testing Guide for OpenChat Plugin

This guide will help you test the OpenChat plugin thoroughly before deployment.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Eliza OS CLI installed (`npm install -g @elizaos/cli`)
- OpenChat bot credentials (see main README)
- ngrok or similar tool for local testing (optional)

## Quick Test Setup

### 1. Install Dependencies

```bash
cd plugin-openchat
npm install
```

### 2. Build the Plugin

```bash
npm run build
```

This will compile TypeScript to the `dist/` directory.

### 3. Set Up Test Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your OpenChat credentials:

```env
OPENCHAT_PUBLIC_KEY=your_actual_key
OPENCHAT_IC_HOST=https://icp0.io
OPENCHAT_IDENTITY_PRIVATE_KEY=your_actual_private_key
OPENCHAT_STORAGE_CANISTER_ID=your_actual_canister_id
OPENCHAT_BOT_PORT=3000
```

## Test Scenarios

### Test 1: Verify Build

```bash
npm run build
ls -la dist/
```

**Expected**: You should see compiled `.js` and `.d.ts` files in `dist/` directory.

### Test 2: Check Types

```bash
npx tsc --noEmit
```

**Expected**: No TypeScript errors.

### Test 3: Test with Eliza CLI

#### Step 1: Create Test Project

```bash
# Create a new Eliza project
eliza create openchat-test
cd openchat-test
```

#### Step 2: Install Plugin Locally

```bash
npm install /path/to/plugin-openchat
```

#### Step 3: Create Test Character

Create `characters/openchat-bot.json`:

```json
{
  "name": "TestBot",
  "bio": ["A test bot for OpenChat"],
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

#### Step 4: Configure Environment

Copy your `.env` to the test project:

```bash
cp /path/to/plugin-openchat/.env .env
```

#### Step 5: Run the Bot

```bash
npm start
```

**Expected Output**:
```
🤖 Initializing OpenChat client...
✅ OpenChat client initialized
📡 OpenChat bot routes configured
🚀 OpenChat bot server running on port 3000
📡 Bot definition available at: http://localhost:3000/bot_definition
💬 Command endpoint at: http://localhost:3000/execute_command
```

### Test 4: Verify Bot Definition

In a new terminal:

```bash
curl http://localhost:3000/bot_definition
```

**Expected**: JSON response with bot schema including:
- `description`
- `commands` array with "chat" and "prompt" commands
- `autonomous_config` with permissions
- `default_subscriptions`

**Example Output**:
```json
{
  "description": "TestBot - A test bot for OpenChat",
  "autonomous_config": { ... },
  "default_subscriptions": { ... },
  "commands": [
    {
      "name": "chat",
      "description": "Chat with TestBot",
      ...
    }
  ]
}
```

### Test 5: Test Bot Endpoint Health

```bash
curl http://localhost:3000/
```

**Expected**: Same as `/bot_definition` endpoint.

### Test 6: Simulate Command Request (Advanced)

You need a valid JWT token from OpenChat for this test.

```bash
curl -X POST http://localhost:3000/execute_command \
  -H "Content-Type: text/plain" \
  -H "x-oc-jwt: YOUR_VALID_JWT_TOKEN" \
  -d '{"command": "chat", "args": {"prompt": "Hello"}}'
```

**Expected**: Response with thinking indicator and then the actual bot response.

## Local Testing with ngrok

### Setup ngrok

1. **Install ngrok**:
```bash
npm install -g ngrok
```

2. **Start your bot**:
```bash
npm start
```

3. **Expose with ngrok** (in new terminal):
```bash
ngrok http 3000
```

4. **Note the URL**:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

### Register on OpenChat

1. Go to [OpenChat](https://oc.app)
2. Navigate to bot settings/registration
3. Enter bot endpoint: `https://abc123.ngrok.io`
4. Complete registration

### Test Real Interactions

1. Open OpenChat in browser
2. Find your bot
3. Send a message: `/chat Hello!`
4. **Expected**: Bot responds with AI-generated message

## Automated Testing Checklist

- [ ] ✅ Build completes without errors
- [ ] ✅ No TypeScript type errors
- [ ] ✅ Plugin installs in Eliza project
- [ ] ✅ Bot server starts successfully
- [ ] ✅ `/bot_definition` returns valid schema
- [ ] ✅ Environment variables load correctly
- [ ] ✅ Bot responds to chat commands
- [ ] ✅ Messages are saved to memory
- [ ] ✅ AI responses are generated
- [ ] ✅ Bot can be registered on OpenChat
- [ ] ✅ Real messages from OpenChat work

## Troubleshooting

### Issue: "Cannot find module '@elizaos/core'"

**Solution**: Make sure you're testing within an Eliza project that has `@elizaos/core` installed.

```bash
npm install @elizaos/core
```

### Issue: "OPENCHAT_PUBLIC_KEY is required"

**Solution**: Check your `.env` file exists and has all required variables.

```bash
cat .env
```

### Issue: Bot server won't start

**Solution**: 
1. Check if port 3000 is already in use
2. Try a different port in `.env`: `OPENCHAT_BOT_PORT=3001`
3. Check for errors in console

### Issue: Bot definition returns 404

**Solution**: 
1. Verify server is running
2. Check the correct port
3. Ensure routes are registered correctly

### Issue: OpenChat registration fails

**Solution**:
1. Ensure your bot endpoint is publicly accessible
2. Check that `/bot_definition` works from external access
3. Verify your OpenChat credentials are correct

## Performance Testing

### Load Test (Optional)

Use `autocannon` for load testing:

```bash
npm install -g autocannon

# Test bot definition endpoint
autocannon -c 10 -d 30 http://localhost:3000/bot_definition
```

**Expected**: Should handle multiple concurrent requests.

## Integration Testing

### Test All Actions

Create a test script (`test-actions.ts`):

```typescript
import { openChatPlugin } from "@elizaos/plugin-openchat";

console.log("Testing OpenChat Plugin...");
console.log("Actions:", openChatPlugin.actions?.map(a => a.name));
console.log("Providers:", openChatPlugin.providers?.length);
console.log("Plugin name:", openChatPlugin.name);
console.log("✅ All exports working!");
```

Run:
```bash
npx ts-node test-actions.ts
```

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] Bot responds correctly in local testing
- [ ] Bot registered and working on OpenChat test environment
- [ ] Environment variables secured
- [ ] HTTPS enabled for production endpoint
- [ ] Error handling tested
- [ ] Logging configured
- [ ] Rate limiting considered
- [ ] Monitoring set up

## Production Testing

After deploying to production:

1. **Verify endpoint**:
```bash
curl https://your-production-url.com/bot_definition
```

2. **Update OpenChat registration** with production URL

3. **Send test messages** through OpenChat

4. **Monitor logs** for errors

5. **Test edge cases**:
   - Very long messages
   - Special characters
   - Multiple rapid messages
   - Invalid commands

## Continuous Testing

For ongoing development:

```bash
# Watch mode for development
npm run dev

# Rebuild on changes
npm run build -- --watch
```

## Getting Help

If tests fail:

1. Check console logs for errors
2. Verify environment configuration
3. Review [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
4. Check [OpenChat Bot SDK docs](https://github.com/open-chat-labs/open-chat-bots)
5. Review [Eliza OS docs](https://docs.elizaos.ai/)

## Success Criteria

Your plugin is ready when:

✅ All automated tests pass
✅ Bot runs successfully in Eliza project  
✅ Bot definition endpoint returns valid schema
✅ Bot responds to OpenChat messages
✅ AI responses are natural and helpful
✅ No errors in production logs
✅ Bot is stable under normal load

---

Happy Testing! 🧪🤖
