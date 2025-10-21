# 🔬 Research Findings: How Real OpenChat Bots Work

## Research Source
Analyzed: https://github.com/julianjelfs/youtube_lambda

This is a **working, production OpenChat bot** that monitors YouTube channels.

## Key Discoveries

### 1. ❌ What I Got WRONG

**ElizaOS Actions Don't Work for OpenChat Commands**
- OpenChat uses its own command system (`/command`)
- ElizaOS actions are for AI decision-making, NOT OpenChat commands
- The bot receives JWT tokens for authentication, not ElizaOS memory objects
- Commands are executed via Express endpoints, not action handlers

**The Architecture is Fundamentally Different**
- OpenChat bots are **HTTP servers** with specific endpoints
- They respond to OpenChat's backend, not ElizaOS's message bus
- Installation tracking is done via database/memory, not ElizaOS services

### 2. ✅ How It ACTUALLY Works

#### A. Bot Structure (From YouTube Bot)

```
OpenChat Bot = Express HTTP Server
│
├── /bot_definition (GET)
│   └── Returns bot schema (commands, permissions)
│
├── /execute_command (POST)
│   ├── JWT middleware (creates BotClient from x-oc-jwt header)
│   ├── Switch on client.commandName
│   └── Each command: extract args, process, return response
│
└── /notify (POST)
    ├── Signature verification
    ├── Handle bot_installed_event
    ├── Handle bot_uninstalled_event
    └── Store installations (scope + permissions + API gateway)
```

#### B. Factory Pattern

```typescript
// Single global factory
const factory = new BotClientFactory({
    openchatPublicKey: process.env.OC_PUBLIC,
    icHost: process.env.IC_HOST,
    identityPrivateKey: process.env.IDENTITY_PRIVATE,
    openStorageCanisterId: process.env.STORAGE_INDEX_CANISTER,
});
```

#### C. Command Execution

```typescript
// JWT middleware extracts token, creates client
const jwt = event.headers["x-oc-jwt"];
const client = factory.createClientFromCommandJwt(jwt);

// Extract command arguments
const channelId = client.stringArg("channel_id");
const scope = client.scope; // { kind: "chat", chatId: "..." }

// Create and send message
const msg = await client.createTextMessage("Response");
await client.sendMessage(msg);

// Or make ephemeral (only visible to command user)
const msg = (await client.createTextMessage("Response")).makeEphemeral();
```

#### D. Autonomous Messaging

```typescript
// For sending messages outside of commands
const client = factory.createClientInAutonomouseContext(
    scope,          // From installation
    apiGateway,     // From installation  
    permissions     // From installation
);

const msg = await client.createTextMessage("Autonomous message");
await client.sendMessage(msg);
```

#### E. Installation Tracking

```typescript
// When bot_installed_event received:
const record = new InstallationRecord(
    apiGateway,
    event.grantedAutonomousPermissions,
    event.grantedCommandPermissions
);

// Store: scope → (apiGateway, permissions)
// This is needed for autonomous messaging
```

#### F. Bot Definition

```typescript
{
    autonomous_config: {
        sync_api_key: true,
        permissions: Permissions.encodePermissions({
            message: ["Text"],  // Can send text autonomously
            community: [],
            chat: [],
        }),
    },
    description: "Bot description...",
    commands: [
        {
            name: "command_name",
            default_role: "Participant",
            description: "What this command does",
            permissions: Permissions.encodePermissions({
                message: ["Text"],
            }),
            params: [
                {
                    name: "param_name",
                    required: true,
                    description: "Parameter description",
                    placeholder: "Hint text",
                    param_type: {
                        StringParam: {
                            min_length: 1,
                            max_length: 1000,
                            choices: [],
                            multi_line: false,
                        },
                    },
                },
            ],
        },
    ],
}
```

## 3. The Correct Plugin Architecture

### For ElizaOS + OpenChat Integration:

```
┌─────────────────────────────────────┐
│         ElizaOS Agent               │
│  (AI, Memory, Character, Runtime)   │
└──────────────┬──────────────────────┘
               │
               │ Uses AI for responses
               ↓
┌─────────────────────────────────────┐
│      OpenChat Bot Server            │
│      (Express HTTP Server)          │
├─────────────────────────────────────┤
│ GET  /bot_definition                │
│ POST /execute_command (JWT)         │
│ POST /notify (Signature)            │
└─────────────────────────────────────┘
               ↑
               │ HTTP Requests
               │
┌──────────────┴──────────────────────┐
│       OpenChat Backend              │
│       (oc.app)                      │
└─────────────────────────────────────┘
```

