#!/usr/bin/env python
# Sample Python code with various issues for demonstration

import os, sys, json, random
from datetime import datetime, timedelta

# Global variables
PASSWORD = "admin123"  # Hardcoded password (security issue)
data = []

class user:  # Class name not in PascalCase (PEP 8 violation)
    def __init__(self, name, age, email):
        self.name = name
        self.age = age
        self.email = email
        
    def to_dict(self):  # No docstring
        return {'name': self.name, 'age': self.age, 'email': self.email}
    
    def validate(self):
        if self.age < 0:
            return False
        if '@' not in self.email:  # Overly simplistic email validation
            return False
        return True

def process_data(input_data):
    """Process the input data and return the results."""
    results = []
    
    # Inefficient loop with append (performance issue)
    for i in range(len(input_data)):
        item = input_data[i]
        results.append(item * 2)
    
    # No error handling for edge cases
    total = sum(results)
    average = total / len(results)
    
    return results, average

def load_config():
    # Unsafe file handling without try/except (error handling issue)
    with open('config.json', 'r') as f:
        config = json.load(f)
    return config

def calculate_fibonacci(n):
    # Inefficient recursive implementation (performance issue)
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

def authenticate(username, password):
    # Insecure authentication logic (security issue)
    if username == "admin" and password == PASSWORD:
        return True
    else:
        return False

def main():
    # Inconsistent indentation (PEP 8 violation)
    print("Starting application...")
    
    # Multiple issues: Unused variables, no error handling, etc.
    users = []
    for i in range(5):
       u = user("User " + str(i), 20 + i, f"user{i}@example.com")
       users.append(u)
    
    # Duplicated code (code quality issue)
    data = [1, 2, 3, 4, 5]
    results, avg = process_data(data)
    print("Results:", results)
    print("Average:", avg)
    
    data2 = [5, 10, 15, 20, 25]
    results2, avg2 = process_data(data2)
    print("Results 2:", results2)
    print("Average 2:", avg2)
    
    # Magic numbers (code quality issue)
    if len(users) > 3:
        print("More than 3 users")
    
    # Potential logical error (off-by-one)
    for i in range(1, len(users)):
        print(f"Processing user {i}")
    
    # Risky eval usage (security issue)
    user_input = "2 + 2"
    result = eval(user_input)
    print(f"Result: {result}")
    
    # Performance issue in nested loop
    matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    for i in range(len(matrix)):
        for j in range(len(matrix[i])):
            print(matrix[i][j])
    
    # Unused import
    now = datetime.now()
    print(f"Current time: {now}")

if __name__ == "__main__":
    main()
