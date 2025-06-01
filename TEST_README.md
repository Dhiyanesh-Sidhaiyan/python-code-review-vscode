# Quick Testing Guide for Python Code Reviewer

This guide provides instructions on how to quickly test the Python Code Reviewer functionality without installing the VSCode extension.

## Prerequisites

- Python 3.6 or higher
- OpenAI API key

## Using the Test Script

The `test_reviewer.py` script allows you to run the code reviewer directly from the command line.

### Basic Usage

```bash
./test_reviewer.py sample_code.py --api-key YOUR_API_KEY
```

Or, if you have the `OPENAI_API_KEY` environment variable set:

```bash
export OPENAI_API_KEY=your_api_key
./test_reviewer.py sample_code.py
```

### All Options

```bash
./test_reviewer.py [FILE] [OPTIONS]

Arguments:
  FILE                      Python file to review

Options:
  --api-key API_KEY         OpenAI API key (default: reads from OPENAI_API_KEY env var)
  --base-url BASE_URL       OpenAI API base URL (default: https://api.openai.com/v1)
  --model MODEL             OpenAI model to use (default: gpt-4)
```

### Example

To review the included sample file with issues:

```bash
./test_reviewer.py sample_code.py --api-key YOUR_API_KEY
```

## What to Expect

The script will:
1. Check for and install any required dependencies
2. Run the code review on the specified file
3. Display the review results directly in the terminal

## Sample Output

The output will be a detailed code review that highlights:

- Code style and PEP 8 compliance issues
- Code quality concerns and anti-patterns
- Performance optimization suggestions
- Security vulnerabilities
- Logic and functionality issues
- Testing recommendations

## Using with Your Own Code

You can use this script to review any Python file:

```bash
./test_reviewer.py path/to/your_python_file.py
```

## Troubleshooting

- **"No module named 'openai'"**: Run `pip install openai` to install the required package.
- **API Key Issues**: Make sure your API key is correct and active.
- **Connection Issues**: If using a custom base URL, ensure it's correctly specified and accessible.
