#!/bin/bash

echo "🔄 OpenChat Plugin Reinstallation Script"
echo "========================================"
echo ""

# Check if project path is provided
if [ -z "$1" ]; then
    echo "❌ Error: Project path not provided"
    echo ""
    echo "Usage: ./reinstall.sh /path/to/your/eliza/project"
    echo "Example: ./reinstall.sh /workspaces/openchat1/openchat"
    exit 1
fi

PROJECT_DIR="$1"
PLUGIN_DIR="/workspace/plugin-openchat"

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: Project directory not found: $PROJECT_DIR"
    exit 1
fi

# Check if plugin directory exists
if [ ! -d "$PLUGIN_DIR" ]; then
    echo "❌ Error: Plugin directory not found: $PLUGIN_DIR"
    exit 1
fi

echo "📁 Project Directory: $PROJECT_DIR"
echo "📦 Plugin Directory: $PLUGIN_DIR"
echo ""

# Navigate to project
cd "$PROJECT_DIR" || exit 1

# Remove old version
echo "🗑️  Removing old plugin..."
npm uninstall @elizaos/plugin-openchat 2>/dev/null

# Clear cache
echo "🧹 Clearing cache..."
rm -rf node_modules/@elizaos/plugin-openchat
rm -rf node_modules/.cache 2>/dev/null

# Install new version
echo "⬇️  Installing fixed plugin..."
npm install "$PLUGIN_DIR"

# Verify installation
echo ""
echo "✅ Verifying installation..."
if grep -q "setFinalised" node_modules/@elizaos/plugin-openchat/dist/bot/handlers/executeCommand.js 2>/dev/null; then
    echo "✅ Fix verified in installed plugin!"
    echo ""
    echo "Found these setFinalised calls:"
    grep -n "setFinalised" node_modules/@elizaos/plugin-openchat/dist/bot/handlers/executeCommand.js | head -3
else
    echo "❌ Fix NOT found in installed plugin!"
    echo "   Please check if installation succeeded."
    exit 1
fi

# Rebuild project if package.json has build script
echo ""
if grep -q '"build"' package.json 2>/dev/null; then
    echo "🔨 Rebuilding project..."
    npm run build
else
    echo "ℹ️  No build script found, skipping rebuild"
fi

echo ""
echo "🎉 Installation Complete!"
echo ""
echo "Next steps:"
echo "1. Restart your bot (stop current process with Ctrl+C)"
echo "2. Start bot: npm start (or elizaos start)"
echo "3. Test with: /chat hi there"
echo ""
echo "✅ Error 107 should be fixed!"
