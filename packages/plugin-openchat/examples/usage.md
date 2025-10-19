# OpenChat Plugin Usage Examples

## Basic Setup

### 1. Install the Plugin

```bash
npm install @elizaos/plugin-openchat
```

### 2. Configure Environment Variables

Create a `.env` file:

```bash
OPENCHAT_PUBLIC_KEY=your_public_key_here
OPENCHAT_IC_HOST=https://ic0.app
OPENCHAT_IDENTITY_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----
your_private_key_here
-----END EC PRIVATE KEY-----"
OPENCHAT_STORAGE_INDEX_CANISTER=your_canister_id
OPENCHAT_BOT_PORT=3000
```

### 3. Create Your Agent

Using ElizaOS CLI:

```bash
# Initialize a new ElizaOS project
npx @elizaos/cli init my-openchat-bot

# Navigate to the project
cd my-openchat-bot

# Install the OpenChat plugin
npm install @elizaos/plugin-openchat

# Create your character file (see examples/character.json)
# Edit agent/character.json to include the plugin
```

### 4. Add Plugin to Character

Edit your `character.json`:

```json
{
  "name": "My Bot",
  "plugins": ["@elizaos/plugin-openchat"],
  "settings": {
    "OPENCHAT_PUBLIC_KEY": "...",
    "OPENCHAT_IC_HOST": "https://ic0.app",
    "OPENCHAT_IDENTITY_PRIVATE_KEY": "...",
    "OPENCHAT_STORAGE_INDEX_CANISTER": "..."
  }
}
```

## Advanced Usage

### Using Actions Programmatically

```typescript
import { IAgentRuntime } from '@elizaos/core';
import { sendMessageAction } from '@elizaos/plugin-openchat';

// In your custom action or handler
async function customHandler(runtime: IAgentRuntime) {
  // Send a message to OpenChat
  await runtime.processAction(
    'SEND_OPENCHAT_MESSAGE',
    {
      content: { text: 'Hello from ElizaOS!' },
      roomId: 'your-chat-id',
    }
  );
}
```

### Accessing OpenChat Service

```typescript
import { OpenChatService } from '@elizaos/plugin-openchat';

// Get the service from runtime
const ocService = runtime.getService('OPENCHAT') as OpenChatService;

// Send a message directly
await ocService.sendMessage('chat-id', {
  text: 'Direct message from service',
});
```

### Custom Command Handling

The plugin automatically handles OpenChat commands, but you can extend it:

```typescript
// In your character configuration, you can add custom behaviors
// that work with OpenChat messages

// Example: Add a custom evaluator that triggers on certain OpenChat messages
const customEvaluator = {
  name: 'OPENCHAT_SPECIAL_HANDLER',
  description: 'Handles special OpenChat messages',
  alwaysRun: false,
  validate: async (runtime, message) => {
    return message.content.source === 'openchat' 
      && message.content.text?.includes('special');
  },
  handler: async (runtime, message) => {
    // Custom handling logic
  }
};
```

## Integration Patterns

### Pattern 1: OpenChat-First Agent

An agent that primarily lives on OpenChat:

```json
{
  "name": "OpenChat Native Bot",
  "plugins": ["@elizaos/plugin-openchat"],
  "settings": {
    "OPENCHAT_BOT_PORT": "3000"
  }
}
```

### Pattern 2: Multi-Platform Agent

An agent that works across OpenChat and other platforms:

```json
{
  "name": "Multi-Platform Bot",
  "plugins": [
    "@elizaos/plugin-openchat",
    "@elizaos/plugin-discord",
    "@elizaos/plugin-telegram"
  ],
  "settings": {
    "OPENCHAT_BOT_PORT": "3000",
    "DISCORD_BOT_TOKEN": "...",
    "TELEGRAM_BOT_TOKEN": "..."
  }
}
```

### Pattern 3: Custom Actions with OpenChat

Create custom actions that interact with OpenChat:

```typescript
import type { Action } from '@elizaos/core';
import { OpenChatService } from '@elizaos/plugin-openchat';

export const myCustomAction: Action = {
  name: 'MY_CUSTOM_OPENCHAT_ACTION',
  description: 'Does something special with OpenChat',
  
  validate: async (runtime, message, state) => {
    return state?.platform === 'openchat';
  },
  
  handler: async (runtime, message, state) => {
    const ocService = runtime.getService('OPENCHAT') as OpenChatService;
    
    // Your custom logic here
    await ocService.sendMessage(
      message.roomId as string,
      { text: 'Custom action executed!' }
    );
    
    return { success: true };
  }
};
```

## Testing Locally

### 1. Start Your Agent

```bash
npm run start
```

### 2. Register on OpenChat

1. Go to OpenChat (locally or on oc.app)
2. Use `/register_bot` command
3. Fill in:
   - Name: Your bot name
   - Principal: Get from your private key
   - Endpoint: `http://localhost:3000`

### 3. Install the Bot

1. Go to a test group or create one
2. Add bot from the members panel
3. Test with `/chat` command

### 4. Test Commands

```
/chat Hello bot!
/chat What can you do?
/chat Tell me about OpenChat
```

## Production Deployment

### Deploy to a Server

1. Set up a server with Node.js
2. Clone your bot repository
3. Install dependencies
4. Set environment variables
5. Start the bot
6. Register on OpenChat with your public URL

### Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t my-openchat-bot .
docker run -d -p 3000:3000 --env-file .env my-openchat-bot
```

### Environment Variables for Production

```bash
OPENCHAT_PUBLIC_KEY=production_key
OPENCHAT_IC_HOST=https://ic0.app
OPENCHAT_IDENTITY_PRIVATE_KEY=production_private_key
OPENCHAT_STORAGE_INDEX_CANISTER=production_canister
OPENCHAT_BOT_PORT=3000
NODE_ENV=production
```

## Troubleshooting

### Bot Not Starting

```bash
# Check environment variables
echo $OPENCHAT_PUBLIC_KEY

# Check port availability
lsof -i :3000

# Check logs
npm run start 2>&1 | tee bot.log
```

### JWT Errors

```bash
# Verify your public key matches OpenChat environment
# Check that private key is properly formatted with newlines
```

### Messages Not Sending

```bash
# Verify bot permissions in OpenChat
# Check that chat ID is correct
# Ensure bot is properly installed in the chat
```

## Next Steps

- Explore the `/examples` directory for more examples
- Read the [OpenChat Bot Documentation](https://github.com/open-chat-labs/open-chat-bots)
- Check out [ElizaOS Documentation](https://docs.elizaos.ai)
- Join the OpenChat community for support
