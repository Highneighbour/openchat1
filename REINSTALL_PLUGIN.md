# 🔄 How to Reinstall the Fixed Plugin

## ⚠️ Important: You Must Reinstall!

The fixes are compiled in `/workspace/plugin-openchat/dist/`, but your project is using an **old cached version**. You need to reinstall the plugin.

## 📍 Step-by-Step Instructions

### 1. Navigate to Your Project Directory

Based on your log output, your project is at:
```bash
cd /workspaces/openchat1/openchat
```

### 2. Uninstall the Old Plugin

```bash
npm uninstall @elizaos/plugin-openchat
```

### 3. Install the Updated Plugin

```bash
npm install /workspace/plugin-openchat
```

### 4. Verify Installation

Check that the fix is installed:
```bash
grep "setFinalised" node_modules/@elizaos/plugin-openchat/dist/bot/handlers/executeCommand.js
```

You should see multiple lines with `.setFinalised(true)` and `.setFinalised(false)`

### 5. Rebuild Your Project (if needed)

```bash
npm run build
# or
bun run build
```

### 6. Restart Your Bot

Stop the current bot (Ctrl+C) and restart:
```bash
npm start
# or
elizaos start
```

## 🎯 Quick Command Sequence

Copy and paste this entire sequence:

```bash
cd /workspaces/openchat1/openchat
npm uninstall @elizaos/plugin-openchat
npm install /workspace/plugin-openchat
npm run build
# Then restart your bot
```

## ✅ Verification After Restart

1. **Check the logs** - Should see:
   ```
   OpenChat Bot Ready
   Bot server running on port 3001
   ```

2. **Test the command** in OpenChat:
   ```
   /chat hi there
   ```

3. **Expected result**:
   - "Thinking..." appears briefly
   - Then actual response appears
   - **No Error 107!** ✅

## 🔍 If Still Not Working

### Check Installation Path

```bash
ls -la node_modules/@elizaos/plugin-openchat/dist/bot/handlers/
```

Should show recently modified files (with today's timestamp)

### Check File Contents

```bash
cat node_modules/@elizaos/plugin-openchat/dist/bot/handlers/executeCommand.js | grep -A 2 "createTextMessage"
```

Should show `.setFinalised(true)` or `.setFinalised(false)` after each `createTextMessage`

### Clear Node Cache

If using npm:
```bash
rm -rf node_modules/@elizaos/plugin-openchat
npm cache clean --force
npm install /workspace/plugin-openchat
```

If using bun:
```bash
rm -rf node_modules/@elizaos/plugin-openchat
bun install /workspace/plugin-openchat
```

## 🐛 Troubleshooting

### "Cannot find module" error
**Solution**: Make sure the path is correct
```bash
# Use absolute path
npm install /workspace/plugin-openchat

# Or relative path from your project
npm install ../../../workspace/plugin-openchat
```

### Still getting Error 107
**Causes**:
1. Old plugin version still cached
2. Project not rebuilt
3. Bot not restarted

**Solution**:
```bash
# Nuclear option - complete refresh
rm -rf node_modules/@elizaos/plugin-openchat
rm -rf node_modules/.cache
npm install /workspace/plugin-openchat
npm run build
# Restart bot
```

### Plugin version shows 0.1.0 but still broken
**Solution**: The version number won't change, but the code should. Check file timestamps:
```bash
ls -lt node_modules/@elizaos/plugin-openchat/dist/bot/handlers/
```

Files should show recent modification time (today's date).

## 📊 What Should Change

### Before (Old Version):
```javascript
const msg = await client.createTextMessage("Hello!");
await client.sendMessage(msg);  // ❌ Missing setFinalised
```

### After (Fixed Version):
```javascript
const msg = (await client.createTextMessage("Hello!")).setFinalised(true);
await client.sendMessage(msg);  // ✅ Properly finalized
```

## ✨ Success Indicators

You'll know it's working when:

1. ✅ Bot starts without errors
2. ✅ `/chat` command responds
3. ✅ "Thinking..." placeholder appears
4. ✅ Final response replaces placeholder
5. ✅ **No Error 107 in logs**
6. ✅ Messages display in OpenChat

## 📝 Complete Reinstall Script

Save this as `reinstall.sh` and run it:

```bash
#!/bin/bash
echo "🔄 Reinstalling OpenChat Plugin..."

# Navigate to project
cd /workspaces/openchat1/openchat

# Remove old version
echo "📦 Removing old plugin..."
npm uninstall @elizaos/plugin-openchat

# Clear cache
echo "🧹 Clearing cache..."
rm -rf node_modules/@elizaos/plugin-openchat
rm -rf node_modules/.cache

# Install new version
echo "⬇️ Installing fixed plugin..."
npm install /workspace/plugin-openchat

# Verify installation
echo "✅ Verifying installation..."
if grep -q "setFinalised" node_modules/@elizaos/plugin-openchat/dist/bot/handlers/executeCommand.js; then
    echo "✅ Fix verified in installed plugin!"
else
    echo "❌ Fix NOT found in installed plugin!"
    exit 1
fi

# Rebuild project
echo "🔨 Rebuilding project..."
npm run build

echo "🎉 Done! Now restart your bot and test with: /chat hi there"
```

Make it executable and run:
```bash
chmod +x reinstall.sh
./reinstall.sh
```

---

**After following these steps, restart your bot and test again!** 🚀

The error should be gone! If you still see Error 107 after a complete reinstall and restart, let me know and we'll investigate further.
