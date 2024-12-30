# script.py
import sys

# Accept arguments from Node.js
args = sys.argv[1:]

# Simple example: Summing two numbers
if len(args) == 2:
    try:
        num1 = float(args[0])
        num2 = float(args[1])
        print(num1 + num2)
    except ValueError:
        print("Invalid numbers")
else:
    print("Usage: script.py <num1> <num2>")
