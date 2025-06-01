#!/usr/bin/env python3
"""
Test script to run the Python code reviewer directly without using the VSCode extension
"""

import sys
import os
import subprocess
import argparse

def main():
    """
    Main function to run the code reviewer directly
    """
    parser = argparse.ArgumentParser(description='Run Python Code Reviewer directly')
    parser.add_argument('file', help='Python file to review')
    parser.add_argument('--api-key', help='OpenAI API key (default: reads from OPENAI_API_KEY env var)')
    parser.add_argument('--base-url', default='https://api.openai.com/v1', help='OpenAI API base URL')
    parser.add_argument('--model', default='gpt-4', help='OpenAI model to use')
    
    args = parser.parse_args()
    
    # Check if file exists
    if not os.path.isfile(args.file):
        print(f"Error: File {args.file} does not exist")
        return 1
    
    # Get API key from env var if not provided
    api_key = args.api_key
    if not api_key:
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            print("Error: No API key provided. Please set OPENAI_API_KEY environment variable or use --api-key")
            return 1
    
    # Get path to code_reviewer.py
    reviewer_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', 'code_reviewer.py')
    
    # Install dependencies if needed
    try:
        print("Checking for required dependencies...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'],
                             stdout=subprocess.DEVNULL, 
                             stderr=subprocess.DEVNULL)
        print("Dependencies installed successfully!")
    except subprocess.CalledProcessError:
        print("Warning: Failed to install dependencies. The script might not work properly.")
    
    # Run the code reviewer
    print(f"Reviewing {args.file}...")
    
    # Try different Python executables
    python_commands = [
        sys.executable,  # Current Python interpreter
        "python3",       # Common on macOS and Linux
        "python",        # Common on Windows
        "py"             # Python launcher on Windows
    ]
    
    for python_cmd in python_commands:
        try:
            if python_cmd == sys.executable:
                # Use list form for sys.executable
                result = subprocess.check_output([
                    python_cmd, 
                    reviewer_path, 
                    args.file, 
                    api_key, 
                    args.base_url, 
                    args.model
                ], text=True)
            else:
                # Use shell form for string commands
                cmd = f'{python_cmd} "{reviewer_path}" "{args.file}" "{api_key}" "{args.base_url}" "{args.model}"'
                result = subprocess.check_output(cmd, shell=True, text=True)
            
            print(f"\n==== CODE REVIEW RESULTS (using {python_cmd}) ====\n")
            print(result)
            return 0
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            # This Python command didn't work, try the next one
            continue
    
    # If we get here, none of the Python commands worked
    print("Error: Could not find a working Python interpreter. Please make sure Python is installed and in your PATH.")
    return 1

if __name__ == "__main__":
    sys.exit(main())
