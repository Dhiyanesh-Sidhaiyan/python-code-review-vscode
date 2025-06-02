# Python Code Reviewer

An AI-powered code review extension for Visual Studio Code that analyzes Python code and provides constructive feedback.

## Features

- Review Python code with a single click from the context menu
- Get detailed feedback on:
  - Code style and PEP 8 compliance
  - Code quality and best practices
  - Performance optimization suggestions
  - Security vulnerability detection
  - Logic and functionality issues
  - Testing recommendations
- Configurable AI model and API settings

## Requirements

- Visual Studio Code 1.60.0 or higher
- Python 3.6 or higher
- OpenAI API key or compatible API service
- Python package: `openai` (will be installed automatically)

## Installation

1. Install the extension from the VS Code Marketplace or download the VSIX file and install it manually
2. Configure your API settings in VS Code preferences:
   - Go to File > Preferences > Settings
   - Search for "Python Code Reviewer"
   - Set your API key and other options
3. Open a Python file and right-click to access the "Review Python Code with AI" option

## Configuration

This extension contributes the following settings:

* `pythonCodeReviewer.apiKey`: API key for the OpenAI service
* `pythonCodeReviewer.baseUrl`: Base URL for the OpenAI service (default: "https://api.openai.com/v1")
* `pythonCodeReviewer.model`: Model to use for code review (default: "gpt-4")

## Usage

1. Open a Python file in VS Code
2. Right-click anywhere in the editor
3. Select "Review Python Code with AI" from the context menu
4. Wait for the review to complete
5. Review the results in the webview panel that appears

## How It Works

The extension uses the OpenAI API to analyze your Python code and provide detailed feedback. The code is sent to the API along with a specialized prompt that focuses on Python best practices, code quality, performance, security, and logic.

## Privacy and Security

Your code is sent to the OpenAI API for analysis. The extension does not store your code or the review results. Make sure to review your code for sensitive information before using this extension, and ensure you're comfortable with your code being processed by the API service you configure.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
