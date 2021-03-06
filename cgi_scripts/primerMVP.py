#!/afs/bii.a-star.edu.sg/dept/mendel/METHODS/corona/local/anaconda3/envs/primer/bin/python

# use to provide tracebacks within the cgi if something goes wrong
import cgitb
import concurrent.futures
import datetime
import json
import sys

import time
from functools import partial
from io import StringIO
from typing import Any, Dict

import pandas as pd
from blast import blast

# Prints any error to the windows from which the script was executed from
cgitb.enable()

base_path = "/afs/bii.a-star.edu.sg/dept/mendel/METHODS/corona"
support_files_path = f"{base_path}/gamma/primer/files"
tmp_path = f"{base_path}/current/tmp"
primer_path = f"{base_path}/gamma/primer"
blast_dir = f"{base_path}/local/anaconda3/envs/blast/bin/"
blast_db_loc = f"{support_files_path}/database{(datetime.datetime.now()- datetime.timedelta(minutes=30)).strftime('%Y-%m-%d')}"
blast_db_loc_3months = f"{support_files_path}/database{(datetime.datetime.now()- datetime.timedelta(minutes=30)).strftime('%Y-%m-%d')}_3MONTHS"
fasta_input_path = f"{tmp_path}/"
output_path = f"{tmp_path}/"
timing_path = f"{primer_path}/support_files/"
database_count_path = f"{support_files_path}/database_count{(datetime.datetime.now()- datetime.timedelta(minutes=30)).strftime('%Y-%m-%d')}.json"
database_count_daily_path = f"{support_files_path}/database_count_daily{(datetime.datetime.now()- datetime.timedelta(minutes=30)).strftime('%Y-%m-%d')}.json"
fasta_db_path = f"{support_files_path}/sequences_db{(datetime.datetime.now()- datetime.timedelta(minutes=30)).strftime('%Y-%m-%d')}.db"

# Local path used for development
# blast_dir = "C:/Users/Winston/Documents/Code/intern_and_work/Astar/primer_checker/primer_mutation_starter_pack/NCBI/blast-2.10.1+/bin/"
# blast_db_loc = "D:/Datasets/GISAID_Update_Analysis/blast/blastdb/database"
# fasta_input_path = "C:/Users/Winston/Documents/Code/intern_and_work/Astar/primer_checker/cgi_scripts/fasta_input/"
# timing_path = (
#     "C:/Users/Winston/Documents/Code/intern_and_work/Astar/primer_checker/cgi_scripts/"
# )
# database_count_path = "C:/Users/Winston/Documents/Code/intern_and_work/Astar/primer_checker/backend/models/databaseCum.json"
# database_count_daily_path = "C:/Users/Winston/Documents/Code/intern_and_work/Astar/primer_checker/backend/models/database_count.json"
# output_path = "C:/Users/Winston/Documents/Code/intern_and_work/Astar/primer_checker/cgi_scripts/output/"
# fasta_seq_dict_path = "C:/Users/Winston/Documents/Code/intern_and_work/Astar/primer_checker/backend/models/seq_dict.json"
# TODO(Update fasta seq dict)


def print_headers():
    # Printing a minimal header
    # To be set before printing any results of the HTML body
    print("Access-Control-Allow-Origin: *")
    print("Access-Control-Allow-Headers: *")
    print("Content-Type: application/json")  # HTML is going to follow in the body
    print()  # blank line, end of headers


