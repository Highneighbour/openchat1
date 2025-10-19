# @elizaos/plugin-openchat

OpenChat integration plugin for ElizaOS - enables AI agents to interact with OpenChat (oc.app) as both a bot and an ElizaOS plugin.

## Features

- 🤖 **Full OpenChat Bot Integration**: Register your agent as an OpenChat bot
- 💬 **Bi-directional Communication**: Send and receive messages on OpenChat
- 🎯 **Command Execution**: Handle OpenChat commands with ElizaOS intelligence
- 🔄 **Action Support**: Send messages, react to content, and more
- 📊 **Context Providers**: Access chat context and message history
- 🚀 **Easy Setup**: Simple configuration with environment variables

## Installation

```bash
npm install @elizaos/plugin-openchat
```

## Configuration

Set up the following environment variables:

```bash
# Required
OPENCHAT_PUBLIC_KEY=<openchat-public-key>
OPENCHAT_IC_HOST=https://ic0.app
OPENCHAT_IDENTITY_PRIVATE_KEY=<your-bot-pem-key>
OPENCHAT_STORAGE_INDEX_CANISTER=<storage-canister-id>

# Optional
OPENCHAT_BOT_PORT=3000
```

### Getting Your Configuration Values

1. **OpenChat Public Key & Storage Canister**: 
   - Navigate to your OpenChat profile → Advanced → "Bot client data"
   - Copy the OC public key and OpenStorage canister ID

2. **Identity Private Key**:
   ```bash
   openssl ecparam -genkey -name secp256k1 -out private_key.pem
   ```
   
3. **Get Your Bot Principal**:
   ```bash
   node -e "
   const { Secp256k1KeyIdentity } = require('@dfinity/identity-secp256k1');
   const fs = require('fs');
   const key = fs.readFileSync('private_key.pem', 'utf8');
   const identity = Secp256k1KeyIdentity.fromPem(key);
   console.log('Principal:', identity.getPrincipal().toText());
   "
   ```

## Usage

### 1. Create an ElizaOS Agent with OpenChat Plugin

```typescript
import { openChatPlugin } from '@elizaos/plugin-openchat';

const character = {
  name: "My OpenChat Agent",
  bio: "An AI agent that interacts on OpenChat",
  // ... other character properties
};

// The plugin will automatically start the OpenChat bot server
// and handle incoming messages and commands
```

### 2. Character File Example

```json
{
  "name": "OpenChat Assistant",
  "bio": "A helpful AI assistant on OpenChat",
  "lore": [
    "Built with ElizaOS",
    "Integrates with OpenChat"
  ],
  "messageExamples": [
    [
      {
        "user": "{{user1}}",
        "content": {
          "text": "Hello!"
        }
      },
      {
        "user": "OpenChat Assistant",
        "content": {
          "text": "Hi! How can I help you today?"
        }
      }
    ]
  ],
  "plugins": ["@elizaos/plugin-openchat"],
  "settings": {
    "OPENCHAT_PUBLIC_KEY": "your-public-key",
    "OPENCHAT_IC_HOST": "https://ic0.app",
    "OPENCHAT_IDENTITY_PRIVATE_KEY": "-----BEGIN EC PRIVATE KEY-----\n...",
    "OPENCHAT_STORAGE_INDEX_CANISTER": "your-canister-id",
    "OPENCHAT_BOT_PORT": "3000"
  }
}
```

### 3. Local Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Run in development mode
npm run dev
```

### 4. Register Your Bot on OpenChat

1. **Start your agent** with the OpenChat plugin loaded
2. **Register the bot** using OpenChat's `/register_bot` command:
   - Name: Your bot name
   - Principal: The principal from your private key
   - Endpoint: `http://your-server:3000` (or your deployed URL)
3. **Install the bot** in a group, community, or as a direct chat
4. **Test it** by using the `/chat` command or messaging the bot directly

## Architecture

### Components

- **OpenChatService**: Manages the OpenChat bot server and handles incoming requests
- **Actions**: 
  - `SEND_OPENCHAT_MESSAGE`: Send messages to OpenChat
  - `REACT_TO_OPENCHAT_MESSAGE`: React to messages with emojis
- **Providers**:
  - `OPENCHAT_CHAT_CONTEXT`: Provides current chat context
  - `OPENCHAT_MESSAGE_HISTORY`: Supplies recent message history

### How It Works

1. The plugin starts an Express server that implements OpenChat bot endpoints:
   - `/bot_definition`: Exposes bot capabilities
   - `/execute_command`: Handles user commands
   - `/notify`: Receives autonomous events

2. When a user sends a command:
   - OpenChat sends a JWT-authenticated request to `/execute_command`
   - The plugin validates the JWT and creates a BotClient
   - ElizaOS processes the message using its AI capabilities
   - The response is sent back to OpenChat

3. The agent can also:
   - Send proactive messages to OpenChat
   - React to messages
   - Access chat context and history

## Available Actions

### SEND_OPENCHAT_MESSAGE

Send a message to an OpenChat room.

```typescript
// Automatically triggered when agent wants to send a message
// Or manually:
await runtime.processAction('SEND_OPENCHAT_MESSAGE', message, state);
```

### REACT_TO_OPENCHAT_MESSAGE

React to a message with an emoji.

```typescript
// Triggered when agent wants to react to a message
await runtime.processAction('REACT_TO_OPENCHAT_MESSAGE', message, state);
```

## Available Providers

### OPENCHAT_CHAT_CONTEXT

Provides information about the current chat.

### OPENCHAT_MESSAGE_HISTORY

Provides recent message history from the chat.

## API Endpoints

The plugin exposes these endpoints for OpenChat integration:

- `GET /`: Bot definition
- `GET /bot_definition`: Bot definition schema
- `POST /execute_command`: Execute OpenChat commands
- `POST /notify`: Receive autonomous events

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Examples

See the `/examples` directory for:
- Character file examples
- Integration examples
- Advanced usage patterns

## Troubleshooting

### Bot Not Responding

1. Check that all environment variables are set correctly
2. Verify the bot server is running (check port 3000 or your configured port)
3. Ensure the bot is properly registered on OpenChat
4. Check the logs for any errors

### JWT Validation Errors

- Verify your `OPENCHAT_PUBLIC_KEY` is correct
- Ensure the private key matches the registered principal

### Message Not Sending

- Check that the bot has proper permissions in the chat
- Verify the chat ID is correct
- Check the bot installation permissions on OpenChat

## Contributing

Contributions are welcome! Please see the main ElizaOS repository for contribution guidelines.

## License

MIT

## Links

- [OpenChat](https://oc.app)
- [OpenChat Bot Documentation](https://github.com/open-chat-labs/open-chat-bots)
- [ElizaOS Documentation](https://docs.elizaos.ai)
- [Internet Computer](https://internetcomputer.org)
