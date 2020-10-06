#!/afs/bii.a-star.edu.sg/dept/mendel/METHODS/corona/local/anaconda3/envs/primer/bin/python3.7

import cgi

# use to provide tracebacks within the cgi if something goes wrong
import cgitb
import concurrent.futures
import json
import subprocess
import sys
import time
from io import StringIO
from typing import Any, Dict, List, Tuple

import pandas as pd

from blast import blast

# Prints any error to t windows from which the script was executed from
cgitb.enable()


blast_dir = "/afs/bii.a-star.edu.sg/dept/mendel/METHODS/corona/gamma/bin/ncbi-blast-2.10.1+/bin/"
blast_db_loc = "/home/yeokhw/blastdb/database"
fasta_input = "/home/yeokhw/primer_check_support_files/fasta_inputs/"
database_count = "/home/yeokhw/primer_check_support_files/database_count.json"


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


def analyse_primer(
    input_file: Dict[str, Any],
    input_store_path: str = "/home/yeokhw/primer_check_support_files/fasta_inputs/",
):
    """
    Args:
        input_files(Dict[str, Any]): contains keys 'invalid', 'id', and 'content'
    """

    primerId = input_file.get("id", None)
    content = input_file.get("content", None)
    if not primerId:
        raise Exception(f"Invalid Id given {primerId}")

    filename = f"{primerId}&{time.time():.0f}.fasta"
    with open(f"{input_store_path}{filename}", "w") as f:
        f.write(content)
    results = blast(
        blast_bin=blast_dir,
        blast_db_loc=blast_db_loc,
        query_seq=f"{input_store_path}{filename}",
        is_log=True,
    )
    return (filename, results)


def main():
    print_headers()
    # sys.stdin = StringIO(
    #     r"""{"data": [{"content": ">fwd\r\nGTGAAATGGTCATGTGTGGCGG\r\n>rev\r\nTATGCTAATAGTGTTTTTAACATTTG\r\n>prb\r\nCAGGTGGAACCTCATCAGGAGATGC", "id": "text_input_fasta", "invalid":false}, {"content": ">fwd\r\nGTGAAATGGTCATGTGTGGCGG\r\n>rev\r\nTATGCTAATAGTGTTTTTAACATTTG\r\n>prb\r\nCAGGTGGAACCTCATCAGGAGATGC", "id": "text_input_fasta3", "invalid":false}]}"""
    # )
    input_files = read_input()
    to_send = {}
    filenames = {}

    with concurrent.futures.ThreadPoolExecutor() as executor:
        jobs = {
            executor.submit(analyse_primer, file): file.get("id", None)
            for file in input_files.get("data", [])
        }
        for future in concurrent.futures.as_completed(jobs):
            primerId = jobs[future]
            filename, results = future.result()
            filenames[primerId] = filename
            to_send[primerId] = results.to_json(orient="records")

    with open(database_count, "r") as f:
        to_send["database_count"] = json.load(f)

    print(to_send)
    print(filenames)


if __name__ == "__main__":
    main()