def print_failure():
    # print("Status: 400 Bad Request")
    # print("Content-Type: text/html")
    # print()  # blank line, end of headers
    # print("<head>")
    # print("<meta charset='utf-8' http-equiv='Content-Type' />")
    # print("</head>")
    # print(
    #     """
    #     <h1>400 bad request</h1>

    #     <p>Apologies for the invalid request! If you think this is an error, please contact and tell us:</p>
    #     <p>- Steps for the actions taken</p>
    #     <p>- Input files used when it happened</p>
    #     <p>We will work to get it fixed as soon as possible!</p>"""
    # )
    print(
        json.dumps(
            {
                "query": "invalid, try again or contact us with the steps of what you were doing when this error occurred!"
            }
        )
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
    fasta_db_path: str,
    blastAll: bool,
):
    """
    Args:

        - input_seq(Dict[str, Any]): contains keys 'invalid', 'id', and 'content'
        - input_store_path (str): Path to the folder that [input_seq] can be written too.
        - output_file_path (str): Path to the folder where the result csv file will
            be written too.
        - fasta_db_path (str): Mapping Sequence identifier to
            their sequence.
        - blastAll (bool): If true, blast against all of Gisaid's database, otherwise, against the last 3 months.

    Returns:

        - Tuple[str, str]:
            - First string contains the filename of the analysed seq
            - Second string contains the csv result.
    """

    primerId = input_seq.get("id", None)
    content = input_seq.get("content", None)
    primers = dict()
    contents = content.split()
    if len(contents) == 4:
        fwd_str, fwd, rev_str, rev = contents
        primers = {fwd_str[1:]: fwd, rev_str[1:]: rev}
    else:
        fwd_str, fwd, rev_str, rev, prb_str, prb = contents
        primers = {fwd_str[1:]: fwd, rev_str[1:]: rev, prb_str[1:]: prb}

    if not primerId:
        raise Exception(f"Invalid Id given {primerId}")

    filename = f"{primerId}&{time.time():.0f}.fasta"
    with open(f"{input_store_path}{filename}", "w") as f:
        f.write(content)

    results = blast(
        blast_bin=blast_dir,
        blast_db_loc=blast_db_loc if blastAll else blast_db_loc_3months,
        query_seq=f"{input_store_path}{filename}",
        fasta_db_path=fasta_db_path,
        primers=primers,
        is_log=True,
        save_csv=True,
        out_file_path=f"{output_file_path}{filename}.csv",
    )
    return (filename, results)


def main():
    # Problem names s US CDC N2
    # hCoV-19/Portugal/PT0253/2020|
    # hCoV-19/Portugal/PT0735/2020

    # Used for local development
    # sys.stdin = StringIO(
    #     r"""{"data": [{"content":">fwd\r\nTTACAAACATTGGCCGCAAA\r\n>rev\r\nTTCTTCGGAATGTCGCGC\r\n>prb\r\nACAATTTGCCCCCAGCGCTTCAG\r\n", "id": "US-CDC-N2", "invalid": false}]}"""
    # )

    print_headers()
    input_files = read_input()
    if len(input_files) == 0:
        print_failure()
        return

    start = time.time()

    to_send = {}
    filenames = {}

    with concurrent.futures.ProcessPoolExecutor(max_workers=3) as executor:
        jobs = {
            executor.submit(
                partial(
                    analyse_primer,
                    input_store_path=fasta_input_path,
                    output_file_path=output_path,
                    fasta_db_path=fasta_db_path,
                    blastAll=input_files["blastAll"],
                ),
                file,
            ): file.get("id", None)
            for file in input_files.get("files", [])
        }
        for future in concurrent.futures.as_completed(jobs):
            primerId = jobs[future]
            filename, results = future.result()
            filenames[primerId] = filename
            to_send[primerId] = results.to_dict("records")

    database_counts = []
    if input_files["blastAll"]:
        with open(database_count_path, "r") as f:
            database_counts.append(json.load(f))
        with open(database_count_daily_path, "r") as f:
            database_counts.append(json.load(f))
    else:
        with open(database_count_daily_path, "r") as f:
            database_counts.append(json.load(f))
            database_counts.append(
                dict(
                    filter(
                        lambda x: x[0]
                        >= (
                            datetime.date.today() - datetime.timedelta(weeks=13)
                        ).strftime("%Y-%m-%d"),
                        database_counts[0].items(),
                    )
                )
            )
        df = pd.DataFrame.from_dict(database_counts[1], orient="index")
        df.index = pd.to_datetime(df.index, format="%Y-%m-%d")
        date_range = pd.date_range(df.index.min(), df.index.max())
        df = df.reindex(date_range)
        df = df.fillna(0)
        df = df.cumsum(axis=0)
        df.index = df.index.strftime("%Y-%m-%d")
        database_counts[0] = df.to_dict(orient="index")

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
        timings.write(
            f"{end:.2f} for {filenames} on {datetime.datetime.today().strftime('%d-%m-%Y')}"
        )


if __name__ == "__main__":
    main()