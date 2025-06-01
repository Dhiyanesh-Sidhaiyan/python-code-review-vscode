# Installing and Running the Python Code Reviewer Extension

Follow these steps to install and run the Python Code Reviewer extension:

## Prerequisites

- Visual Studio Code (1.60.0 or higher)
- Node.js and npm (for packaging the extension)
- Python 3.6 or higher
- OpenAI API key or compatible API service

## Step 1: Package the Extension

1. Open a terminal and navigate to the extension directory:
   ```
   cd python-code-reviewer
   ```

2. Make the packaging script executable (if not already):
   ```
   chmod +x package_extension.sh
   ```

3. Run the packaging script:
   ```
   ./package_extension.sh
   ```

   This will create a `.vsix` file in the current directory.

## Step 2: Install the Extension in VS Code

1. Open VS Code
2. Go to the Extensions view (Ctrl+Shift+X or Cmd+Shift+X on macOS)
3. Click on the "..." menu at the top-right of the Extensions view
4. Select "Install from VSIX..."
5. Navigate to and select the `.vsix` file created in Step 1

## Step 3: Configure the Extension

1. Open VS Code settings (File > Preferences > Settings)
2. Search for "Python Code Reviewer"
3. Configure the following settings:
   - `pythonCodeReviewer.apiKey`: Your OpenAI API key
   - `pythonCodeReviewer.baseUrl`: The base URL for the OpenAI service (default is "https://api.openai.com/v1")
   - `pythonCodeReviewer.model`: The model to use (default is "gpt-4")

## Step 4: Test the Extension

1. Open the sample Python file:
   ```
   code sample_code.py
   ```

2. Right-click anywhere in the editor
3. Select "Review Python Code with AI" from the context menu
4. Wait for the review to complete
5. A webview panel will appear with the code review results

## Troubleshooting

If you encounter any issues:

1. **"python: command not found" Error**: This occurs when the system can't find the Python executable. The extension will automatically try different Python commands (python3, python, py), but if that doesn't work:
   - Make sure Python is installed and in your PATH
   - On macOS/Linux, try using `python3` instead of `python` in your commands
   - You can manually specify your Python path in the VS Code settings
   - If you're using a virtual environment, make sure it's activated

2. **Missing Dependencies**: Make sure Python and the `openai` package are installed. The extension attempts to install dependencies automatically, but if it fails, you can install them manually:
   ```
   pip install openai
   ```
   or
   ```
   python3 -m pip install openai
   ```

3. **API Key Issues**: Verify that your API key is correctly set in the VS Code settings and that it's active. If you're using a custom API endpoint, make sure the base URL is correctly configured.

4. **Python Interpreter**: Ensure VS Code is using the correct Python interpreter by checking the Python extension settings.

5. **Extension Not Found**: If the "Review Python Code with AI" option doesn't appear in the context menu, try reloading VS Code (File > Reload Window).

6. **Debug Mode**: If you're still encountering issues, you can view the extension logs in the Output panel in VS Code (View > Output > Python Code Reviewer).

## Using Your Own Code

To review your own Python code:

1. Open any Python file in VS Code
2. Right-click in the editor
3. Select "Review Python Code with AI"
4. View the results in the panel that appears

## Extension Features

The code review covers:
- Code style and PEP 8 compliance
- Code quality and best practices
- Performance optimization suggestions
- Security vulnerability detection
- Logic and functionality issues
- Testing recommendations
