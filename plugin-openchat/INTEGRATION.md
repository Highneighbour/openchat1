# OpenChat Plugin Integration Guide

This guide explains how to integrate the OpenChat plugin with your ElizaOS installation.

## Prerequisites

1. **ElizaOS Installation**: You need a working ElizaOS installation
2. **OpenChat Bot Credentials**: Register your bot on OpenChat to get credentials
3. **Node.js**: Version 18 or higher
4. **npm or pnpm**: Package manager

## Integration Steps

### Step 1: Install the Plugin

#### Option A: Local Installation (Development)

If you're developing locally or testing:

```bash
# From your ElizaOS project root
cd /path/to/your/eliza-project

# Create or navigate to plugins directory
mkdir -p plugins
cd plugins

# Copy or clone the plugin
cp -r /path/to/plugin-openchat ./plugin-openchat

# Install plugin dependencies
cd plugin-openchat
npm install

# Build the plugin
npm run build

# Link for local development (optional)
npm link
```

#### Option B: npm Installation (When Published)

```bash
npm install @eliza/plugin-openchat
```

### Step 2: Configure Environment Variables

Create or update your `.env` file in your ElizaOS project root:

```env
# OpenChat Bot Credentials
OC_PUBLIC=your_openchat_public_key_here
IC_HOST=https://icp-api.io
IDENTITY_PRIVATE=your_identity_private_key_here
STORAGE_INDEX_CANISTER=your_storage_canister_id_here

# Bot Server Configuration
OPENCHAT_BOT_PORT=3000

# Optional: Bot Name
OPENCHAT_BOT_NAME=MyElizaAgent
```

### Step 3: Update Your Character Configuration

#### Option A: JSON Character File

Update your character JSON file (e.g., `characters/my-agent.json`):

```json
{
  "name": "MyOpenChatAgent",
  "plugins": ["@eliza/plugin-openchat"],
  "bio": [
    "I am an AI agent on OpenChat",
    "I can help with various tasks",
    "I'm powered by ElizaOS"
  ],
  "lore": [
    "I was created to demonstrate OpenChat integration",
    "I run on the Internet Computer"
  ],
  "messageExamples": [
    [
      {
        "user": "{{user1}}",
        "content": { "text": "Hello!" }
      },
      {
        "user": "MyOpenChatAgent",
        "content": { "text": "Hi! How can I help you?" }
      }
    ]
  ],
  "postExamples": [],
  "topics": ["OpenChat", "ICP", "AI"],
  "style": {
    "all": ["Be helpful and friendly"],
    "chat": ["Respond promptly"]
  }
}
```

#### Option B: TypeScript Configuration

In your agent setup file:

```typescript
import { Character, AgentRuntime } from "@eliza/core";
import { openChatPlugin } from "@eliza/plugin-openchat";

const character: Character = {
  name: "MyOpenChatAgent",
  plugins: [openChatPlugin],
  // ... rest of your character configuration
};

const runtime = new AgentRuntime({
  character,
  // ... other runtime config
});

await runtime.initialize();
```

### Step 4: Start Your Agent

#### Using Eliza CLI

```bash
# From your ElizaOS project root
npx eliza start --character ./characters/my-agent.json

# Or with pnpm
pnpm eliza start --character ./characters/my-agent.json
```

#### Using Custom Script

```typescript
// start-agent.ts
import { AgentRuntime } from "@eliza/core";
import { openChatPlugin } from "@eliza/plugin-openchat";
import characterData from "./characters/my-agent.json";

async function main() {
  const character = {
    ...characterData,
    plugins: [openChatPlugin],
  };

  const runtime = new AgentRuntime({ character });
  await runtime.initialize();
  
  console.log("Agent started successfully!");
}

main().catch(console.error);
```

Then run:
```bash
npx tsx start-agent.ts
```

### Step 5: Register Your Bot on OpenChat

1. **Start your agent** - The bot server will run on the configured port (default: 3000)

2. **Verify the bot definition is accessible**:
   ```bash
   curl http://localhost:3000/bot_definition
   ```
   You should see a JSON response with your bot configuration.

3. **Make your server accessible**:
   - **Local testing**: Use ngrok or similar:
     ```bash
     ngrok http 3000
     ```
   - **Production**: Deploy to a server with a public IP/domain