### What the Plugin Should Do:

1. **Start Express Server** (not register actions)
2. **Handle OpenChat Commands** (not ElizaOS actions)
3. **Use ElizaOS for AI** (generateText, character, etc.)
4. **Track Installations** (for autonomous messaging)
5. **Support Both**:
   - Command mode: User runs `/chat message`
   - Autonomous mode: Bot posts updates on its own

## 4. What Needs to Change

### ❌ Remove (Doesn't Work)
- All ElizaOS Action definitions for OpenChat commands
- Service registration attempts
- Parameter extraction from ElizaOS Memory objects
- Triple service lookup hacks

### ✅ Keep/Add (Does Work)
- Express HTTP server
- JWT middleware for commands
- Factory pattern for BotClient
- Installation tracking
- Direct OpenChat SDK usage
- Using ElizaOS runtime ONLY for AI generation

## 5. Correct Implementation Pattern

### Plugin Structure:
```
plugin-openchat/
├── src/
│   ├── server/
│   │   ├── factory.ts           # BotClientFactory
│   │   ├── middleware/jwt.ts    # JWT extraction
│   │   ├── commands/
│   │   │   ├── chat.ts          # /chat command
│   │   │   ├── help.ts          # /help command
│   │   │   └── info.ts          # /info command
│   │   ├── handlers/
│   │   │   ├── execute.ts       # Command router
│   │   │   ├── definition.ts    # Bot schema
│   │   │   └── notify.ts        # Event handler
│   │   └── service.ts           # Main bot service
│   └── index.ts                 # Plugin entry (starts server)
└── No actions/ directory!
```

### Integration Points with ElizaOS:

```typescript
// In /chat command handler:
const client = /* from JWT */;
const messageText = client.stringArg("message");

// Use ElizaOS for AI response
const prompt = `You are ${runtime.character.name}...
User: ${messageText}
${runtime.character.name}:`;

const responseText = await runtime.generateText(prompt);

// Send to OpenChat
const msg = await client.createTextMessage(responseText);
await client.sendMessage(msg);
```

## 6. Character Configuration

### Generic Multi-Plugin Character:

```typescript
export const character: Character = {
  name: "Your Agent Name",
  plugins: [
    "@elizaos/plugin-sql",
    "@elizaos/plugin-openrouter", // or your LLM provider
    "@elizaos/plugin-openchat",   // OpenChat integration
    // Add more plugins as needed
  ],
  bio: [
    "Brief description of what your agent does",
    "Works across multiple platforms",
  ],
  system: `You are a helpful AI assistant. Respond naturally and helpfully.`,
  style: {
    all: [
      "Be conversational",
      "Be helpful",
      "Keep responses concise",
    ],
  },
  topics: ["general assistance", "information", "conversation"],
};
```

**Key Point**: Don't hardcode OpenChat knowledge in character. The plugin handles OpenChat, the character handles personality.

## 7. Why Actions Failed

1. **Wrong Abstraction**: Actions are for AI to decide what to do, not for handling platform-specific commands
2. **Parameter Mismatch**: OpenChat passes JWT + args, not ElizaOS Memory objects
3. **Execution Context**: Commands execute in Express request context, not ElizaOS message pipeline
4. **Service Registration**: ElizaOS service registration doesn't help with HTTP endpoints

## 8. Correct Approach Summary

**OpenChat Bot** = Express HTTP Server that:
- Receives commands via POST /execute_command with JWT
- Uses BotClient from JWT to interact with OpenChat
- Calls ElizaOS runtime ONLY for AI text generation
- Tracks installations for autonomous messaging
- Returns responses directly to OpenChat backend

**ElizaOS Plugin** = Initializes and manages the bot server:
- Starts Express server
- Provides runtime reference to command handlers
- No actions, no providers (for OpenChat commands)
- Just a server wrapper that gives commands access to AI

## Next Steps

1. Rebuild plugin following YouTube bot pattern
2. Remove all action definitions
3. Implement proper command handlers
4. Use ElizaOS runtime only for `generateText()`
5. Create generic character (no OpenChat-specific knowledge)

---

**The fundamental insight**: OpenChat bots are HTTP servers that happen to use ElizaOS for AI, not ElizaOS plugins that happen to talk to OpenChat.
