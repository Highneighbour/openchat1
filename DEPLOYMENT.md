# OpenChat Plugin Deployment Guide

This guide will help you deploy the ElizaOS OpenChat plugin and register it with OpenChat.

## Prerequisites

1. **OpenChat Account**: Sign up at [OpenChat](https://oc.app)
2. **Internet Computer Identity**: Generate a private key for bot authentication
3. **Server/Cloud Platform**: For hosting the bot webhook server
4. **Domain Name**: For the bot server URL (optional but recommended)

## Step 1: Generate Bot Identity

Generate a private key for your bot:

```bash
# Generate a private key
openssl ecparam -genkey -name secp256k1 -out private_key.pem

# Get the principal from the private key
node -e "
const { readFileSync } = require('fs');
const { Secp256k1KeyIdentity } = require('@dfinity/identity-secp256k1');
const identity = Secp256k1KeyIdentity.fromSecretKey(readFileSync('private_key.pem'));
console.log('Principal:', identity.getPrincipal().toString());
"
```

**Important**: Save the principal output - you'll need it to register the bot with OpenChat.

## Step 2: Get OpenChat Configuration

1. Go to [OpenChat](https://oc.app)
2. Navigate to your profile
3. Go to the "Advanced" section
4. Click "Bot client data"
5. Copy the following values:
   - OC Public Key
   - IC Host
   - Storage Index Canister ID

## Step 3: Configure Environment Variables

Create a `.env` file with your configuration:

```env
# OpenChat Configuration
OC_PUBLIC=your_openchat_public_key_here
IC_HOST=https://ic0.app
IDENTITY_PRIVATE=your_private_key_pem_content_here
STORAGE_INDEX_CANISTER=your_storage_index_canister_id_here

# Bot Server Configuration
BOT_SERVER_URL=https://your-bot-server.com

# Server Configuration
PORT=3000
```

## Step 4: Deploy the Bot Server

### Option A: Using Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY dist/ ./dist/
COPY .env ./

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "dist/server.js"]
```

Build and run:

```bash
docker build -t openchat-bot .
docker run -p 3000:3000 --env-file .env openchat-bot
```

### Option B: Using PM2

```bash
# Install PM2
npm install -g pm2

# Start the bot server
pm2 start dist/server.js --name openchat-bot --env-file .env

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option C: Using a Cloud Platform

#### Heroku

1. Create a `Procfile`:
```
web: node dist/server.js
```

2. Deploy:
```bash
heroku create your-bot-name
heroku config:set OC_PUBLIC=your_key
heroku config:set IC_HOST=https://ic0.app
heroku config:set IDENTITY_PRIVATE=your_private_key
heroku config:set STORAGE_INDEX_CANISTER=your_canister_id
git push heroku main
```

#### Railway

1. Connect your repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically

#### DigitalOcean App Platform

1. Create a new app
2. Connect your repository
3. Set environment variables
4. Deploy

## Step 5: Register Bot with OpenChat

1. Go to OpenChat
2. Navigate to the chat where you want to add the bot
3. Click on the chat settings
4. Go to "Bots" section
5. Click "Add Bot"
6. Enter the principal you generated in Step 1
7. Configure bot permissions:
   - Read Messages: ✅
   - Send Messages: ✅
   - React to Messages: ✅
   - Read Chat Summary: ✅
8. Save the configuration

## Step 6: Test the Integration

1. Send a message to the bot in OpenChat
2. The bot should respond with a placeholder message
3. Check your server logs to see if the webhook is being called
4. Verify the bot is processing messages correctly

## Step 7: Integrate with ElizaOS

To use this plugin with an ElizaOS agent:

1. Install the plugin:
```bash
npm install @elizaos/plugin-openchat
```

2. Add to your agent configuration:
```typescript
import { openChatPlugin } from '@elizaos/plugin-openchat';

const agentConfig = {
  // ... other config
  plugins: [openChatPlugin],
  pluginConfig: {
    'plugin-openchat': {
      OC_PUBLIC: process.env.OC_PUBLIC,
      IC_HOST: process.env.IC_HOST,
      IDENTITY_PRIVATE: process.env.IDENTITY_PRIVATE,
      STORAGE_INDEX_CANISTER: process.env.STORAGE_INDEX_CANISTER,
      BOT_SERVER_URL: process.env.BOT_SERVER_URL,
    }
  },
};
```

3. Start your agent:
```bash
elizaos start
```

## Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check if the webhook URL is accessible
   - Verify environment variables are set correctly
   - Check server logs for errors

2. **Permission denied errors**
   - Verify bot permissions in OpenChat
   - Check if the bot is properly registered

3. **JWT token errors**
   - Verify the OC_PUBLIC key is correct
   - Check if the token is being passed correctly

4. **Network errors**
   - Verify IC_HOST is accessible
   - Check firewall settings

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug node dist/server.js
```

### Health Check

Check if your bot server is running:

```bash
curl https://your-bot-server.com/openchat/status
```

Expected response:
```json
{
  "status": "active",
  "service": "OpenChat Plugin",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "botFactory": true,
  "expressApp": true
}
```

## Security Considerations

1. **Private Key Security**: Never commit your private key to version control
2. **Environment Variables**: Use secure methods to store sensitive data
3. **HTTPS**: Always use HTTPS for your bot server URL
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Input Validation**: Validate all inputs from OpenChat

## Monitoring

Set up monitoring for your bot:

1. **Logs**: Monitor server logs for errors
2. **Uptime**: Use services like UptimeRobot to monitor availability
3. **Performance**: Monitor response times and resource usage
4. **Errors**: Set up error alerting

## Scaling

For high-traffic scenarios:

1. **Load Balancing**: Use multiple server instances
2. **Database**: Store conversation history in a database
3. **Caching**: Cache frequently accessed data
4. **Queue System**: Use message queues for processing

## Support

For issues and questions:

- GitHub Issues: [Create an issue](https://github.com/elizaos/eliza/issues)
- OpenChat Documentation: [OpenChat Bots](https://github.com/open-chat-labs/open-chat-bots)
- ElizaOS Documentation: [ElizaOS Docs](https://docs.elizaos.ai)