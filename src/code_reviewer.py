#!/usr/bin/env python3
"""
Code Reviewer for Python using AI
"""

import sys
import os
import json
import openai

def main():
    """
    Main function to review Python code
    """
    if len(sys.argv) < 5:
        print("Usage: python code_reviewer.py <file_path> <api_key> <base_url> <model>")
        sys.exit(1)

    file_path = sys.argv[1]
    api_key = sys.argv[2]
    base_url = sys.argv[3]
    model = sys.argv[4]

    # Check if file exists
    if not os.path.isfile(file_path):
        print(f"Error: File {file_path} does not exist")
        sys.exit(1)

    # Read the file content
    with open(file_path, 'r', encoding='utf-8') as file:
        code = file.read()

    # Configure the OpenAI client
    openai.api_key = api_key
    if base_url:
        openai.api_base = base_url

    # Create a detailed prompt for code review
    prompt = """
        You are an expert Python developer and code reviewer with deep expertise in:

        - Pythonic best practices
        - Doc string and comments conventions
        - Code style and formatting
        - Code quality and maintainability
        - Performance optimization
        - Security vulnerabilities and mitigations
        - Correctness and logic validation
        - PEP 8 and PEP 257 conventions
        - Performance tuning and memory profiling
        - Secure coding practices (OWASP, input validation, secrets handling)
        - Scalability patterns and architectural cleanliness
        - Error handling and edge case coverage
        - Functional, object-oriented, and asynchronous design
        - Static typing with type hints and annotations
        - Testability and code reliability

        Your job is to meticulously review the following Python code and deliver a detailed report.

        ###  Review Format Per Issue:
        1. **Line [X]**: Quote the exact line of code with syntax highlighting.
        2. Issue Description: What is the problem?
        3. Impact: Why it matters (performance, readability, security, etc.)
        4. Recommendation: Specific fix or rewrite with a short explanation.
        5. code snippets: Include improved code snippets if the change is non-trivial.


        For each line or block, examine the following categories:

        ---

        ### 1.  Code Style and PEP 8/257 Compliance
        - Are indentation, spacing, line length, and formatting correct?
        - Are variable and function names meaningful and consistent?
        - Are docstrings present, clear, and PEP 257-compliant?
        - Are imports clean, sorted, and organized properly?
        - Is code too dense or poorly structured for readability?

        ---

        ### 2.  Code Quality and Maintainability
        - Are there any anti-patterns or “code smells” (e.g., deep nesting, long functions, unclear naming)?
        - Can logic be broken into smaller, testable functions?
        - Are classes and functions doing only one thing?
        - Are constants, magic numbers, or config values hardcoded?
        - Could the code be improved with built-in features (e.g., `enumerate`, `zip`, `pathlib`)?

        ---

        ### 3. Performance
        - Are there inefficient loops or data structures?
        - Could any part of the code benefit from lazy evaluation or generators?
        - Is there unnecessary memory usage or I/O operations?
        - Are external libraries being used efficiently?

        ---

        ### 4. Security
        - Are there potential security flaws (e.g., unvalidated inputs, use of `eval`, SQL injection risks)?
        - Are secrets, credentials, or tokens hardcoded or exposed?
        - Is logging used correctly without leaking sensitive info?
        - Are subprocesses or external calls safely constructed?

        ---

        ### 5. Correctness & Logic
        - Is the logic correct and predictable for all inputs?
        - Are edge cases covered or at least considered?
        - Are error-handling strategies in place and robust?
        - Are exceptions specific and meaningful?

        ---

        ### 6. Testing & Testability
        - Is the code modular and testable?
        - Are any unit tests, doc tests, or integration tests present or needed?
        - Are mocks/stubs necessary for external dependencies?
        - Is test coverage sufficient for critical paths and failure modes?

        ---

        ### 7.  Python-Specific Advice
        - Are type hints used effectively and consistently?
        - If async code is used: are `await` and `async` properly structured?
        - Are `with` statements used for file/lock/context management?
        - Are list/dict/set comprehensions idiomatic and not overused?

        ---

        ### Deliverable:
        Provide a clear, sectioned review with:
        - Issue description
        - Explanation of impact
        - Actionable recommendation
        - Code snippet (if helpful)

        Focus on teaching through the review: provide rationale, not just judgments. Prioritize critical and structural issues first, but don't skip small improvements that aid long-term maintainability.

        Begin with a summary of overall strengths and areas for improvement, then proceed by category with minor and major and critical issues clearly marked.

    """

    # Get the code review
    review = ""
    try:
        # Make a completion request using the OpenAI API
        response = openai.ChatCompletion.create(
            model=model,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": str(code)}
            ]
        )

        print(response['choices'][0]['message']['content'])

    except Exception as e:
        error_msg = str(e)
        if "504" in error_msg or "timeout" in error_msg.lower():
            review = f"""
Error: The API gateway timed out. This could be due to:
1. The API server being temporarily unavailable or overloaded
2. Network issues
3. The request taking too long to process

Possible solutions:
- Try again later when the server load might be lower
- Check your network connection
- If using a custom API endpoint, verify it's correctly configured and accessible
- Consider using a different model or the official OpenAI API endpoint

Full error details: {error_msg}
"""
        elif "401" in error_msg or "invalid_api_key" in error_msg or "authentication" in error_msg.lower():
            review = """
Error: Authentication failed. This could be due to:
1. Invalid API key
2. Expired API key
3. API key not having the necessary permissions

Possible solutions:
- Check that your API key is correctly copied without any extra spaces
- Ensure your API key is active and has not expired
- Verify that your API key has permission to access the requested model
- If using a custom API endpoint, make sure you're using the correct API key for that endpoint
"""
        elif "404" in error_msg or "not found" in error_msg.lower():
            review = """
Error: Resource not found. This could be due to:
1. The specified model does not exist
2. The API endpoint URL is incorrect
3. The requested resource has been moved or deleted

Possible solutions:
- Check that the model name is spelled correctly and exists
- Verify the API endpoint URL is correct
- If using a custom API endpoint, ensure it's properly configured
"""
        elif "429" in error_msg or "rate limit" in error_msg.lower():
            review = """
Error: Rate limit exceeded. This could be due to:
1. Too many requests in a short period of time
2. Exceeding your API quota or tier limits

Possible solutions:
- Wait a moment before trying again
- Consider implementing rate limiting in your application
- Check your API usage and limits in your account dashboard
- Upgrade your API tier if necessary
"""
        else:
            review = f"Error during code review: {error_msg}"

    # Print the review to stdout (will be captured by the extension)
    print(review)

if __name__ == "__main__":
    main()
