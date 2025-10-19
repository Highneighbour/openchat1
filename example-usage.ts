/**
 * Example usage of the OpenChat plugin for ElizaOS
 * This file demonstrates how to integrate the plugin with an ElizaOS agent
 */

import { openChatPlugin } from './dist/index.js';

// Example agent configuration
const agentConfig = {
  name: 'OpenChat Agent',
  description: 'An ElizaOS agent that can interact with OpenChat',
  
  // Add the OpenChat plugin
  plugins: [openChatPlugin],
  
  // Plugin configuration
  pluginConfig: {
    'plugin-openchat': {
      OC_PUBLIC: process.env.OC_PUBLIC,
      IC_HOST: process.env.IC_HOST,
      IDENTITY_PRIVATE: process.env.IDENTITY_PRIVATE,
      STORAGE_INDEX_CANISTER: process.env.STORAGE_INDEX_CANISTER,
      BOT_SERVER_URL: process.env.BOT_SERVER_URL,
    }
  },
  
  // Character configuration
  character: {
    name: 'OpenChat Assistant',
    description: 'A helpful assistant that can interact with OpenChat users',
    personality: 'Friendly and helpful',
  },
  
  // Model configuration
  model: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
  },
};

// Example of how to use the plugin actions
async function exampleUsage() {
  console.log('OpenChat Plugin Example Usage');
  console.log('============================');
  
  // The plugin provides these actions:
  console.log('Available Actions:');
  console.log('1. SEND_OPENCHAT_MESSAGE - Send a message to OpenChat');
  console.log('2. REACT_TO_OPENCHAT_MESSAGE - React to a message with an emoji');
  console.log('3. READ_OPENCHAT_MESSAGES - Read recent messages from a chat');
  
  // The plugin provides this provider:
  console.log('Available Providers:');
  console.log('1. OPENCHAT_PROVIDER - Get information about OpenChat chats');
  
  // The plugin provides this service:
  console.log('Available Services:');
  console.log('1. OpenChatService - Manages bot connections and webhooks');
  
  console.log('\nTo use this plugin:');
  console.log('1. Set up your environment variables (see .env.example)');
  console.log('2. Register your bot with OpenChat');
  console.log('3. Deploy your bot server');
  console.log('4. Add the plugin to your ElizaOS agent configuration');
  console.log('5. Start your agent with the plugin enabled');
}

// Example of how to test the plugin locally
async function testPlugin() {
  console.log('\nTesting OpenChat Plugin...');
  
  try {
    // Initialize the plugin
    await openChatPlugin.init({
      OC_PUBLIC: process.env.OC_PUBLIC || 'test',
      IC_HOST: process.env.IC_HOST || 'https://ic0.app',
      IDENTITY_PRIVATE: process.env.IDENTITY_PRIVATE || 'test',
      STORAGE_INDEX_CANISTER: process.env.STORAGE_INDEX_CANISTER || 'test',
    });
    
    console.log('✅ Plugin initialized successfully');
    
    // Test the actions
    console.log('Available actions:', openChatPlugin.actions?.map(a => a.name));
    console.log('Available providers:', openChatPlugin.providers?.map(p => p.name));
    console.log('Available services:', openChatPlugin.services?.map(s => s.name));
    
  } catch (error) {
    console.error('❌ Plugin initialization failed:', error);
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleUsage();
  testPlugin();
}

export { agentConfig, exampleUsage, testPlugin };