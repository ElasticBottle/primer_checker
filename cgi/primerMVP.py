#! /afs//bii.a-star.edu.sg/dept/mendel/METHODS/corona/local/anaconda3/bin/python3.7

import cgi, json, sys, subprocess
from typing import List, Dict

# use to provide tracebacks within the cgi if something goes wrong
import cgitb

# Prints any error to t windows from which the script was executed from
cgitb.enable()


def print_headers():
    # Printing a minimal header
    # To be set before printing any results of the HTML body
    print("Access-Control-Allow-Origin: *")
    print("Access-Control-Allow-Headers: *")
    print("Content-Type: text/html")  # HTML is going to follow in the body
    print()  # blank line, end of headers


def read_input():
    input_files = sys.stdin.readlines()
    print(input_files)
    if len(input_files) != 0:
        input_files = json.loads(input_files)
        return input_files
    else:
        print(
            "Invalid, if this persist, please contact and tell us, what you were doing, what input files you were using when it happened and we will work to get it fixed as soon as possible"
        )
        return []


def analyse_primes(input_files: List[Dict]):
    """
    Args:
        input_files(List[Dict]): each Dict element contains keys 'invalid' and 'content'
    """

    def save_file(file: Dict):
        with open("~", "w") as f:
            pass

    for file in input_files:
        save_file(file)
        subprocess.run()


# print(json.dumps(input_files, indent=4))
# print(input_files.get("data"))
# print(input_files.data[0].invalid)
# print(input_files.data[0].content)


def main():
    print_headers()
    input_files = read_input()
    analyse_primes(input_files)
