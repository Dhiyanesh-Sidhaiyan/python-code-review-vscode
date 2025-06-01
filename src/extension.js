const vscode = require('vscode');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Python Code Reviewer is now active');
    
    // Install dependencies when the extension is activated
    const extensionPath = context.extensionPath;
    const installScriptPath = path.join(extensionPath, 'src', 'install_dependencies.py');
    
    // Try different Python commands
    const tryInstallWithPython = (pythonCommand) => {
        try {
            // Run the installation script asynchronously
            const installProcess = require('child_process').spawn(
                pythonCommand, 
                [installScriptPath], 
                { 
                    detached: true,
                    stdio: 'ignore'
                }
            );
            installProcess.unref();
            return true;
        } catch (error) {
            console.log(`Failed to install dependencies with ${pythonCommand}: ${error.message}`);
            return false;
        }
    };
    
    // Try with different Python commands
    if (!tryInstallWithPython('/Users/dhiyanesh/.local/share/virtualenvs/capital-batch-bks4A6WW/bin/python3') &&
        !tryInstallWithPython('python3') && 
        !tryInstallWithPython('python') && 
        !tryInstallWithPython('py')) {
        console.error('Failed to install dependencies: No Python interpreter found');
    }

    let disposable = vscode.commands.registerCommand('python-code-reviewer.reviewCode', async function () {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            const document = editor.document;
            if (document.languageId !== 'python') {
                vscode.window.showErrorMessage('This is not a Python file');
                return;
            }

            // Show progress indicator
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Reviewing code...",
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0 });
                
                try {
                    // Get the code from the current document
                    const code = document.getText();
                    
                    // Save code to a temporary file
                    const tempDir = os.tmpdir();
                    const tempFilePath = path.join(tempDir, 'code_to_review.py');
                    fs.writeFileSync(tempFilePath, code, 'utf8');
                    
                    // Get the path to the code_reviewer.py script
                    const extensionPath = context.extensionPath;
                    const reviewerScriptPath = path.join(extensionPath, 'src', 'code_reviewer.py');
                    
                    // Get configuration
                    const config = vscode.workspace.getConfiguration('pythonCodeReviewer');
                    const apiKey = config.get('apiKey');
                    const baseUrl = config.get('baseUrl');
                    const model = config.get('model');
                    
                    if (!apiKey) {
                        vscode.window.showErrorMessage('API key not configured. Please set pythonCodeReviewer.apiKey in settings.');
                        return;
                    }
                    
                    // Call the Python script to review the code
                    // Try different Python commands, as 'python' might not be available
                    let reviewResult;
                    try {
                        // Use the specific Python path we know works
                        const pythonPath = '/Users/dhiyanesh/.local/share/virtualenvs/capital-batch-bks4A6WW/bin/python3';
                        const command = `"${pythonPath}" "${reviewerScriptPath}" "${tempFilePath}" "${apiKey}" "${baseUrl}" "${model}"`;
                        reviewResult = execSync(command, { encoding: 'utf8' });
                    } catch (pythonError) {
                        try {
                            // First try with python3 (common on macOS and Linux)
                            const command = `python3 "${reviewerScriptPath}" "${tempFilePath}" "${apiKey}" "${baseUrl}" "${model}"`;
                            reviewResult = execSync(command, { encoding: 'utf8' });
                        } catch (pythonError2) {
                            try {
                                // If python3 fails, try with python (common on Windows)
                                const command = `python "${reviewerScriptPath}" "${tempFilePath}" "${apiKey}" "${baseUrl}" "${model}"`;
                                reviewResult = execSync(command, { encoding: 'utf8' });
                            } catch (pythonError3) {
                                // If both fail, get the python path from the system
                                try {
                                    // Try to find Python path using 'which' on Unix or 'where' on Windows
                                    const pythonPathCommand = process.platform === 'win32' ? 'where python' : 'which python3 || which python';
                                    const pythonPath = execSync(pythonPathCommand, { encoding: 'utf8' }).trim();
                                    
                                    const command = `"${pythonPath}" "${reviewerScriptPath}" "${tempFilePath}" "${apiKey}" "${baseUrl}" "${model}"`;
                                    reviewResult = execSync(command, { encoding: 'utf8' });
                                } catch (error) {
                                    throw new Error("Could not find a Python interpreter. Please make sure Python is installed and in your PATH.");
                                }
                            }
                        }
                    }
                    
                    // Create and show the review panel
                    const panel = vscode.window.createWebviewPanel(
                        'codeReview',
                        'Code Review',
                        vscode.ViewColumn.Beside,
                        {
                            enableScripts: true
                        }
                    );
                    
                    panel.webview.html = getWebviewContent(reviewResult);
                    
                    // Clean up the temporary file
                    fs.unlinkSync(tempFilePath);
                    
                    progress.report({ increment: 100 });
                } catch (error) {
                    vscode.window.showErrorMessage(`Error during code review: ${error.message}`);
                    console.error(error);
                }
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
            console.error(error);
        }
    });

    context.subscriptions.push(disposable);
}

