#!/usr/bin/env python3
"""
Script to install required Python dependencies for the Python Code Reviewer extension
"""

import subprocess
import sys
import os
import platform

def main():
    """
    Install the required dependencies
    """
    # Get the path to the requirements.txt file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(current_dir)
    requirements_path = os.path.join(parent_dir, 'requirements.txt')
    
    # Try different Python executables
    python_commands = [
        sys.executable,  # Current Python interpreter
        "python3",       # Common on macOS and Linux
        "python",        # Common on Windows
        "py"             # Python launcher on Windows
    ]
    
    for python_cmd in python_commands:
        try:
            # Try to use the current Python command
            if python_cmd != sys.executable:
                # For string commands, we need to use shell=True
                pip_check_cmd = f"{python_cmd} -m pip --version"
                subprocess.check_call(pip_check_cmd, shell=True,
                                     stdout=subprocess.DEVNULL,
                                     stderr=subprocess.DEVNULL)
                
                # Install dependencies
                install_cmd = f"{python_cmd} -m pip install -r {requirements_path}"
                subprocess.check_call(install_cmd, shell=True)
            else:
                # For sys.executable, we can use the list form
                subprocess.check_call([python_cmd, '-m', 'pip', '--version'],
                                    stdout=subprocess.DEVNULL,
                                    stderr=subprocess.DEVNULL)
                
                # Install dependencies
                subprocess.check_call([python_cmd, '-m', 'pip', 'install', '-r', requirements_path])
            
            print(f"Dependencies installed successfully using {python_cmd}!")
            return 0
        except (subprocess.CalledProcessError, FileNotFoundError):
            # This Python command didn't work, try the next one
            continue
    
    # If we get here, none of the Python commands worked
    print("Error: Failed to install dependencies. Please make sure Python and pip are installed.")
    return 1

if __name__ == "__main__":
    sys.exit(main())
