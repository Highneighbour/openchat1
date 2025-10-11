# Publishing @elizaos/client-openchat to npm

This guide walks you through publishing the OpenChat client plugin to npm so others can install and use it.

## Prerequisites

1. **npm Account**
   - Create account at [npmjs.com](https://www.npmjs.com)
   - Verify your email

2. **npm CLI**
   ```bash
   npm login
   # Enter your credentials
   ```

3. **Organization/Scope** (Optional)
   - For `@elizaos/` scope, you need to be part of the `elizaos` npm organization
   - OR publish under your own scope: `@yourname/client-openchat`
   - OR publish without scope: `elizaos-client-openchat`

## Pre-Publishing Checklist

### 1. Update Package Information

Edit `package.json`:

```json
{
  "name": "@elizaos/client-openchat",  // Or your chosen name
  "version": "0.1.0",
  "description": "OpenChat client plugin for ElizaOS",
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/client-openchat"
  },
  "bugs": {
    "url": "https://github.com/your-username/client-openchat/issues"
  },
  "homepage": "https://github.com/your-username/client-openchat#readme"
}
```

### 2. Add License

Create `LICENSE` file (MIT example):

```
MIT License

Copyright (c) 2024 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

### 3. Review Files to Publish

Check `package.json` `files` field:

```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

Preview what will be published:

```bash
npm pack --dry-run
```

### 4. Verify Build

```bash
# Clean build
npm run clean
npm run build

# Check dist/ contents
ls -la dist/

# Verify exports
cat dist/index.d.ts
```

### 5. Test Locally

Test the package before publishing:

```bash
# Create a tarball
npm pack

# In another project, install the tarball
npm install /path/to/elizaos-client-openchat-0.1.0.tgz

# Test that it works
```

## Publishing Steps

### 1. Login to npm

```bash
npm login
# Enter: username, password, email, OTP (if enabled)
```

### 2. Publish

#### First Time (Public Package)

```bash
npm publish --access public
```

#### If Using Scoped Package

```bash
# Public (free)
npm publish --access public

# Private (requires paid npm account)
npm publish --access restricted
```

### 3. Verify Publication

```bash
# Check on npm
npm info @elizaos/client-openchat

# Try installing
npm install @elizaos/client-openchat
```

## Version Management

### Semantic Versioning

Follow [semver](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- `1.0.0` - Initial stable release
- `1.1.0` - New features, backwards compatible
- `1.1.1` - Bug fixes
- `2.0.0` - Breaking changes

### Updating Versions

```bash
# Patch (0.1.0 -> 0.1.1)
npm version patch

# Minor (0.1.0 -> 0.2.0)
npm version minor

# Major (0.1.0 -> 1.0.0)
npm version major

# Custom
npm version 1.2.3
```

This automatically:
- Updates `package.json`
- Creates a git commit
- Creates a git tag

### Publishing Updates

```bash
# After version bump
npm run build
npm publish
```

## Distribution Tags

### Latest (Default)

```bash
npm publish  # Tags as 'latest'
```

### Beta/Alpha Versions

```bash
# For pre-release versions
npm version 0.2.0-beta.1
npm publish --tag beta

# Users install with:
npm install @elizaos/client-openchat@beta
```

### Managing Tags

```bash
# Add tag to existing version
npm dist-tag add @elizaos/client-openchat@0.1.0 latest

# Remove tag
npm dist-tag rm @elizaos/client-openchat beta

# List tags
npm dist-tag ls @elizaos/client-openchat
```

## Automated Publishing

### GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm ci
      - run: npm run build
      - run: npm test
      
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Setup:
1. Generate npm token: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Add to GitHub secrets as `NPM_TOKEN`
3. Create GitHub release to trigger publish

### Using np

Install `np` for interactive publishing:

```bash
npm install -g np

# Publish with np
np
```

Benefits:
- Interactive version selection
- Runs tests before publishing
- Creates git tags
- Pushes to GitHub
- Opens published package page

## Post-Publishing

### 1. Update Documentation

- Add installation instructions to README
- Update CHANGELOG.md
- Create GitHub release with notes

### 2. Announce

- ElizaOS Discord
- Twitter/X
- GitHub discussions
- OpenChat community

### 3. Monitor

- Watch npm download stats
- Monitor GitHub issues
- Respond to feedback

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Check for outdated deps
npm outdated

# Update major versions carefully
npm install @ai16z/eliza@latest
```

### Deprecating Versions

```bash
# Deprecate a version
npm deprecate @elizaos/client-openchat@0.1.0 "Use 0.2.0 or later"

# Deprecate all versions
npm deprecate @elizaos/client-openchat "Package moved to @new/location"
```

### Unpublishing (Use Carefully!)

```bash
# Can only unpublish within 72 hours
npm unpublish @elizaos/client-openchat@0.1.0

# Unpublish entire package (discouraged)
npm unpublish @elizaos/client-openchat --force
```

⚠️ **Warning**: Unpublishing breaks projects that depend on your package!

## Best Practices

### 1. Semantic Versioning

- Follow semver strictly
- Document breaking changes
- Provide migration guides

### 2. Changelog

Keep `CHANGELOG.md` updated:

```markdown
# Changelog

## [0.2.0] - 2024-01-15
### Added
- New feature X
### Changed
- Improved Y
### Fixed
- Bug in Z

## [0.1.0] - 2024-01-01
### Added
- Initial release
```

### 3. Testing

```bash
# Before publishing
npm run build
npm test
npm pack --dry-run
```

### 4. Documentation

- Keep README.md current
- Add JSDoc comments
- Provide examples
- Document breaking changes

### 5. Security

- Regularly update dependencies
- Run security audits: `npm audit`
- Enable 2FA on npm account
- Use npm tokens with limited scope

## Troubleshooting

### "You do not have permission to publish"

- Check if package name is available
- Login to correct npm account
- Request access to organization

### "Package name too similar"

- Choose a different name
- Add scope: `@yourname/client-openchat`

### "Version already exists"

- Bump version number
- Cannot republish same version

### Build Errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## Support

- **npm docs**: https://docs.npmjs.com/
- **Semantic Versioning**: https://semver.org/
- **npm support**: support@npmjs.com

---

## Quick Reference

```bash
# Complete publishing flow
npm version patch              # Bump version
npm run build                  # Build project
npm publish --access public    # Publish
git push --follow-tags        # Push to GitHub

# Update existing package
npm version minor
npm run build
npm publish
git push --follow-tags
```

Good luck with your publish! 🚀
