#!/bin/bash
# Script to package the Python Code Reviewer extension

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install vsce if not already installed
if ! command -v vsce &> /dev/null; then
    echo "Installing vsce..."
    npm install -g @vscode/vsce
fi

# Package the extension
echo "Packaging extension..."
vsce package

echo "Extension packaged successfully. You can install it in VS Code by:"
echo "1. Open VS Code"
echo "2. Go to Extensions view (Ctrl+Shift+X)"
echo "3. Click on the '...' menu (top-right of Extensions view)"
echo "4. Select 'Install from VSIX...'"
echo "5. Navigate to and select the .vsix file created in this directory"
