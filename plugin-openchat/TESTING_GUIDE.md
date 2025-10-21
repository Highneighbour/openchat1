# 🧪 Testing Guide - OpenChat Plugin

## Quick Test Commands

After starting your bot, test these commands in OpenChat:

### 1. Basic Chat
```
/chat hi there
```
**Expected**: Bot responds with personalized greeting

### 2. Help Command
```
/help
```
**Expected**: Displays available commands and usage info

### 3. Info Command
```
/info
```
**Expected**: Shows information about the bot/agent

### 4. Multiple Messages
```
/chat hello
/chat how are you?
/chat tell me a joke
```
**Expected**: Bot responds to each message

## 🔍 What to Look For

### ✅ Success Indicators

1. **No Error 107**: Messages send without "message not finalized" error
2. **Placeholder Shows**: Brief "Thinking..." message appears
3. **Response Appears**: Placeholder replaced with actual response
4. **Multiple Sends Work**: Can send multiple messages in a row
5. **No Console Errors**: Server logs show successful sends

### ❌ Common Issues

#### Issue: Still Getting Error 107
**Solution**: 
- Rebuild the plugin: `cd plugin-openchat && npm run build`
- Restart your bot completely
- Clear any cached modules

#### Issue: Bot Not Responding
**Check**:
- Bot server is running (port 3000)
- Bot is registered on OpenChat
- Bot is installed in the chat
- Bot has proper permissions

#### Issue: "Bot client not initialised"
**Solution**:
- Check environment variables are set
- Verify JWT token is being sent
- Check bot definition endpoint works: `http://localhost:3000/bot_definition`

## 📊 Testing Checklist

### Before Testing
- [ ] Environment variables configured
- [ ] Bot server running on port 3000
- [ ] Bot registered on OpenChat
- [ ] Bot installed in test chat
- [ ] Permissions granted

### Command Tests
- [ ] `/chat` with simple message
- [ ] `/chat` with question
- [ ] `/help` displays correctly
- [ ] `/info` displays correctly
- [ ] Multiple consecutive messages

### Advanced Tests
- [ ] Mention bot in group: `@BotName hello`
- [ ] Direct message to bot
- [ ] Long message (test limits)
- [ ] Special characters
- [ ] Emoji support

## 🎯 Success Criteria

Your bot is working correctly if:

1. ✅ All commands respond without errors
2. ✅ Responses are contextually appropriate
3. ✅ Placeholder message appears briefly
4. ✅ Final message replaces placeholder
5. ✅ No error messages in console
6. ✅ Messages display correctly in OpenChat
7. ✅ Can handle multiple rapid messages

## 🐛 Debugging Tips

### Enable Debug Logging
Check your server console for:
```
[OpenChat] Bot client created for command
[OpenChat] Executing command: chat
[OpenChat] Message sent successfully
```

### Test Bot Definition
```bash
curl http://localhost:3000/bot_definition
```
Should return valid JSON with bot commands

### Check Environment Variables
```bash
echo $OPENCHAT_BOT_IDENTITY_PRIVATE_KEY
echo $OPENCHAT_PUBLIC_KEY
echo $OPENCHAT_IC_HOST
echo $OPENCHAT_STORAGE_INDEX_CANISTER
```
All should have values

### Verify Build
```bash
cd plugin-openchat
ls -la dist/
```
Should show compiled .js files

## 📝 Test Results Template

```markdown
## Test Run - [Date]

### Environment
- Bot Server: Running ✅/❌
- Port: 3000
- OpenChat: Mainnet/Testnet
- Bot Name: [Your Bot Name]

### Command Tests
- `/chat hello`: ✅/❌
- `/help`: ✅/❌
- `/info`: ✅/❌
- Multiple messages: ✅/❌

### Issues Found
- [ ] List any issues
- [ ] Error messages
- [ ] Unexpected behavior

### Notes
[Add any observations]
```

## 🚀 Load Testing

For production deployments:

1. **Rapid Fire Test**
   ```
   /chat test 1
   /chat test 2
   /chat test 3
   /chat test 4
   /chat test 5
   ```
   All should respond correctly

2. **Concurrent Users**
   - Have multiple users send commands simultaneously
   - Verify all get responses
   - Check for race conditions

3. **Long Sessions**
   - Send messages over extended period
   - Verify bot stays responsive
   - Check memory usage

## 📞 Getting Help

If tests fail:

1. **Check Documentation**
   - `README.md` - Full usage guide
   - `QUICKSTART.md` - Setup instructions
   - `MESSAGE_SENDING_FIX.md` - Error 107 fix

2. **Review Logs**
   - Server console output
   - Error messages
   - Stack traces

3. **Verify Setup**
   - Environment variables
   - Bot registration
   - Permissions granted

4. **Common Solutions**
   - Rebuild: `npm run build`
   - Restart bot server
   - Re-register bot
   - Grant all permissions

---

**Happy Testing!** 🎉

If everything passes, your OpenChat bot is ready for production! 🚀
