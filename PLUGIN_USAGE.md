# Using @elizaos/client-openchat Plugin

This guide shows you how to use the OpenChat client plugin with ElizaOS agents.

## For Agent Creators

### Method 1: Using ElizaOS CLI (Easiest)

When creating a new agent:

```bash
# Install ElizaOS CLI globally
npm install -g @elizaos/cli

# Create a new agent
elizaos create my-openchat-agent

# Follow the prompts:
# - Database: Choose your preferred option (e.g., pglite, sqlite)
# - Model Provider: openai, anthropic, etc.
# - Clients: Add "openchat" to the list
```

The CLI will automatically:
- Install `@elizaos/client-openchat`
- Configure your character file
- Set up environment templates

### Method 2: Adding to Existing Agent

If you already have an ElizaOS agent:

#### 1. Install the plugin

```bash
cd your-agent-project
npm install @elizaos/client-openchat
```

#### 2. Add to character configuration

Edit your `character.json` or character file:

```json
{
  "name": "MyAgent",
  "bio": ["Your agent bio"],
  "modelProvider": "openai",
  "clients": ["openchat"],  // <-- Add this
  "plugins": []
}
```

#### 3. Configure environment

Add to your `.env` file:

```env
# OpenChat Configuration
OPENCHAT_PUBLIC_KEY=your_key_here
OPENCHAT_IDENTITY_PRIVATE=your_private_key_here
OPENCHAT_STORAGE_CANISTER=your_canister_id_here
OPENCHAT_IC_HOST=https://icp-api.io
OPENCHAT_PORT=3000

# AI Provider
OPENAI_API_KEY=your_openai_key_here
```

#### 4. Start your agent

```bash
elizaos start
```

## Getting OpenChat Credentials

### 1. Register Your Bot

