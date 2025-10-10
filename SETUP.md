# ElizaOS OpenChat Bot - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# OpenChat Bot Configuration
OC_PUBLIC=your_openchat_public_key
IDENTITY_PRIVATE=your_identity_private_key
STORAGE_INDEX_CANISTER=your_storage_canister_id
IC_HOST=https://icp-api.io

# ElizaOS Configuration
OPENAI_API_KEY=your_openai_api_key
MODEL_PROVIDER=openai
AI_MODEL=gpt-4
```

### 3. Build the Project

```bash
npm run build
```

### 4. Start the Bot

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## How It Works

### Architecture

```
OpenChat User
    ↓ (sends /prompt message)
OpenChat Platform
    ↓ (HTTP POST with JWT)
Bot Server (Express)
    ↓ (extracts message)
ElizaOS Runtime
    ↓ (AI processing)
Response
    ↓ (sent back)
OpenChat User
```

### Key Components

1. **handlers/schema.ts**: Defines the bot's capabilities and commands for OpenChat
2. **handlers/executeCommand.ts**: Routes incoming commands to appropriate handlers
3. **handlers/prompt.ts**: Main handler that processes messages through ElizaOS
4. **eliza-runtime.ts**: ElizaOS agent initialization and message processing
5. **eliza-config.json**: Agent character configuration (personality, style, etc.)

### Message Flow

1. User sends message via `/prompt` command in OpenChat
2. OpenChat sends authenticated request to bot's `/execute_command` endpoint
3. Bot extracts user info and message content
4. ElizaOS processes message with:
   - Context from previous conversations (stored in SQLite)
   - Character personality from config
   - AI model for generation
5. Response is sent back to OpenChat
6. Both user message and bot response are stored for future context

## Configuration

### Customizing the Bot Personality

Edit `eliza-config.json`:

```json
{
  "name": "Your Bot Name",
  "bio": ["Description of your bot"],
  "style": {
    "all": ["personality traits"],
    "chat": ["chat-specific behaviors"]
  },
  "topics": ["topics it can discuss"]
}
```

### Using Different AI Models

**OpenAI (GPT-4, GPT-3.5):**
```env
MODEL_PROVIDER=openai
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4
```

**Anthropic (Claude):**
```env
MODEL_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=claude-3-opus-20240229
```

**Google (Gemini):**
```env
MODEL_PROVIDER=google
GOOGLE_GENERATIVE_AI_API_KEY=...
AI_MODEL=gemini-pro
```

## Testing

### Local Testing

1. Start the bot locally:
   ```bash
   npm run dev
   ```

2. The bot will be available at `http://localhost:3000`

3. Test the schema endpoint:
   ```bash
   curl http://localhost:3000/bot_definition
   ```

### OpenChat Integration

1. Register your bot on OpenChat with your bot's public URL
2. Add the bot to a chat or group
3. Send a message with `/prompt your message here`
4. The bot will respond with an AI-generated message

## Troubleshooting

### Bot not responding

- **Check environment variables**: Ensure all required variables in `.env` are set
- **Check API key**: Verify your OpenAI (or other provider) API key is valid
- **Check logs**: Look at console output for errors
- **Check database**: Ensure `./data` directory is writable

### Database errors

```bash
# Reset the database
rm -rf data/eliza.db
# Restart the bot
npm start
```

### Build errors

```bash
# Clean and rebuild
npm run rebuild
```

## Advanced Usage

### Adding Custom Actions

Edit `eliza-runtime.ts` and add custom actions to the runtime:

```typescript
const customAction = {
  name: "MY_ACTION",
  similes: ["similar phrases"],
  description: "What this action does",
  validate: async (runtime, message) => true,
  handler: async (runtime, message, state) => {
    // Custom logic
  },
};

agentRuntime = new AgentRuntime({
  // ... other config
  actions: [customAction],
});
```

### Adding Plugins

Install ElizaOS plugins and add them to `eliza-config.json`:

```json
{
  "plugins": ["@ai16z/plugin-example"]
}
```

## Deployment

### Deploy to Production

1. Set up your production environment
2. Install dependencies: `npm install --production`
3. Build the project: `npm run build`
4. Set environment variables on your server
5. Start with: `npm start`
6. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name eliza-openchat-bot
   ```

### Environment Variables for Production

Ensure these are set on your production server:
- All OpenChat credentials
- AI provider API key
- Database path (should be persistent storage)
- Port (if different from 3000)

## Support

- ElizaOS: https://github.com/ai16z/eliza
- OpenChat: https://github.com/open-chat-labs/open-chat-bots
- ElizaOS Docs: https://docs.elizaos.ai/

## License

MIT
