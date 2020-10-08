# !/afs/bii.a-star.edu.sg/dept/mendel/METHODS/corona/local/anaconda3/envs/primer/bin/python3.7

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

base_path = "/afs/bii.a-star.edu.sg/dept/mendel/METHODS/corona"
primer_path = f"{base_path}/gamma/primer"
blast_dir = f"{base_path}/local/anaconda3/envs/blast/bin/"
blast_db_loc = f"{primer_path}/blastdb/database"
fasta_input = f"{primer_path}/fasta_inputs/"
database_count = f"{primer_path}/support_files/database_count.json"
output_path = f"{primer_path}/result_outputs/"

# blast_dir = "C:/Users/winst/Documents/MEGA/intern_and_work_proj/ASTAR_BII/primer_checker/primer_mutation_starter_pack/NCBI/blast-2.10.1+/bin/"
# blast_db_loc = "D:/Datasets/GISAID_Update_Analysis/blast/blastdb/database"
# fasta_input = "C:/Users/winst/Documents/MEGA/intern_and_work_proj/ASTAR_BII/primer_checker/cgi_scripts/fasta_input/"
# database_count = "C:/Users/winst/Documents/MEGA/intern_and_work_proj/ASTAR_BII/primer_checker/cgi_scripts/database_count.json"
# output_path = "C:/Users/winst/Documents/MEGA/intern_and_work_proj/ASTAR_BII/primer_checker/cgi_scripts/output/"


def print_headers():
    # Printing a minimal header
    # To be set before printing any results of the HTML body
    print("Access-Control-Allow-Origin: *")
    print("Access-Control-Allow-Headers: *")
    print("Content-Type: applciation/json")  # HTML is going to follow in the body
    print()  # blank line, end of headers


def read_input():
    input_files = sys.stdin.readlines()
    if len(input_files) != 0:
        input_files = json.loads(input_files[0])
        return input_files
    else:
        print(
            """Apologies for the invalid request! If this persist, please contact and tell us:
    - Steps for the actions taken
    - Input files used when it happened 
We will work to get it fixed as soon as possible!"""
        )
        return dict()


def analyse_primer(
    input_file: Dict[str, Any],
    input_store_path: str,
    output_file_path: str,
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
        save_csv=True,
        out_file_path=f"{output_path}{filename}.csv",
    )
    return (filename, results)


def main():
    print_headers()
    start = time.time()
    # sys.stdin = StringIO(
    #     r"""{"data": [{"content": ">fwd\r\nGTGAAATGGTCATGTGTGGCGG\r\n>rev\r\nTATGCTAATAGTGTTTTTAACATTTG\r\n>prb\r\nCAGGTGGAACCTCATCAGGAGATGC", "id": "text_input_fasta", "invalid":false},{"content":">fwd\r\nGTGAAATGGTCATGTGTGGCGG\r\n>rev\r\nTATGCTAATAGTGTTTTTAACATTTG\r\n>prb\r\nCAGGTGGAACCTCATCAGGAGATGC", "id": "MHUMAN", "invalid":false},{"content": ">fwd\r\nGTGAAATGGTCATGTGTGGCGG\r\n>rev\r\nTATGCTAATAGTGTTTTTAACATTTG\r\n>prb\r\nCAGGTGGAACCTCATCAGGAGATGC", "id": "ABCD", "invalid":false},{"content": ">fwd\r\nGTGAAATGGTCATGTGTGGCGG\r\n>rev\r\nTATGCTAATAGTGTTTTTAACATTTG\r\n>prb\r\nCAGGTGGAACCTCATCAGGAGATGC", "id": "EFGH", "invalid":false},{"content": ">fwd\r\nGTGAAATGGTCATGTGTGGCGG\r\n>rev\r\nTATGCTAATAGTGTTTTTAACATTTG\r\n>prb\r\nCAGGTGGAACCTCATCAGGAGATGC", "id": "HIJK", "invalid":false} ,{"content": ">fwd\r\nGTGAAATGGTCATGTGTGGCGG\r\n>rev\r\nTATGCTAATAGTGTTTTTAACATTTG\r\n>prb\r\nCAGGTGGAACCTCATCAGGAGATGC", "id": "LMNOP", "invalid":false},{"content": ">fwd\r\nGTGAAATGGTCATGTGTGGCGG\r\n>rev\r\nTATGCTAATAGTGTTTTTAACATTTG\r\n>prb\r\nCAGGTGGAACCTCATCAGGAGATGC", "id": "QRST", "invalid":false}]}"""
    # )
    input_files = read_input()

    # No input, exiting
    if not bool(input_files):
        return

    to_send = {}
    filenames = {}

    with concurrent.futures.ProcessPoolExecutor() as executor:
        jobs = {
            executor.submit(analyse_primer, file, fasta_input, output_path): file.get(
                "id", None
            )
            for file in input_files.get("data", [])
        }
        for future in concurrent.futures.as_completed(jobs):
            primerId = jobs[future]
            filename, results = future.result()
            filenames[primerId] = filename
            to_send[primerId] = results.to_json(orient="records")

    with open(database_count, "r") as f:
        to_send["database_count"] = json.load(f)

    print([to_send, filenames])
    end = time.time() - start
    with open(f"{output_path}timing.txt", "a") as timings:
        timings.write("\n")
        timings.write(f"{end:.2f} for {filenames}")


if __name__ == "__main__":
    main()