/**
 * Create HTML content for the webview panel
 * @param {string} reviewContent - The review content
 * @returns {string} HTML content
 */
function getWebviewContent(reviewContent) {
    // Parse the review content to extract issues for better display
    const processedContent = processReviewContent(reviewContent);
    
    // Store the original full response
    const fullResponse = reviewContent;
    
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code Review</title>
        <style>
            :root {
                --background-color: #252526;
                --foreground-color: #e2e2e2;
                --primary-color: #0078d7;
                --secondary-color: #333333;
                --success-color: #4BB543;
                --warning-color: #FFC107;
                --error-color: #FF5252;
                --border-color: #454545;
                --container-bg: #1e1e1e;
                --hover-color: #2a2d2e;
            }
            
            .light-theme {
                --background-color: #f5f5f5;
                --foreground-color: #333333;
                --primary-color: #0078d7;
                --secondary-color: #e4e4e4;
                --success-color: #22863a;
                --warning-color: #b08800;
                --error-color: #cb2431;
                --border-color: #d0d7de;
                --container-bg: #ffffff;
                --hover-color: #f0f0f0;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                padding: 20px;
                line-height: 1.6;
                background-color: var(--background-color);
                color: var(--foreground-color);
                margin: 0;
                transition: all 0.3s ease;
            }
            
            h1 {
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 10px;
                color: var(--primary-color);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .header-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 10px;
            }
            
            .theme-toggle {
                background-color: var(--secondary-color);
                color: var(--foreground-color);
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.3s;
            }
            
            .theme-toggle:hover {
                background-color: var(--hover-color);
            }
            
            .review-container {
                background-color: var(--container-bg);
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
            }
            
            .issue {
                margin-bottom: 20px;
                padding: 15px;
                border-radius: 6px;
                background-color: var(--secondary-color);
                border-left: 4px solid var(--primary-color);
                transition: all 0.3s ease;
            }
            
            .issue:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            
            .issue-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
            }
            
            .issue-title {
                font-weight: bold;
                color: var(--foreground-color);
                font-size: 16px;
                margin: 0;
            }
            
            .issue-description {
                margin-top: 10px;
                color: var(--foreground-color);
                opacity: 0.9;
                overflow: hidden;
                transition: max-height 0.3s ease;
            }
            
            .issue-actions {
                margin-top: 10px;
                display: flex;
                gap: 10px;
            }
            
            button {
                background-color: var(--primary-color);
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.3s;
            }
            
            button:hover {
                opacity: 0.9;
            }
            
            .copy-button {
                background-color: var(--secondary-color);
            }
            
            .success {
                border-left-color: var(--success-color);
            }
            
            .warning {
                border-left-color: var(--warning-color);
            }
            
            .error {
                border-left-color: var(--error-color);
            }
            
            .tag {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 12px;
                margin-left: 8px;
            }
            
            .success-tag {
                background-color: var(--success-color);
                color: white;
            }
            
            .warning-tag {
                background-color: var(--warning-color);
                color: black;
            }
            
            .error-tag {
                background-color: var(--error-color);
                color: white;
            }
            
            .collapsed .issue-description {
                display: none;
            }
            
            .expand-icon {
                transition: transform 0.3s ease;
            }
            
            .collapsed .expand-icon {
                transform: rotate(-90deg);
            }
            
            .summary-bar {
                display: flex;
                justify-content: space-between;
                padding: 10px 15px;
                background-color: var(--secondary-color);
                border-radius: 6px;
                margin-bottom: 20px;
            }
            
            .summary-item {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .code-block {
                background-color: var(--secondary-color);
                padding: 10px;
                border-radius: 4px;
                font-family: 'Courier New', Courier, monospace;
                overflow-x: auto;
                margin: 10px 0;
            }
            
            /* Tabs styling */
            .tabs {
                display: flex;
                margin-bottom: 20px;
            }
            
            .tab {
                padding: 10px 20px;
                cursor: pointer;
                background-color: var(--secondary-color);
                border: none;
                color: var(--foreground-color);
                border-radius: 4px 4px 0 0;
                margin-right: 5px;
            }
            
            .tab.active {
                background-color: var(--primary-color);
                color: white;
            }
            
            .tab-content {
                display: none;
            }
            
            .tab-content.active {
                display: block;
            }
            
            /* Full response styling */
            .full-response {
                background-color: var(--container-bg);
                border-radius: 8px;
                padding: 20px;
                white-space: pre-wrap;
                font-family: 'Courier New', Courier, monospace;
                overflow-x: auto;
                border: 1px solid var(--border-color);
                color: var(--foreground-color);
                margin-bottom: 20px;
            }
            
            @media (max-width: 768px) {
                body {
                    padding: 10px;
                }
                
                .header-container {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .theme-toggle {
                    margin-top: 10px;
                }
                
                .summary-bar {
                    flex-direction: column;
                    gap: 10px;
                }
            }
        </style>
    </head>
    <body>
        <div class="header-container">
            <h1>AI Code Review</h1>
            <button id="theme-toggle" class="theme-toggle">Toggle Dark/Light Mode</button>
        </div>
        
        <div class="summary-bar">
            <div class="summary-item">
                <span>Total Issues: </span>
                <strong id="total-issues">${processedContent.totalIssues}</strong>
            </div>
            <div class="summary-item">
                <span>Errors: </span>
                <strong class="error-tag">${processedContent.errorCount}</strong>
            </div>
            <div class="summary-item">
                <span>Warnings: </span>
                <strong class="warning-tag">${processedContent.warningCount}</strong>
            </div>
            <div class="summary-item">
                <span>Suggestions: </span>
                <strong class="success-tag">${processedContent.successCount}</strong>
            </div>
            <button id="expand-all">Expand All</button>
            <button id="collapse-all">Collapse All</button>
        </div>
        
        <!-- Tab Navigation -->
        <div class="tabs">
            <button class="tab active" data-tab="structured-view">Structured View</button>
            <button class="tab" data-tab="full-response">Full Response</button>
        </div>
        
        <!-- Tab Content -->
        <div id="structured-view" class="tab-content active">
            <div class="review-container" id="review-content">
                ${processedContent.html}
            </div>
        </div>
        
        <div id="full-response" class="tab-content">
            <div class="full-response">
                ${escapeHtml(fullResponse)}
            </div>
        </div>

        <script>
            // Toggle theme
            const themeToggle = document.getElementById('theme-toggle');
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
            });
            
            // Handle issue collapse/expand
            document.querySelectorAll('.issue-header').forEach(header => {
                header.addEventListener('click', () => {
                    const issue = header.parentElement;
                    issue.classList.toggle('collapsed');
                });
            });
            
            // Expand/Collapse all
            document.getElementById('expand-all').addEventListener('click', () => {
                document.querySelectorAll('.issue').forEach(issue => {
                    issue.classList.remove('collapsed');
                });
            });
            
            document.getElementById('collapse-all').addEventListener('click', () => {
                document.querySelectorAll('.issue').forEach(issue => {
                    issue.classList.add('collapsed');
                });
            });
            
            // Copy suggestion to clipboard
            document.querySelectorAll('.copy-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const text = button.getAttribute('data-text');
                    navigator.clipboard.writeText(text).then(() => {
                        const originalText = button.textContent;
                        button.textContent = 'Copied!';
                        setTimeout(() => {
                            button.textContent = originalText;
                        }, 2000);
                    });
                });
            });
            
            // Tab switching functionality
            document.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs
                    document.querySelectorAll('.tab').forEach(t => {
                        t.classList.remove('active');
                    });
                    
                    // Remove active class from all tab contents
                    document.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    
                    // Add active class to clicked tab
                    tab.classList.add('active');
                    
                    // Add active class to corresponding tab content
                    const tabId = tab.getAttribute('data-tab');
                    document.getElementById(tabId).classList.add('active');
                });
            });
        </script>
    </body>
    </html>`;
}

/**
 * Process the review content to extract issues and format them for display
 * @param {string} content - The raw review content
 * @returns {object} Processed content and statistics
 */
function processReviewContent(content) {
    // Split the content by lines
    const lines = content.split('\n');
    let html = '';
    let errorCount = 0;
    let warningCount = 0;
    let successCount = 0;
    
    // Check if there are actual issues in the content or if it's just general feedback
    const hasStructuredIssues = content.includes('Issue:') || 
                               content.includes('Warning:') || 
                               content.includes('Error:') ||
                               content.includes('Suggestion:');
    
    if (hasStructuredIssues) {
        // Process structured content
        let currentIssue = null;
        let currentType = 'success';
        let currentDescription = [];
        
        for (const line of lines) {
            if (line.includes('Issue:') || line.includes('Warning:') || line.includes('Error:') || line.includes('Suggestion:')) {
                // If we have a previous issue, add it to the HTML
                if (currentIssue) {
                    const issueHtml = createIssueHtml(currentIssue, currentType, currentDescription.join('\n'));
                    html += issueHtml;
                }
                
                // Start a new issue
                if (line.includes('Error:')) {
                    currentType = 'error';
                    errorCount++;
                    currentIssue = line.replace('Error:', '').trim();
                } else if (line.includes('Warning:')) {
                    currentType = 'warning';
                    warningCount++;
                    currentIssue = line.replace('Warning:', '').trim();
                } else {
                    currentType = 'success';
                    successCount++;
                    currentIssue = line.replace('Issue:', '').replace('Suggestion:', '').trim();
                }
                
                currentDescription = [];
            } else if (currentIssue) {
                currentDescription.push(line);
            }
        }
        
        // Add the last issue
        if (currentIssue) {
            const issueHtml = createIssueHtml(currentIssue, currentType, currentDescription.join('\n'));
            html += issueHtml;
        }
    } else {
        // Process as general feedback - create a single "issue" with all content
        successCount = 1;
        html = createIssueHtml('General Feedback', 'success', content);
    }
    
    const totalIssues = errorCount + warningCount + successCount;
    
    return {
        html,
        totalIssues,
        errorCount,
        warningCount,
        successCount
    };
}

/**
 * Create HTML for a single issue
 * @param {string} title - The issue title
 * @param {string} type - The issue type (error, warning, success)
 * @param {string} description - The issue description
 * @returns {string} HTML for the issue
 */
function createIssueHtml(title, type, description) {
    // Extract code suggestions if they exist
    let codeSnippet = '';
    if (description.includes('```python') || description.includes('```')) {
        const matches = description.match(/```(?:python)?([\s\S]*?)```/g);
        if (matches && matches.length > 0) {
            for (const match of matches) {
                const code = match.replace(/```(?:python)?|```/g, '').trim();
                codeSnippet = code;
                description = description.replace(match, `<div class="code-block">${code}</div>`);
            }
        }
    }
    
    const copyButton = codeSnippet ? 
        `<button class="copy-button" data-text="${escapeHtml(codeSnippet)}">Copy Code</button>` : '';
    
    let typeTag = '';
    if (type === 'error') {
        typeTag = '<span class="tag error-tag">Error</span>';
    } else if (type === 'warning') {
        typeTag = '<span class="tag warning-tag">Warning</span>';
    } else {
        typeTag = '<span class="tag success-tag">Suggestion</span>';
    }
    
    return `
    <div class="issue ${type}">
        <div class="issue-header">
            <h3 class="issue-title">${escapeHtml(title)} ${typeTag}</h3>
            <span class="expand-icon">▼</span>
        </div>
        <div class="issue-description">
            ${description.replace(/\n/g, '<br>')}
            ${copyButton ? `<div class="issue-actions">${copyButton}</div>` : ''}
        </div>
    </div>
    `;
}

/**
 * Escape HTML special characters
 * @param {string} html - The string to escape
 * @returns {string} Escaped string
 */
function escapeHtml(html) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return html.replace(/[&<>"']/g, m => map[m]);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
