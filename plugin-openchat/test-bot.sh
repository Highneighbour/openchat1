#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     OpenChat Bot Server - Quick Test Script               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo ""
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your OpenChat credentials!"
    echo ""
    echo "Required variables:"
    echo "  • OPENCHAT_PUBLIC_KEY"
    echo "  • OPENCHAT_IC_HOST"
    echo "  • OPENCHAT_IDENTITY_PRIVATE_KEY"
    echo "  • OPENCHAT_STORAGE_CANISTER_ID"
    echo ""
    echo "Run: nano .env (or use your editor)"
    echo "Then run this script again"
    exit 1
fi

# Check if dist exists
if [ ! -d dist ]; then
    echo "📦 Building plugin..."
    npm run build
    echo ""
fi

echo "🚀 Starting OpenChat Bot Server..."
echo ""
echo "The bot will run on port specified in OPENCHAT_BOT_PORT (default: 3000)"
echo ""
echo "Press Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run start:bot
