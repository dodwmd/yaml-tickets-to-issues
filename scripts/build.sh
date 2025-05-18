#!/bin/bash
set -e

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the action
echo "Building the action..."
npm run build

echo "Build completed successfully!
