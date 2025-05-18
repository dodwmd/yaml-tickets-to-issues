# YAML Tickets to GitHub Issues

[![GitHub release](https://img.shields.io/github/v/release/dodwmd/yaml-tickets-to-issues?style=flat-square)](https://github.com/dodwmd/yaml-tickets-to-issues/releases)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/dodwmd/yaml-tickets-to-issues/ci.yml?branch=master&style=flat-square)](https://github.com/dodwmd/yaml-tickets-to-issues/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A GitHub Action that syncs YAML ticket files with GitHub Issues, making it easy to manage issues as code in your repository.

## Features

- 🚀 **Convert YAML to GitHub Issues** - Define your issues in YAML files and sync them with GitHub
- 🔄 **Bidirectional Sync** - Updates existing issues when YAML files change
- 🔍 **Smart File Naming** - Automatically renames YAML files to include GitHub issue numbers
- 📋 **Rich Issue Templates** - Support for various fields like:
  - Descriptions and titles
  - Acceptance criteria
  - Technical details
  - Sub-tasks
  - Dependencies
  - Metadata (complexity, estimated time, etc.)
- 🛡️ **Validation** - Built-in YAML schema validation
- 🔄 **Dry Run Mode** - Preview changes before applying them

## 🚀 Getting Started

### Prerequisites

- A GitHub repository
- GitHub Actions enabled for your repository
- Node.js 16+ (for local development)

### Installation

1. **Add the action to your repository**

   Create a new workflow file (e.g., `.github/workflows/sync-issues.yml`) in your repository:

   ```yaml
   name: Sync YAML Tickets to Issues
   
   on:
     workflow_dispatch:  # Manual trigger
     push:
       branches: [ master ]
       paths:
         - 'tickets/**'
   
   jobs:
     sync-issues:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Sync YAML tickets to GitHub Issues
           uses: dodwmd/yaml-tickets-to-issues@master
           with:
             token: ${{ secrets.GITHUB_TOKEN }}
             tickets-path: 'tickets/'
             dry-run: 'false'  # Set to 'true' for testing
             debug: 'false'     # Set to 'true' for verbose debug logging
   ```

2. **Create a `tickets` directory** in your repository

3. **Add your YAML ticket files** (see example below)

4. **Commit and push** your changes to trigger the workflow

## 🔍 Debugging

To enable verbose debug logging, set the `debug` input to `true`:

```yaml
- name: Sync YAML tickets to GitHub Issues
  uses: dodwmd/yaml-tickets-to-issues@master
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    debug: 'true'  # Enable debug logging
```

### Logging Features

- **Timestamps**: Each log entry includes a timestamp and elapsed time
- **Log Levels**: Different log levels (INFO, WARN, ERROR, DEBUG)
- **Structured Logging**: Objects are logged in a readable format
- **Grouping**: Related log messages are grouped together
- **Emoji Indicators**: Visual indicators for different message types
- **Debug Mode**: Detailed debugging information when enabled

## 📝 YAML Ticket Format

Create YAML files in your `tickets/` directory following this format:

```yaml
# tickets/TICKET-123-my-awesome-feature.yaml
title: "[FEATURE] Implement Awesome Feature"
description: |
  As a user, I want to be able to do something awesome
  so that I can be more productive.

# Optional fields
acceptance_criteria:
  - The feature should work as expected
  - It should be performant
  - It should be well-documented

technical_details:
  architecture:
    - Backend: Node.js with Express
    - Frontend: React
    - Database: PostgreSQL
  performance_considerations:
    - Should handle 1000+ concurrent users
    - Response time under 200ms

# Optional: Link to child tickets
child_tickets:
  - id: TICKET-124
    title: Implement database schema
  - id: TICKET-125
    title: Create API endpoints

# Optional: List of sub-tasks
sub_tasks:
  - Design the database schema
  - Implement the backend API
  - Create the frontend components
  - Write tests

# Optional: Dependencies
dependencies:
  - TICKET-100: Implement authentication
  - TICKET-101: Set up database

# Optional: Metadata
estimated_time: 3 days
complexity: Medium
change_impact: High
```

## 🔧 Configuration

### Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `token` | GitHub token with `repo` scope | Yes | - |
| `tickets-path` | Path to the directory containing YAML ticket files | No | `tickets/` |
| `dry-run` | Run without making any changes | No | `false` |

### Outputs

None

## 🛠️ Development

### Prerequisites

- Node.js 16+
- npm 7+

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/dodwmd/yaml-tickets-to-issues.git
   cd yaml-tickets-to-issues
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Build the action**
   ```bash
   npm run build
   ```

### Scripts

- `npm run build` - Build the action
- `npm run format` - Format code with Prettier
- `npm run lint` - Lint TypeScript and YAML files
- `npm test` - Run tests
- `npm run all` - Run all checks (lint, format, build, test)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by various issue-as-code approaches
- Built with ❤️ by the community

## 📚 Examples

### Basic Issue

```yaml
# tickets/TICKET-101-basic-issue.yaml
title: "[BUG] Fix login page error"
description: |
  Users are seeing a 500 error when trying to log in.
  
  **Steps to reproduce:**
  1. Go to login page
  2. Enter valid credentials
  3. Click "Sign In"
  4. See error

acceptance_criteria:
  - Users can log in successfully
  - Error message is clear if login fails
  - Logs contain sufficient information for debugging

dependencies:
  - TICKET-100: Update authentication service

estimated_time: 2h
complexity: Low
```

### Feature with Multiple Components

```yaml
# tickets/TICKET-102-user-profile.yaml
title: "[FEATURE] User Profile Page"
description: |
  As a user, I want to view and edit my profile information
  so that I can keep my details up to date.

acceptance_criteria:
  - Users can view their profile information
  - Users can update their name, email, and profile picture
  - Changes are validated before saving
  - Success/error messages are displayed appropriately

technical_details:
  frontend:
    - New React component: `UserProfile`
    - Form validation using Formik
    - Image upload component
  backend:
    - New endpoint: `PATCH /api/users/:id`
    - File storage for profile pictures
    - Input validation middleware

child_tickets:
  - id: TICKET-103
    title: Implement profile picture upload
  - id: TICKET-104
    title: Add email verification

estimated_time: 5 days
complexity: Medium
change_impact: Medium
```

## 🚨 Troubleshooting

### Common Issues

1. **YAML Validation Errors**
   - Make sure your YAML is properly indented
   - Use a YAML linter to catch syntax errors
   - Check for missing colons or incorrect nesting

2. **Permission Issues**
   - Ensure your GitHub token has the required permissions
   - The default `GITHUB_TOKEN` has sufficient permissions for most cases

3. **File Naming**
   - Files should be named in the format `TICKET-{number}-description.yaml`
   - Numbers will be automatically assigned if not provided

## 📈 Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [releases page](https://github.com/dodwmd/yaml-tickets-to-issues/releases).

## 📜 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a history of changes to this project.
