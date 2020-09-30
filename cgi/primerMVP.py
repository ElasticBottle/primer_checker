# !/afs//bii.a-star.edu.sg/dept/mendel/METHODS/corona/local/anaconda3/bin/python3.7

import cgi

# use to provide tracebacks within the cgi if something goes wrong
import cgitb
import json
import subprocess
import sys
from io import StringIO
from typing import Any, Dict, List, Tuple

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
    if len(input_files) != 0:
        input_files = json.loads(input_files[0])
        return input_files
    else:
        print(
            "Invalid, if this persist, please contact and tell us, what you were doing, what input files you were using when it happened and we will work to get it fixed as soon as possible"
        )
        return []


def analyse_primer(input_file: Dict[str, Any]):
    """
    Args:
        input_files(Dict[str, Any]): contains keys 'invalid', 'id', and 'content'
    """

    def split_frp(content: str) -> Tuple[str, str, str]:
        # splitted = content.split("\n")
        # content.replace(r"\n", "")
        # print(splitted)
        return ("FWD_HERE", "REV_HERE", "PRB_HERE")

    primerId = input_file.get("id", "missing_id")
    content = input_file.get("content", "missing_content")
    fwd, rev, prb = split_frp(content)
    print(primerId, content)


# print(json.dumps(input_files, indent=4))
# print(input_files.get("data"))
# print(input_files.data[0].invalid)
# print(input_files.data[0].content)


def main():
    print_headers()
    # sys.stdin = StringIO(
    #     """{"data": [{"content": ">fwd↵GTGAAATGGTCATGTGTGGCGG↵>rev↵TATGCTAATAGTGTTTTTAACATTTG↵>prb↵CAGGTGGAACCTCATCAGGAGATGC", "id": "text_input_fasta", "invalid":false}, {"content": ">fwd↵GTGAAATGGTCATGTGTGGCGG↵>rev↵TATGCTAATAGTGTTTTTAACATTTG↵>prb↵CAGGTGGAACCTCATCAGGAGATGC", "id": "text_input_fasta3", "invalid":false}]}"""
    # )
    input_files = read_input()
    list(map(analyse_primer, input_files.get("data", [])))


if __name__ == "__main__":
    main()
