# Testing Guide for @elizaos/plugin-openchat

This guide will help you test the OpenChat plugin with your ElizaOS agent.

## Prerequisites

1. **ElizaOS installed**: Make sure you have ElizaOS CLI installed
   ```bash
   npm install -g @elizaos/cli
   ```

2. **OpenSSL**: For generating bot identity
   ```bash
   # macOS
   brew install openssl
   
   # Ubuntu/Debian
   sudo apt-get install openssl
   ```

3. **OpenChat Account**: Create an account at [oc.app](https://oc.app)

## Setup Steps

### 1. Generate Bot Identity

```bash
# Generate a private key
openssl ecparam -genkey -name secp256k1 -out private_key.pem

# View the principal (you'll need this for registration)
# Note: You may need the OpenChat SDK's report_principal.js script
cat private_key.pem
```

### 2. Get OpenChat Configuration

1. Log into OpenChat at [oc.app](https://oc.app)
2. Click your profile → Advanced
3. Click "Bot client data"
4. Copy the following values:
   - OpenChat Public Key
   - IC Host URL
   - Storage Index Canister ID

### 3. Configure Environment

Create `.env` file in your project root:

```env
# OpenChat Configuration
OPENCHAT_PUBLIC_KEY=<from_step_2>
IC_HOST=https://ic0.app
IDENTITY_PRIVATE_KEY=<contents_of_private_key.pem>
STORAGE_INDEX_CANISTER=<from_step_2>
OPENCHAT_BOT_PORT=3000

# Your AI model settings (example with OpenAI)
OPENAI_API_KEY=your_openai_key
```

### 4. Install Plugin

#### Option A: From NPM (when published)
```bash
npm install @elizaos/plugin-openchat
```

#### Option B: Local Development
```bash
# In plugin-openchat directory
npm link

# In your ElizaOS project
npm link @elizaos/plugin-openchat
```

#### Option C: Direct Path
```bash
# In your ElizaOS project
npm install /path/to/plugin-openchat
```

### 5. Create Agent Character

Create `agent-character.json`:

```json
{
  "name": "TestBot",
  "plugins": ["@elizaos/plugin-openchat"],
  "modelProvider": "openai",
  "bio": ["I am a test bot for OpenChat"],
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

### 6. Start Your Agent

```bash
# Using ElizaOS CLI
elizaos start --character agent-character.json

# Or with direct command
npx elizaos start
```

You should see:
```
[OpenChat] Initializing plugin...
[OpenChat] Client initialized
[OpenChat] Bot server started on port 3000
```

### 7. Register Bot on OpenChat

1. Open OpenChat in **developer mode**:
   - Go to Settings → Advanced
   - Enable "Developer mode"

2. In any chat, type: `/register_bot`

3. Fill in the form:
   - **Name**: TestBot (or your bot name)
   - **Principal**: Your bot's principal from step 1
   - **Endpoint**: `http://localhost:3000` (or your server URL)

4. Click "Register"

OpenChat will:
- Call your `/bot_definition` endpoint
- Validate the response
- Register your bot

### 8. Install Bot in a Test Chat

1. Create a private group for testing:
   - Click "New Group"
   - Name it "Bot Test"
   - Create the group

2. Add the bot to the group:
   - Open group members panel
   - Click "Add bots" tab
   - Select your bot
   - Review permissions
   - Click "Install"

3. The bot should now appear in the members list!

## Testing Interactions

### Basic Chat Test

In your test group, type:
```
/chat Hello bot!
```

Expected behavior:
1. Bot shows "🤔 Thinking..." (placeholder)
2. Bot responds with AI-generated response

### Command Test

Try the prompt command:
```
/prompt What is OpenChat?
```

## Troubleshooting

### Bot Not Responding

**Check Server Logs**:
```bash
# Look for these messages
[OpenChat] Bot server started on port 3000
[OpenChat] Executing command: chat
[OpenChat] Chat command handled
```

**Common Issues**:
- Port 3000 already in use: Change `OPENCHAT_BOT_PORT` in `.env`
- Endpoint not reachable: Make sure your server is publicly accessible
- JWT verification failed: Check `OPENCHAT_PUBLIC_KEY` is correct

### Registration Failed

**Check**:
1. Bot definition endpoint is accessible:
   ```bash
   curl http://localhost:3000/bot_definition
   ```
   Should return JSON with bot definition

2. Principal is correct:
   - Re-generate and check principal matches private key

3. Endpoint URL is correct:
   - Must be reachable from OpenChat servers
   - For local testing, use ngrok or similar:
     ```bash
     ngrok http 3000
     # Use the ngrok URL for registration
     ```

### Installation Failed

**Check Permissions**:
- Bot definition may be requesting permissions not available
- Try simpler permissions first

**Check Logs**:
```bash
# Should see installation event
[OpenChat] Bot installed in scope: <chat_id>
```

## Advanced Testing

### Test Autonomous Mode

1. Enable in `.env`:
   ```env
   OPENCHAT_AUTONOMOUS=true
   ```

2. Bot can now proactively respond to messages

### Test Different Message Types

Currently supported:
- Text messages: ✅
- Reactions: ✅ (via actions)
- Image messages: ✅ (send via actions)

### Test Providers

Providers give context to your agent:
- Chat context (recent messages, summary)
- User info (who's chatting)
- Installation info (where bot is installed)

### Load Testing

Test with multiple chats:
1. Install bot in multiple groups
2. Send messages simultaneously
3. Monitor performance

## Debugging

### Enable Debug Logs

In your code:
```typescript
import { logger } from "@elizaos/core";
logger.level = "debug";
```

### Monitor Requests

```bash
# Watch all HTTP requests
tail -f logs/openchat.log | grep "POST\|GET"
```

### Check OpenChat Events

The `/notify` endpoint receives events:
- Bot installed/uninstalled
- Messages (if subscribed)
- Member joined/left

## Production Deployment

### Requirements

1. **Public Endpoint**: Bot must be accessible from internet
2. **HTTPS**: Recommended for production
3. **Reliability**: Keep bot server running (PM2, Docker, etc.)

### Deployment Options

#### Using PM2
```bash
npm install -g pm2
pm2 start "elizaos start" --name openchat-bot
pm2 save
```

#### Using Docker
```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
CMD ["npx", "elizaos", "start"]
```

#### Cloud Platforms
- **Vercel/Netlify**: May need serverless adaptations
- **AWS/GCP/Azure**: Standard deployment
- **Railway/Render**: Easy deployment options

## Monitoring

### Health Checks

```bash
# Check if bot is running
curl http://localhost:3000/health

# Check bot definition
curl http://localhost:3000/bot_definition
```

### Metrics to Monitor

- Response time
- Error rate
- Number of installations
- Message volume
- API quota usage (for AI models)

## Next Steps

1. Customize bot behavior in character file
2. Add more actions for your use case
3. Integrate with other ElizaOS plugins
4. Deploy to production
5. Publish bot on OpenChat

## Support

- GitHub Issues: Report bugs and feature requests
- ElizaOS Discord: Get help from community
- OpenChat Support: For platform-specific issues

## Useful Commands

```bash
# Check if port is in use
lsof -i :3000

# Test bot definition
curl http://localhost:3000/bot_definition | jq

# View logs
tail -f logs/openchat-*.log

# Restart bot
pm2 restart openchat-bot
```
