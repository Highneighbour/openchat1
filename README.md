# ElizaOS OpenChat Plugin

A comprehensive ElizaOS plugin that enables AI agents to interact with the OpenChat platform. This plugin provides bidirectional communication between ElizaOS agents and OpenChat users, allowing agents to send messages, react to messages, read conversation history, and respond to user commands.

## Features

- **Bidirectional Communication**: Send and receive messages from OpenChat
- **Message Reactions**: React to messages with emojis
- **Chat Management**: Read conversation history and chat summaries
- **Webhook Integration**: Handle OpenChat events and commands
- **Autonomous Actions**: Perform actions based on agent decisions
- **Real-time Processing**: Process messages in real-time

## Prerequisites

Before using this plugin, you need:

1. **OpenChat Account**: Register at [OpenChat](https://oc.app)
2. **Internet Computer Identity**: Generate a private key for bot authentication
3. **OpenChat Bot Registration**: Register your bot with OpenChat
4. **ElizaOS Setup**: Have ElizaOS CLI installed and configured

## Installation

### 1. Install the Plugin

```bash
npm install @elizaos/plugin-openchat
```

### 2. Environment Variables

Create a `.env` file with the following variables:

```env
# OpenChat Configuration
OC_PUBLIC=your_openchat_public_key
IC_HOST=https://ic0.app
IDENTITY_PRIVATE=your_private_key_pem_content
STORAGE_INDEX_CANISTER=your_storage_index_canister_id
BOT_SERVER_URL=https://your-bot-server.com

# ElizaOS Configuration
ELIZAOS_API_KEY=your_elizaos_api_key
```

### 3. Generate Bot Identity

Generate a private key for your bot:

```bash
openssl ecparam -genkey -name secp256k1 -out private_key.pem
```

Get the principal from the private key:

```bash
node -e "
const { readFileSync } = require('fs');
const { Secp256k1KeyIdentity } = require('@dfinity/identity-secp256k1');
const identity = Secp256k1KeyIdentity.fromSecretKey(readFileSync('private_key.pem'));
console.log('Principal:', identity.getPrincipal().toString());
"
```

### 4. Get OpenChat Configuration

1. Go to [OpenChat](https://oc.app)
2. Navigate to your profile
3. Go to Advanced section
4. Click "Bot client data"
5. Copy the values for:
   - OC Public Key
   - IC Host
   - Storage Index Canister ID

## Usage

### 1. Add Plugin to Agent Configuration

```typescript
import { openChatPlugin } from '@elizaos/plugin-openchat';

const agentConfig = {
  // ... other config
  plugins: [openChatPlugin],
  // ... rest of config
};
```

### 2. Start the Agent

```bash
elizaos start
```

### 3. Register Bot with OpenChat

1. Go to OpenChat
2. Navigate to the chat where you want to add the bot
3. Add the bot using the principal you generated
4. Configure bot permissions

### 4. Deploy Bot Server

Deploy your bot server to a public URL and update the `BOT_SERVER_URL` environment variable.

## Available Actions

### Send Message
```typescript
// Send a message to OpenChat
{
  action: 'SEND_OPENCHAT_MESSAGE',
  content: {
    text: 'Hello from ElizaOS!',
    source: 'chat_id_here'
  }
}
```

### React to Message
```typescript
// React to a message
{
  action: 'REACT_TO_OPENCHAT_MESSAGE',
  content: {
    text: JSON.stringify({
      chatId: 'chat_id',
      messageId: 'message_id',
      reaction: '👍'
    }),
    source: 'chat_id'
  }
}
```

### Read Messages
```typescript
// Read recent messages
{
  action: 'READ_OPENCHAT_MESSAGES',
  content: {
    source: 'chat_id'
  }
}
```

## API Endpoints

The plugin provides several HTTP endpoints:

- `GET /bot_definition` - Bot configuration for OpenChat
- `POST /execute_command` - Handle OpenChat commands
- `POST /notify` - Handle OpenChat events
- `GET /openchat/status` - Plugin status
- `GET /openchat/chats` - List available chats

## Configuration Options

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `OC_PUBLIC` | string | Yes | OpenChat public key for JWT verification |
| `IC_HOST` | string | Yes | Internet Computer host URL |
| `IDENTITY_PRIVATE` | string | Yes | Private key for bot identity |
| `STORAGE_INDEX_CANISTER` | string | Yes | OpenStorage index canister ID |
| `BOT_SERVER_URL` | string | No | Public URL where bot server is hosted |

## Bot Permissions

The plugin requests the following permissions from OpenChat:

- **Chat Permissions**:
  - `ReadMessages`: Read messages in chats
  - `SendMessages`: Send messages to chats
  - `ReactToMessages`: React to messages
  - `ReadChatSummary`: Read chat summaries

- **Message Permissions**:
  - `Text`: Handle text messages

## Error Handling

The plugin includes comprehensive error handling:

- JWT token validation
- Bot factory initialization checks
- Message validation
- Network error handling
- Graceful degradation

## Development

### Building the Plugin

```bash
npm run build
```

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### Common Issues

1. **Bot Factory Not Initialized**
   - Check that all environment variables are set
   - Verify the private key format

2. **JWT Token Errors**
   - Ensure the OC_PUBLIC key is correct
   - Check that the token is being passed correctly

3. **Permission Denied**
   - Verify bot permissions in OpenChat
   - Check that the bot is properly registered

4. **Network Errors**
   - Verify IC_HOST is accessible
   - Check firewall settings

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug elizaos start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:

- GitHub Issues: [Create an issue](https://github.com/elizaos/eliza/issues)
- Documentation: [ElizaOS Docs](https://docs.elizaos.ai)
- OpenChat: [OpenChat Documentation](https://github.com/open-chat-labs/open-chat-bots)

## Changelog

### v1.0.0
- Initial release
- Basic message sending and receiving
- Reaction support
- Chat reading capabilities
- Webhook integration
- Comprehensive error handling