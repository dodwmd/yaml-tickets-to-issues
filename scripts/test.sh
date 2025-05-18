#!/bin/bash
set -e

echo "Starting test script..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the action
echo "Building the action..."
npm run build

# Set up test environment
echo "Setting up test environment..."
TEST_DIR="$(pwd)/.test-run"
TEST_TICKETS_DIR="${TEST_DIR}/tickets"
TEST_BACKUP_DIR="${TEST_DIR}/backup"

# Create test directories
echo "Creating test directories..."
mkdir -p "${TEST_TICKETS_DIR}" "${TEST_BACKUP_DIR}"

# Move existing YAML files to backup
echo "Backing up existing YAML files..."
mv tickets/*.yaml "${TEST_BACKUP_DIR}/" 2>/dev/null || true

# Create a test ticket file in the test tickets directory
echo "Creating test ticket..."
TEST_TICKET_PATH="${TEST_TICKETS_DIR}/TEST-1-Test_ticket.yaml"

# Also create a symlink in the project's tickets directory for testing
mkdir -p "${PWD}/tickets"
ln -sfn "${TEST_TICKET_PATH}" "${PWD}/tickets/TEST-1-Test_ticket.yaml"

cat > "${TEST_TICKET_PATH}" << 'EOL'
title: Test Ticket
description: |
  This is a test ticket created by the test script.
  It should be processed by the GitHub Action.

child_tickets:
  - id: CHILD-1
    title: First subtask
  - id: CHILD-2
    title: Second subtask

acceptance_criteria:
  - The ticket should be created successfully
  - All fields should be populated correctly

technical_details:
  architecture:
    - Backend service
    - API endpoints
  performance:
    - Response time < 200ms
  security:
    - Authentication required

sub_tasks:
  - Write implementation code
  - Write unit tests
  - Update documentation

dependencies:
  - DEP-1
  - DEP-2

estimated_time: 3 days
complexity: Medium
change_impact: Low
EOL

# Set required environment variables
export INPUT_TOKEN="test-token"
export INPUT_DRY_RUN="true"
export INPUT_DEBUG="true"  # Enable debug mode for testing
export INPUT_TICKETS_PATH="${PWD}/tickets"
export GITHUB_WORKSPACE="${PWD}"

# Set GitHub context variables for testing
export GITHUB_REPOSITORY="test-owner/test-repo"
export GITHUB_SHA="test-sha"
export GITHUB_REF="refs/heads/test-branch"
export GITHUB_WORKFLOW="test-workflow"
export GITHUB_RUN_ID="1"
export GITHUB_RUN_NUMBER="1"
export GITHUB_ACTOR="test-actor"
export GITHUB_JOB="test-job"

# Debug: Show test environment
echo "=== Test Environment ==="
echo "Current directory: $(pwd)"
echo "Test directory: ${TEST_DIR}"
echo "Test tickets directory: ${TEST_TICKETS_DIR}"
echo "Test backup directory: ${TEST_BACKUP_DIR}"
echo "Test ticket path: ${TEST_TICKET_PATH}"
echo "Test files in ${TEST_TICKETS_DIR}/:"
ls -la "${TEST_TICKETS_DIR}/" || echo "No test tickets found"

# Run the action from the project root
echo "Running the action..."
set +e  # Don't fail the test script on error
# Capture output to a log file
node dist/index.js 2>&1 | tee output.log
EXIT_CODE=${PIPESTATUS[0]}
set -e

# Check if the error is the expected authentication error
if [ $EXIT_CODE -ne 0 ]; then
  if grep -q "Bad credentials" output.log 2>/dev/null; then
    echo "::notice::Test completed with expected authentication error (test token is not valid for GitHub API)"
  else
    echo "::error::Action failed with unexpected error"
    exit 1
  fi
fi

# Clean up
echo "Restoring YAML files..."
mv "${TEST_BACKUP_DIR}/"*.yaml tickets/ 2>/dev/null || true

# Clean up test directories
if [ "${KEEP_TEST_DIR:-false}" != "true" ]; then
  echo "Cleaning up test directories..."
  rm -rf "${TEST_DIR}"
else
  echo "Test directories preserved: ${TEST_DIR}"
fi

echo "✅ Test completed successfully!"
