# ElizaOS OpenChat Bot

An intelligent AI agent powered by [ElizaOS](https://github.com/ai16z/eliza) integrated with [OpenChat](https://oc.app) on the Internet Computer. This bot provides context-aware conversations with memory retention and sophisticated reasoning capabilities.

## Features

- 🤖 **ElizaOS Integration**: Full ElizaOS agent with memory and context awareness
- 💬 **OpenChat Compatible**: Seamlessly integrates with the OpenChat platform
- 🧠 **Multiple AI Models**: Supports OpenAI, Anthropic, Google, and more
- 📝 **Conversation Memory**: Maintains context across conversations
- 🔒 **Secure**: Built with OpenChat's authentication and security features

## Architecture

This bot bridges OpenChat with ElizaOS:

1. **OpenChat Frontend** → User sends message via `/prompt` command
2. **Bot Server** → Receives message through OpenChat Bot API
3. **ElizaOS Runtime** → Processes message with AI agent
4. **Response** → Sends back intelligent response to OpenChat

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenChat Bot credentials
- OpenAI API key (or other supported AI provider)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd openchat1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` with your credentials**
   - Add your OpenChat bot credentials (OC_PUBLIC, IDENTITY_PRIVATE, etc.)
   - Add your OpenAI API key (or other AI provider)
   - Configure model settings

## Configuration

### OpenChat Configuration

Get your OpenChat bot credentials from the [OpenChat platform](https://oc.app):
- `OC_PUBLIC`: OpenChat public key
- `IDENTITY_PRIVATE`: Your bot's identity private key
- `STORAGE_INDEX_CANISTER`: Storage canister ID
- `IC_HOST`: Internet Computer host (default: https://icp-api.io)

### ElizaOS Configuration

Configure your AI agent in `eliza-config.json`:
- **name**: Bot's name
- **bio**: Bot's biography and capabilities
- **style**: Conversation style and behavior
- **topics**: Topics the bot can discuss
- **settings**: Model settings (temperature, max tokens, etc.)

### AI Model Configuration

Set your AI provider in `.env`:

**OpenAI (default)**:
```env
MODEL_PROVIDER=openai
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4
```

**Anthropic (Claude)**:
```env
MODEL_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=claude-3-opus-20240229
```

**Google (Gemini)**:
```env
MODEL_PROVIDER=google
GOOGLE_GENERATIVE_AI_API_KEY=...
AI_MODEL=gemini-pro
```

## Running the Bot

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

The bot will start on port 3000 (or your configured PORT).

## Usage

Once the bot is running and registered with OpenChat:

1. Find your bot on OpenChat
2. Start a conversation or add it to a group
3. Use the `/prompt` command followed by your message:
   ```
   /prompt Hello! How are you?
   ```

The bot will:
- Show a "Thinking..." placeholder
- Process your message through ElizaOS
- Return an intelligent, context-aware response

## API Endpoints

- `GET /`: Bot definition schema
- `GET /bot_definition`: Bot definition schema (same as above)
- `POST /execute_command`: Execute bot commands (used by OpenChat)

## Project Structure

```
.
├── handlers/
│   ├── executeCommand.ts  # Command routing
│   ├── prompt.ts          # Main ElizaOS integration
│   ├── schema.ts          # Bot definition
│   └── success.ts         # Response helper
├── middleware/
│   └── botclient.ts       # OpenChat authentication
├── eliza-runtime.ts       # ElizaOS agent management
├── eliza-config.json      # Agent character configuration
├── app.ts                 # Express app setup
├── server.ts              # Server entry point
├── factory.ts             # OpenChat client factory
└── types.ts               # TypeScript types
```

## How It Works

### Message Flow

1. **User sends message** via OpenChat `/prompt` command
2. **OpenChat authenticates** request with JWT token
3. **Bot extracts** user info and message content
4. **ElizaOS processes** message with:
   - Context from previous conversations
   - Character personality and knowledge
   - AI model inference
5. **Response sent** back to OpenChat
6. **Memory stored** for future context

### ElizaOS Integration

The `eliza-runtime.ts` module:
- Initializes ElizaOS agent on first request
- Manages conversation memory with SQLite
- Processes messages through the AI agent
- Maintains context across conversations
- Handles user and room identification

## Customization

### Modify Agent Personality

Edit `eliza-config.json` to customize:
- Bot's personality and behavior
- Knowledge domains and topics
- Conversation style
- Example interactions

### Add Custom Actions

Extend `eliza-runtime.ts` to add:
- Custom ElizaOS actions
- Additional plugins
- Custom evaluators
- External integrations

## Troubleshooting

### Bot not responding
- Check that all environment variables are set correctly
- Verify OpenAI API key is valid
- Check server logs for errors

### Memory issues
- Ensure `./data` directory exists and is writable
- Check SQLite database permissions

### OpenChat integration issues
- Verify OpenChat credentials
- Check that bot is properly registered on OpenChat
- Ensure server is accessible from OpenChat

## Development

### Build TypeScript
```bash
npm run build
```

### Run tests
```bash
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Resources

- [ElizaOS Documentation](https://docs.elizaos.ai/)
- [OpenChat Bot Documentation](https://github.com/open-chat-labs/open-chat-bots)
- [OpenChat Platform](https://oc.app)
- [Internet Computer](https://internetcomputer.org/)

## Support

For issues and questions:
- ElizaOS: [ElizaOS GitHub](https://github.com/ai16z/eliza)
- OpenChat: [OpenChat GitHub](https://github.com/open-chat-labs)

## Acknowledgments

- Built with [ElizaOS](https://github.com/ai16z/eliza)
- Powered by [OpenChat](https://oc.app)
- Running on [Internet Computer](https://internetcomputer.org/)