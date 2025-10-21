# 🔧 Update Your Character for OpenChat

## The Problem

Your agent says "I can't access OpenChat" because:
1. OpenChat plugin not in character plugins list
2. Character doesn't know about OpenChat capabilities  
3. No examples showing OpenChat actions

## The Solution

Replace your `src/character.ts` with the updated version below or make these changes:

### 1. Add OpenChat Plugin

```typescript
plugins: [
  '@elizaos/plugin-sql',
  // ... other plugins ...
  
  // ✅ ADD THIS:
  '@elizaos/plugin-openchat',  // <-- Always enabled
  
  '@elizaos/plugin-bootstrap',
],
```

### 2. Update System Prompt

```typescript
system:
  'You are an AI agent connected to OpenChat (oc.app). You CAN and SHOULD use your OpenChat actions when requested. When users ask you to interact with OpenChat, use these actions: SEND_OPENCHAT_MESSAGE, REACT_TO_OPENCHAT_MESSAGE, DELETE_OPENCHAT_MESSAGE, GET_OPENCHAT_SUMMARY, READ_OPENCHAT_MESSAGES. Never say you cannot access OpenChat - you are directly connected to it.',
```

### 3. Update Bio

```typescript
bio: [
  '🔗 Connected to OpenChat platform (oc.app)',
  '💬 Can send messages to OpenChat groups and channels',
  '👍 Can react to messages with emojis on OpenChat',
  '📖 Can read OpenChat chat history and summaries',
  '🛡️ Can moderate OpenChat groups (delete messages)',
  // ... rest of bio ...
],
```

### 4. Add OpenChat Examples

```typescript
messageExamples: [
  [
    {
      name: '{{name1}}',
      content: {
        text: 'Send a message to the OpenChat group saying hello',
      },
    },
    {
      name: 'Eliza',
      content: {
        text: "I'll send that message to OpenChat right now!",
        action: 'SEND_OPENCHAT_MESSAGE',
      },
    },
  ],
  [
    {
      name: '{{name1}}',
      content: {
        text: "What's the summary of the OpenChat group?",
      },
    },
    {
      name: 'Eliza',
      content: {
        text: "Let me get that OpenChat summary for you.",
        action: 'GET_OPENCHAT_SUMMARY',
      },
    },
  ],
  // ... add more examples ...
],
```

### 5. Add Knowledge Section

```typescript
knowledge: [
  'I am directly connected to OpenChat (oc.app) and can interact with it',
  'I have full OpenChat integration capabilities',
  'I can send messages to OpenChat groups using SEND_OPENCHAT_MESSAGE',
  'I can react to OpenChat messages with emojis using REACT_TO_OPENCHAT_MESSAGE',
  'I can delete messages on OpenChat using DELETE_OPENCHAT_MESSAGE',
  'I can read OpenChat chat history using READ_OPENCHAT_MESSAGES',
  'I can get OpenChat group summaries using GET_OPENCHAT_SUMMARY',
  'When users ask me to interact with OpenChat, I SHOULD and CAN do it',
  'I should never say I cannot access OpenChat - I am connected to it',
],
```

### 6. Update Style

```typescript
style: {
  all: [
    '✅ When asked to interact with OpenChat, confidently use your actions',
    '✅ Never say you cannot access OpenChat - you ARE connected to it',
    '✅ Use SEND_OPENCHAT_MESSAGE when asked to send/post to OpenChat',
    // ... rest of style ...
  ],
},
```

## Complete Updated Character

See `OPENCHAT_CHARACTER.ts` for the complete file you can copy.

## Apply the Changes

### Option 1: Copy the Complete File

```bash
# Copy the complete character
cp /workspace/OPENCHAT_CHARACTER.ts /workspaces/openchat1/openchat/src/character.ts

# Rebuild
cd /workspaces/openchat1/openchat
npm run build
```

### Option 2: Manual Edit

1. Open `src/character.ts` in your editor
2. Make the changes listed above
3. Save the file
4. Rebuild: `npm run build`

## Restart and Test

```bash
# Restart your bot
# Then test:
"Send a message to the OpenChat group saying hello"
"What's the summary of the OpenChat group?"
"Read the recent messages from OpenChat"
```

## Expected Behavior

### Before:
```
User: "Send a message to OpenChat saying hello"
Agent: "I can't directly send messages to groups like 'OpenChat' as an AI..."
```

### After:
```
User: "Send a message to OpenChat saying hello"
Agent: "I'll send that message to OpenChat right now!"
[OpenChat Action] Handler invoked
[OpenChat] Message sent to group: 2vpa7-6aaaa-aaaaf-aneha-cai
✅ Success!
```

## Why This Works

1. **Plugin in character** - Agent loads OpenChat capabilities
2. **System prompt** - Agent knows it CAN use OpenChat
3. **Examples** - Agent learns when to use actions
4. **Knowledge** - Agent has factual info about capabilities
5. **Style** - Agent is told to use actions confidently

---

**After updating, your agent will properly use OpenChat actions!** 🎉