1. Visit [OpenChat](https://oc.app)
2. Navigate to bot registration
3. Create a new bot
4. Note down your credentials:
   - Public key
   - Private identity key
   - Storage canister ID

### 2. Configure Bot URL

Once your agent is running:

1. Note your server's public URL (e.g., `https://your-domain.com`)
2. In OpenChat bot settings, set:
   - Bot definition URL: `https://your-domain.com/bot_definition`
   - Command endpoint: `https://your-domain.com/execute_command`

### 3. Test Your Bot

1. Find your bot on OpenChat
2. Add it to a chat or group
3. Send a message:
   ```
   /prompt Hello!
   ```
4. Your agent should respond!

## Agent Configuration Examples

### Basic Configuration

```json
{
  "name": "BasicBot",
  "username": "basic_bot",
  "bio": ["A simple helpful bot"],
  "modelProvider": "openai",
  "clients": ["openchat"],
  "style": {
    "all": ["be helpful", "be concise"],
    "chat": ["be friendly"]
  }
}
```

### Advanced Configuration

```json
{
  "name": "AdvancedAgent",
  "username": "advanced_agent",
  "system": "You are an expert AI assistant.",
  "bio": [
    "An advanced AI agent with deep knowledge",
    "Specializes in technical topics and problem-solving"
  ],
  "lore": [
    "Built on ElizaOS",
    "Deployed on Internet Computer"
  ],
  "messageExamples": [
    [
      {
        "user": "{{user1}}",
        "content": { "text": "Explain quantum computing" }
      },
      {
        "user": "AdvancedAgent",
        "content": {
          "text": "Quantum computing uses quantum mechanics principles..."
        }
      }
    ]
  ],
  "topics": [
    "Technology",
    "Science",
    "Programming",
    "AI"
  ],
  "adjectives": [
    "knowledgeable",
    "precise",
    "helpful"
  ],
  "style": {
    "all": [
      "provide detailed explanations",
      "use technical accuracy",
      "cite sources when relevant"
    ],
    "chat": [
      "maintain professional tone",
      "break down complex topics"
    ]
  },
  "modelProvider": "openai",
  "settings": {
    "model": "gpt-4",
    "temperature": 0.7
  },
  "clients": ["openchat"],
  "plugins": []
}
```

### Multi-Platform Agent

You can run your agent on multiple platforms:

```json
{
  "name": "MultiPlatformBot",
  "bio": ["A bot available on multiple platforms"],
  "modelProvider": "openai",
  "clients": [
    "openchat",
    "discord",
    "telegram"
  ],
  "plugins": []
}
```

Each client will need its own environment variables.

## Environment Variables Reference

### Required

```env
# OpenChat credentials (required)
OPENCHAT_PUBLIC_KEY=xxx
OPENCHAT_IDENTITY_PRIVATE=xxx
OPENCHAT_STORAGE_CANISTER=xxx

# AI Provider (at least one required)
OPENAI_API_KEY=xxx
# OR
ANTHROPIC_API_KEY=xxx
# OR
GOOGLE_GENERATIVE_AI_API_KEY=xxx
```

### Optional

```env
# OpenChat options
OPENCHAT_IC_HOST=https://icp-api.io  # Default
OPENCHAT_PORT=3000                    # Default

# Model configuration
MODEL_PROVIDER=openai                 # Default
AI_MODEL=gpt-4                        # Model to use

# ElizaOS options
LOG_LEVEL=info                        # debug, info, warn, error
```

## Deployment

### Local Development

```bash
# Start in development mode
elizaos dev

# Your bot will be available at:
# http://localhost:3000/bot_definition
```

### Production Deployment

#### Option 1: VPS/Cloud Server

```bash
# On your server
git clone your-agent-repo
cd your-agent
npm install
npm run build

# Set environment variables
export OPENCHAT_PUBLIC_KEY="..."
export OPENCHAT_IDENTITY_PRIVATE="..."
# ... etc

# Start with PM2
npm install -g pm2
pm2 start elizaos --name my-agent -- start

# Or use systemd, Docker, etc.
```

#### Option 2: Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["elizaos", "start"]
```

```bash
docker build -t my-openchat-agent .
docker run -d \
  -e OPENCHAT_PUBLIC_KEY="..." \
  -e OPENCHAT_IDENTITY_PRIVATE="..." \
  -e OPENAI_API_KEY="..." \
  -p 3000:3000 \
  my-openchat-agent
```

#### Option 3: Serverless/Cloud Functions

The OpenChat client runs an HTTP server, so it's best suited for:
- VPS (DigitalOcean, Linode, etc.)
- Cloud VMs (AWS EC2, Google Compute Engine, etc.)
- Container platforms (Kubernetes, ECS, etc.)
- PaaS (Railway, Render, Fly.io, etc.)

## Troubleshooting

### "Runtime not initialized"

Make sure your agent is fully started before OpenChat tries to connect:

```bash
# Check logs
elizaos start --log-level debug
```

### Port Already in Use

Change the port:

```env
OPENCHAT_PORT=3001  # Use different port
```

### Bot Not Appearing in OpenChat

1. Check bot definition endpoint:
   ```bash
   curl http://your-domain.com/bot_definition
   ```

2. Verify OpenChat can reach your server

3. Check bot registration on OpenChat

### Authentication Errors

1. Verify credentials in `.env`
2. Check that credentials haven't expired
3. Re-register bot on OpenChat if needed

## Advanced Usage

### Programmatic Control

```typescript
import { OpenChatClient } from "@elizaos/client-openchat";
import { AgentRuntime } from "@ai16z/eliza";

// Create and configure runtime
const runtime = new AgentRuntime({
  // ... runtime config
});

// Create OpenChat client
const openchatClient = new OpenChatClient({
  openchatPublicKey: process.env.OPENCHAT_PUBLIC_KEY!,
  icHost: process.env.OPENCHAT_IC_HOST!,
  identityPrivateKey: process.env.OPENCHAT_IDENTITY_PRIVATE!,
  openStorageCanisterId: process.env.OPENCHAT_STORAGE_CANISTER!,
  port: 3000,
  debug: true,
});

// Start client
await openchatClient.start(runtime);

// Stop when done
await openchatClient.stop(runtime);
```

### Custom Message Handling

The plugin automatically handles:
- User authentication
- Message routing
- Context management
- Response formatting

To customize behavior, you can extend the `OpenChatClient` class or modify your agent's character configuration.

## Best Practices

### Security

1. **Never commit `.env` files**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use environment-specific configs**
   - `.env.development`
   - `.env.production`

3. **Rotate credentials regularly**

### Performance

1. **Choose appropriate model**
   - `gpt-3.5-turbo` for fast, cheap responses
   - `gpt-4` for complex reasoning

2. **Monitor API usage**
   - Set up alerts for API costs
   - Use rate limiting if needed

3. **Optimize character config**
   - Keep bio concise
   - Use relevant message examples
   - Don't over-specify style guidelines

### Monitoring

1. **Check logs regularly**
   ```bash
   pm2 logs my-agent
   ```

2. **Monitor uptime**
   - Use uptime monitoring services
   - Set up health check alerts

3. **Track metrics**
   - Messages processed
   - Response times
   - Error rates

## Examples

See the [`examples/`](./examples) directory for complete working examples.

## Getting Help

- **Documentation**: [GitHub README](../README.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/client-openchat/issues)
- **ElizaOS Community**: [Discord](https://discord.gg/ai16z)
- **OpenChat Community**: [OpenChat](https://oc.app)

---

**Happy building! 🚀**
