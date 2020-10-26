#!/afs/bii.a-star.edu.sg/dept/mendel/METHODS/corona/local/anaconda3/envs/primer/bin/python3.7

import cgi

# use to provide tracebacks within the cgi if something goes wrong
import cgitb
import concurrent.futures
import datetime
import json
import subprocess
import sys
import time
from io import StringIO
from typing import Any, Dict, List, Tuple

import pandas as pd

from blast import blast

# Prints any error to the windows from which the script was executed from
cgitb.enable()

base_path = "/afs/bii.a-star.edu.sg/dept/mendel/METHODS/corona"
primer_path = f"{base_path}/gamma/primer"
blast_dir = f"{base_path}/local/anaconda3/envs/blast/bin/"
blast_db_loc = f"{primer_path}/blastdb/database"
fasta_input_path = f"{primer_path}/fasta_inputs/"
timing_path = f"{primer_path}/support_files/"
database_count_path = f"{primer_path}/support_files/database_count.json"
database_count_daily_path = f"{primer_path}/support_files/database_count_daily.json"
output_path = f"{primer_path}/result_outputs/"

# Local path used for development
# blast_dir = "C:/Users/winst/Documents/MEGA/intern_and_work_proj/ASTAR_BII/primer_checker/primer_mutation_starter_pack/NCBI/blast-2.10.1+/bin/"
# blast_db_loc = "D:/Datasets/GISAID_Update_Analysis/blast/blastdb/database"
# fasta_input_path = "C:/Users/winst/Documents/MEGA/intern_and_work_proj/ASTAR_BII/primer_checker/cgi_scripts/fasta_input/"
# database_count_path = "C:/Users/winst/Documents/MEGA/intern_and_work_proj/ASTAR_BII/primer_checker/cgi_scripts/database_count.json"
# database_count_daily_path = "C:/Users/winst/Documents/MEGA/intern_and_work_proj/ASTAR_BII/primer_checker/cgi_scripts/database_count_daily.json"
# output_path = "C:/Users/winst/Documents/MEGA/intern_and_work_proj/ASTAR_BII/primer_checker/cgi_scripts/output/"


def print_headers():
    # Printing a minimal header
    # To be set before printing any results of the HTML body
    print("Access-Control-Allow-Origin: *")
    print("Access-Control-Allow-Headers: *")
    print("Content-Type: application/json")  # HTML is going to follow in the body
    print()  # blank line, end of headers


def print_failure():
    print("Status: 400 Bad Request")
    print("meta charset='utf-8'")
    print("Content-Type: text/html")
    print()  # blank line, end of headers
    print(
        """
        <h1>400 bad request</h1>

        <p>Apologies for the invalid request! If you think this is an error, please contact and tell us:</p>
        <p>- Steps for the actions taken</p>
        <p>- Input files used when it happened</p>
        <p>We will work to get it fixed as soon as possible!</p>"""
    )


def read_input():
    input_files = sys.stdin.readlines()
    if len(input_files) != 0:
        input_files = json.loads(input_files[0])
        return input_files
    else:
        return dict()


def analyse_primer(
    input_seq: Dict[str, Any],
    input_store_path: str,
    output_file_path: str,
):
    """
    Args:

        - input_seq(Dict[str, Any]): contains keys 'invalid', 'id', and 'content'
        - input_store_path (str): Path to the folder that [input_seq] can be written too.
        - output_file_path (str): Path to the folder where the result csv file will be written too.

    Returns:

        - Tuple[str, str]:
            - First string contains the filename of the analysed seq
            - Second string contains the csv result.
    """

    primerId = input_seq.get("id", None)
    content = input_seq.get("content", None)
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
    input_files = read_input()
    if len(input_files) == 0:
        print_failure()
        return

    start = time.time()
    print_headers()

    # Used for local development
    # sys.stdin = StringIO(
    #     r"""{"data": [{"content": ">fwd\r\nGTGAAATGGTCATGTGTGGCGG\r\n>rev\r\nTATGCTAATAGTGTTTTTAACATTTG\r\n>prb\r\nCAGGTGGAACCTCATCAGGAGATGC", "id": "text_input_fasta", "invalid":false},{"content":">fwd\r\nGTGAAATGGTCATGTGTGGCGG\r\n>rev\r\nTATGCTAATAGTGTTTTTAACATTTG\r\n>prb\r\nCAGGTGGAACCTCATCAGGAGATGC", "id": "MHUMAN", "invalid":false},{"content": ">fwd\r\nGTGAAATGGTCATGTGTGGCGG\r\n>rev\r\nTATGCTAATAGTGTTTTTAACATTTG\r\n>prb\r\nCAGGTGGAACCTCATCAGGAGATGC", "id": "ABCD", "invalid":false},{"content": ">fwd\r\nGTGAAATGGTCATGTGTGGCGG\r\n>rev\r\nTATGCTAATAGTGTTTTTAACATTTG\r\n>prb\r\nCAGGTGGAACCTCATCAGGAGATGC", "id": "EFGH", "invalid":false},{"content": ">fwd\r\nGTGAAATGGTCATGTGTGGCGG\r\n>rev\r\nTATGCTAATAGTGTTTTTAACATTTG\r\n>prb\r\nCAGGTGGAACCTCATCAGGAGATGC", "id": "HIJK", "invalid":false} ,{"content": ">fwd\r\nGTGAAATGGTCATGTGTGGCGG\r\n>rev\r\nTATGCTAATAGTGTTTTTAACATTTG\r\n>prb\r\nCAGGTGGAACCTCATCAGGAGATGC", "id": "LMNOP", "invalid":false},{"content": ">fwd\r\nGTGAAATGGTCATGTGTGGCGG\r\n>rev\r\nTATGCTAATAGTGTTTTTAACATTTG\r\n>prb\r\nCAGGTGGAACCTCATCAGGAGATGC", "id": "QRST", "invalid":false}]}"""
    # )

    to_send = {}
    filenames = {}

    with concurrent.futures.ProcessPoolExecutor() as executor:
        jobs = {
            executor.submit(
                analyse_primer, file, fasta_input_path, output_path
            ): file.get("id", None)
            for file in input_files.get("data", [])
        }
        for future in concurrent.futures.as_completed(jobs):
            primerId = jobs[future]
            filename, results = future.result()
            filenames[primerId] = filename
            to_send[primerId] = results.to_dict("records")

    database_counts = []
    with open(database_count_path, "r") as f:
        database_counts.append(json.load(f))

    with open(database_count_daily_path, "r") as f:
        database_counts.append(json.load(f))

    print(
        json.dumps(
            [
                to_send,
                database_counts,
                filenames,
            ],
            separators=(",", ":"),
        )
    )
    end = time.time() - start
    with open(f"{timing_path}timing.txt", "a") as timings:
        timings.write("\n")
        timings.write(f"{end:.2f} for {filenames} on {datetime.datetime.today().strftime('%d-%m-%Y')}")


if __name__ == "__main__":
    main()
