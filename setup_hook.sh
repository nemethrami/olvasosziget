#!/bin/bash

# Define the pre-commit hook content
HOOK_CONTENT='#!/bin/sh

# Run tests before commit
echo "Running tests..."

# Go to frontend directory
cd frontend

# Install dependencies
npm install

# Run Jest tests
npm run test:jest

# Check if the tests passed (exit code 0)
if [ $? -ne 0 ]; then
  echo "Jest tests failed! Commit blocked."
  exit 1  # Exit with a non-zero code to prevent the commit
fi

echo "est tests passed. Proceeding with commit."
exit 0
'

if [ -d ".git/hooks" ]; then
  echo "$HOOK_CONTENT" > .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
  echo "pre-commit hook created successfully."
else
  echo "Error: .git/hooks directory not found. Make sure this is a Git repository."
fi
