# Testing Guide for OpenChat Plugin

This guide covers how to test the OpenChat plugin locally and in production.

## Local Testing Setup

### 1. Prepare Test Environment

```bash
# Clone the repository
git clone <your-repo>
cd <repo>/packages/plugin-openchat

# Install dependencies
npm install

# Build the plugin
npm run build
```

### 2. Set Up Test Configuration

Create a `.env.test` file:

```bash
# Test OpenChat Configuration
OPENCHAT_PUBLIC_KEY=test_public_key
OPENCHAT_IC_HOST=http://localhost:8000
OPENCHAT_IDENTITY_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----
test_private_key
-----END EC PRIVATE KEY-----"
OPENCHAT_STORAGE_INDEX_CANISTER=test_canister_id
OPENCHAT_BOT_PORT=3001
```

### 3. Create Test Character

Create `test-character.json`:

```json
{
  "name": "Test Bot",
  "bio": "A test bot for OpenChat",
  "plugins": ["@elizaos/plugin-openchat"],
  "settings": {
    "OPENCHAT_PUBLIC_KEY": "${OPENCHAT_PUBLIC_KEY}",
    "OPENCHAT_IC_HOST": "${OPENCHAT_IC_HOST}",
    "OPENCHAT_IDENTITY_PRIVATE_KEY": "${OPENCHAT_IDENTITY_PRIVATE_KEY}",
    "OPENCHAT_STORAGE_INDEX_CANISTER": "${OPENCHAT_STORAGE_INDEX_CANISTER}",
    "OPENCHAT_BOT_PORT": "${OPENCHAT_BOT_PORT}"
  }
}
```

## Unit Tests

### Running Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

Tests are organized as:
```
src/
  actions/
    __tests__/
      sendMessage.test.ts
      reactToMessage.test.ts
  providers/
    __tests__/
      chatContext.test.ts
      messageHistory.test.ts
  services/
    __tests__/
      openchat.service.test.ts
```

## Integration Tests

### Testing with Local OpenChat

1. **Set up local OpenChat**:
   ```bash
   # Clone OpenChat
   git clone https://github.com/open-chat-labs/open-chat.git
   cd open-chat
   
   # Follow their setup instructions
   # Start local replica
   dfx start --clean
   
   # Deploy OpenChat locally
   ./scripts/deploy-local.sh
   ```

2. **Start your test bot**:
   ```bash
   cd /path/to/plugin-openchat
   npm run dev
   ```

3. **Register the bot** at http://localhost:5001

4. **Run integration tests**:
   ```bash
   npm run test:integration
   ```

### Manual Integration Testing

#### Test Case 1: Bot Registration

1. Open OpenChat (local or production)
2. Use `/register_bot` command
3. Enter bot details
4. Verify bot appears in bot list
5. Check `/bot_definition` endpoint returns valid JSON

**Expected Result**: Bot successfully registered

#### Test Case 2: Command Execution

1. Install bot in a test group
2. Execute command: `/chat Hello bot`
3. Verify placeholder message appears immediately
4. Verify final response appears within 5 seconds
5. Check response is relevant to the message

**Expected Result**: Bot responds appropriately

#### Test Case 3: Error Handling

1. Send invalid command: `/invalid_command test`
2. Verify error message is user-friendly
3. Check logs for detailed error

**Expected Result**: Graceful error handling

#### Test Case 4: Multi-Message Conversation

1. Send: `/chat What is OpenChat?`
2. Wait for response
3. Send: `/chat Tell me more`
4. Verify bot has context from previous message

**Expected Result**: Bot maintains conversation context

#### Test Case 5: Autonomous Messaging

1. Bot is installed in a group
2. Trigger an event that should cause autonomous response
3. Verify bot sends message without command

**Expected Result**: Bot sends proactive message

## API Testing

### Test Bot Definition Endpoint

```bash
# Test GET /bot_definition
curl http://localhost:3000/bot_definition

# Expected: JSON with bot definition
{
  "description": "...",
  "commands": [...],
  "autonomous_config": {...}
}
```

### Test Command Execution

```bash
# Create a test JWT (you'll need the OpenChat SDK)
# This is typically done by OpenChat, not manually

# Test POST /execute_command
curl -X POST http://localhost:3000/execute_command \
  -H "x-oc-jwt: <test_jwt>" \
  -H "Content-Type: text/plain" \
  -d "test command data"

# Expected: 200 OK with message response
```

### Test Health Check