4. **Register on OpenChat**:
   - Go to [OpenChat](https://oc.app)
   - Navigate to bot settings or bot registry
   - Register your bot with the URL: `https://your-server.com/bot_definition`
   - Follow the OpenChat bot registration process

5. **Test your bot**:
   - Find your bot on OpenChat
   - Send it a message using the `/chat` command
   - Verify it responds correctly

## Verification Checklist

Use this checklist to ensure everything is set up correctly:

- [ ] ElizaOS is installed and working
- [ ] Plugin is installed and built successfully
- [ ] All environment variables are set in `.env`
- [ ] Character configuration includes the OpenChat plugin
- [ ] Agent starts without errors
- [ ] Bot server is running (check `http://localhost:3000/health`)
- [ ] Bot definition endpoint is accessible
- [ ] Bot is registered on OpenChat
- [ ] Bot responds to test messages on OpenChat

## Troubleshooting

### "Cannot find module '@eliza/core'"

**Problem**: The plugin can't find the Eliza core package.

**Solutions**:
1. Ensure you're running the plugin from within an ElizaOS project
2. Check that ElizaOS dependencies are installed: `npm install`
3. If using local development, try: `npm link @eliza/core` from the plugin directory

### "OpenChat plugin requires environment variables"

**Problem**: Required environment variables are missing.

**Solutions**:
1. Verify all required variables are in your `.env` file
2. Check the `.env` file is in the correct location (project root)
3. Restart your agent after adding variables
4. Verify no typos in variable names

### Bot server not starting

**Problem**: The Express server fails to start.

**Solutions**:
1. Check if port 3000 is already in use: `lsof -i :3000`
2. Try a different port: `OPENCHAT_BOT_PORT=3001`
3. Check firewall settings
4. Review logs for specific error messages

### Bot not receiving messages on OpenChat

**Problem**: Bot is registered but doesn't respond.

**Solutions**:
1. Verify your server is publicly accessible
2. Check OpenChat webhook logs for errors
3. Ensure bot has proper permissions in the chat
4. Test the `/execute_command` endpoint manually
5. Review agent logs for incoming requests

### "Bot client not initialized" error

**Problem**: BotClient is not being created properly.

**Solutions**:
1. Verify JWT token is being sent in headers
2. Check OpenChat credentials are correct
3. Ensure BotClientFactory is initialized
4. Review middleware logs

## Advanced Integration

### Custom Actions

Add custom actions to your agent:

```typescript
import { Action } from "@eliza/core";
import { OpenChatClient } from "@eliza/plugin-openchat";

const myCustomAction: Action = {
  name: "MY_CUSTOM_ACTION",
  description: "Does something custom",
  validate: async (runtime, message, state) => {
    return true;
  },
  handler: async (runtime, message, state) => {
    const client = runtime.clients.find(
      c => c instanceof OpenChatClient
    ) as OpenChatClient;
    
    // Your custom logic
    
    return true;
  },
  examples: [],
};

// Add to character
character.actions = [myCustomAction];
```

### Multiple Agents

Run multiple agents with different personalities:

```typescript
// agent1.ts
const agent1 = new AgentRuntime({
  character: {
    name: "Agent1",
    plugins: [openChatPlugin],
    // ... config for agent 1
  },
});

// agent2.ts
const agent2 = new AgentRuntime({
  character: {
    name: "Agent2",
    plugins: [openChatPlugin],
    // ... config for agent 2
  },
});

// Note: Each agent needs its own OpenChat bot registration
```

### Custom Providers

Create custom data providers:

```typescript
import { Provider } from "@eliza/core";

const myProvider: Provider = {
  get: async (runtime, message, state) => {
    // Fetch custom data
    return "Custom context data";
  },
};

character.providers = [myProvider];
```

## Production Deployment

### Recommended Setup

1. **Server**: Use a VPS, Railway, Heroku, or similar
2. **Process Manager**: Use PM2 or systemd for reliability
3. **Monitoring**: Set up logging and error tracking
4. **SSL**: Ensure HTTPS for production
5. **Environment**: Use production-grade environment variable management

### Example PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: "openchat-agent",
    script: "./start-agent.js",
    env: {
      NODE_ENV: "production",
    },
    error_file: "./logs/error.log",
    out_file: "./logs/out.log",
    time: true,
  }],
};
```

Start with:
```bash
pm2 start ecosystem.config.js
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/start-agent.js"]
```

Build and run:
```bash
docker build -t openchat-agent .
docker run -p 3000:3000 --env-file .env openchat-agent
```

## Support

If you encounter issues:

1. Check the main README.md
2. Review the examples in `/examples`
3. Check ElizaOS documentation
4. Review OpenChat bot documentation
5. Open an issue on GitHub

## Next Steps

- Explore the example agents in `/examples`
- Customize your agent's personality
- Add custom actions for your use case
- Deploy to production
- Monitor and iterate based on user interactions

Happy building! 🚀
