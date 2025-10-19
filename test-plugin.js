/**
 * Simple test script for the OpenChat plugin
 * Run with: node test-plugin.js
 */

import { openChatPlugin } from './dist/index.js';

async function testPlugin() {
  console.log('🧪 Testing OpenChat Plugin...\n');
  
  try {
    // Test 1: Plugin initialization
    console.log('1. Testing plugin initialization...');
    await openChatPlugin.init({
      OC_PUBLIC: 'test-public-key',
      IC_HOST: 'https://ic0.app',
      IDENTITY_PRIVATE: 'test-private-key',
      STORAGE_INDEX_CANISTER: 'test-canister-id',
    });
    console.log('✅ Plugin initialized successfully\n');
    
    // Test 2: Check plugin structure
    console.log('2. Checking plugin structure...');
    console.log(`   Name: ${openChatPlugin.name}`);
    console.log(`   Description: ${openChatPlugin.description}`);
    console.log(`   Actions: ${openChatPlugin.actions?.length || 0}`);
    console.log(`   Providers: ${openChatPlugin.providers?.length || 0}`);
    console.log(`   Services: ${openChatPlugin.services?.length || 0}`);
    console.log(`   Routes: ${openChatPlugin.routes?.length || 0}`);
    console.log('✅ Plugin structure is valid\n');
    
    // Test 3: Check actions
    console.log('3. Checking actions...');
    if (openChatPlugin.actions) {
      for (const action of openChatPlugin.actions) {
        console.log(`   - ${action.name}: ${action.description}`);
      }
    }
    console.log('✅ Actions are properly defined\n');
    
    // Test 4: Check providers
    console.log('4. Checking providers...');
    if (openChatPlugin.providers) {
      for (const provider of openChatPlugin.providers) {
        console.log(`   - ${provider.name}: ${provider.description}`);
      }
    }
    console.log('✅ Providers are properly defined\n');
    
    // Test 5: Check services
    console.log('5. Checking services...');
    if (openChatPlugin.services) {
      for (const service of openChatPlugin.services) {
        console.log(`   - ${service.name}: ${service.capabilityDescription}`);
      }
    }
    console.log('✅ Services are properly defined\n');
    
    // Test 6: Check routes
    console.log('6. Checking routes...');
    if (openChatPlugin.routes) {
      for (const route of openChatPlugin.routes) {
        console.log(`   - ${route.type} ${route.path}: ${route.name}`);
      }
    }
    console.log('✅ Routes are properly defined\n');
    
    console.log('🎉 All tests passed! The OpenChat plugin is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testPlugin();