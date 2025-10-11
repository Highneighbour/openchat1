# Changelog

All notable changes to @elizaos/client-openchat will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2024-01-XX

### Added
- Initial release of OpenChat client plugin for ElizaOS
- `OpenChatClient` class implementing ElizaOS Client interface
- Express server for handling OpenChat bot webhooks
- `/bot_definition` endpoint for bot registration
- `/execute_command` endpoint for command processing
- `/prompt` command for user interactions
- JWT authentication with OpenChat platform
- Context-aware message processing through ElizaOS
- Conversation memory persistence
- Support for OpenChat's message types (Text, Poll, Image, File)
- Health check endpoint
- TypeScript support with full type definitions
- Comprehensive documentation and examples

### Features
- Seamless integration with ElizaOS agent runtime
- Automatic user and room state management
- Message history and context tracking
- Support for multiple AI providers (OpenAI, Anthropic, etc.)
- Configurable via environment variables
- Debug logging support

### Documentation
- README with installation and usage guide
- PLUGIN_USAGE guide for agent creators
- PUBLISHING guide for contributors
- Example character configuration
- Environment variable templates

[Unreleased]: https://github.com/your-org/client-openchat/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-org/client-openchat/releases/tag/v0.1.0