```bash
# Test root endpoint
curl http://localhost:3000/

# Expected: Bot definition (same as /bot_definition)
```

## Performance Testing

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Create load test config (artillery.yml)
cat > artillery.yml << 'EOF'
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
scenarios:
  - name: "Bot Definition"
    flow:
      - get:
          url: "/bot_definition"
EOF

# Run load test
artillery run artillery.yml
```

**Success Criteria**:
- Response time < 100ms for /bot_definition
- Response time < 2s for command execution
- 0% error rate under normal load

### Memory Leak Testing

```bash
# Run bot with memory monitoring
node --expose-gc --inspect index.js

# In another terminal, connect to inspector
chrome://inspect

# Monitor memory over time while sending test commands
# Check for memory leaks in heap snapshots
```

## Security Testing

### Test JWT Validation

1. **Invalid JWT**:
   ```bash
   curl -X POST http://localhost:3000/execute_command \
     -H "x-oc-jwt: invalid_token" \
     -d "test"
   ```
   Expected: 400 Bad Request

2. **Missing JWT**:
   ```bash
   curl -X POST http://localhost:3000/execute_command \
     -d "test"
   ```
   Expected: 400 Bad Request

3. **Expired JWT**:
   - Create an expired JWT
   - Send request
   - Expected: 400 Bad Request

### Test Input Validation

1. **SQL Injection Attempt**:
   ```
   /chat '; DROP TABLE users; --
   ```
   Expected: Sanitized input, no DB issues

2. **XSS Attempt**:
   ```
   /chat <script>alert('xss')</script>
   ```
   Expected: Content escaped properly

3. **Command Injection**:
   ```
   /chat test; rm -rf /
   ```
   Expected: Safe handling, no command execution

## Production Testing

### Pre-Deployment Checklist

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Load tests show acceptable performance
- [ ] Security tests pass
- [ ] Environment variables configured
- [ ] Error handling tested
- [ ] Logging configured
- [ ] Monitoring set up

### Staging Environment Tests

1. Deploy to staging
2. Run full test suite
3. Test with production-like data
4. Monitor for 24 hours
5. Check logs for errors
6. Verify performance metrics

### Smoke Tests (Post-Deployment)

```bash
# 1. Health check
curl https://your-bot.com/bot_definition

# 2. Register bot on production OpenChat
# Use /register_bot command

# 3. Test basic command
# Send: /chat test

# 4. Check logs
ssh your-server
tail -f /var/log/openchat-bot.log

# 5. Monitor metrics
# Check CPU, memory, response times
```

## Continuous Testing

### GitHub Actions Workflow

```yaml
name: Test OpenChat Plugin

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm test
      - run: npm run test:integration
```

### Monitoring in Production

Set up monitoring for:
- Response times
- Error rates
- Memory usage
- CPU usage
- Request volume
- OpenChat API errors

Tools:
- Prometheus + Grafana
- DataDog
- New Relic
- CloudWatch (if on AWS)

## Debugging

### Enable Debug Logging

```bash
# Set debug environment variable
DEBUG=* npm run dev

# Or specific namespaces
DEBUG=openchat:* npm run dev
```

### Common Issues and Solutions

#### Issue: Bot not responding

**Debug Steps**:
1. Check bot server is running: `curl localhost:3000/bot_definition`
2. Check logs for errors
3. Verify JWT token is being sent
4. Check OpenChat registration is active

#### Issue: JWT validation fails

**Debug Steps**:
1. Verify OPENCHAT_PUBLIC_KEY is correct
2. Check token expiration
3. Verify token signature
4. Compare with OpenChat documentation

#### Issue: Messages not sending

**Debug Steps**:
1. Check bot has permissions in chat
2. Verify chat ID is correct
3. Check OpenChat API response
4. Review error logs

## Test Coverage Goals

- **Unit Tests**: > 80% coverage
- **Integration Tests**: All critical paths
- **E2E Tests**: Main user workflows
- **Performance Tests**: Regular benchmarks
- **Security Tests**: All attack vectors

## Reporting Issues

When reporting issues, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Logs (sanitized)
5. Environment details
6. OpenChat version
7. Plugin version

## Resources

- [OpenChat Testing Guide](https://github.com/open-chat-labs/open-chat-bots/blob/main/TESTING.md)
- [ElizaOS Testing Docs](https://docs.elizaos.ai/testing)
- [Jest Documentation](https://jestjs.io/)
- [Artillery Load Testing](https://artillery.io/)
