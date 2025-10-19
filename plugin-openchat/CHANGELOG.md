# Changelog

All notable changes to the OpenChat plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-19

### Added
- Initial release of OpenChat plugin for ElizaOS
- Core features:
  - Full OpenChat bot integration
  - Message sending and receiving
  - Reaction support
  - Poll creation
  - Message deletion
  - Chat information retrieval
  - Member management
- Actions:
  - `SEND_OPENCHAT_MESSAGE` - Send text messages
  - `ADD_OPENCHAT_REACTION` - Add emoji reactions
  - `CREATE_OPENCHAT_POLL` - Create polls
  - `DELETE_OPENCHAT_MESSAGE` - Delete messages
  - `GET_OPENCHAT_INFO` - Get chat information
- Providers:
  - `openChatProvider` - Chat context provider
  - `openChatUserProvider` - User information provider
- Evaluators:
  - `shouldRespondEvaluator` - Response decision logic
  - `sentimentEvaluator` - Sentiment analysis
  - `topicEvaluator` - Topic detection
- Bot server with Express
- Comprehensive documentation and examples
- TypeScript support with full type definitions

### Features
- Autonomous message handling
- Thread support
- Channel and community support
- Real-time message processing
- Webhook integration
- Health check endpoint
- Extensible architecture

### Documentation
- Complete README with setup instructions
- API reference
- Usage examples
- Troubleshooting guide
- Character configuration examples

## [Unreleased]

### Planned
- Image and file upload support enhancement
- Advanced poll features
- Community management actions
- Channel management actions
- Message search functionality
- User profile management
- Enhanced error handling
- Retry mechanisms
- Rate limiting
- Metrics and analytics
- Multi-language support
- Custom middleware support
