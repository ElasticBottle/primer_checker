#!/afs/bii.a-star.edu.sg/dept/mendel/METHODS/corona/local/anaconda3/envs/primer/bin/python3.7

import argparse
from io import StringIO
import subprocess
import time
from collections import OrderedDict

import pandas as pd

from country_to_alpha import CountryAlphaMap


def get_country(virus_name: str):
    # TODO (elastic Bottle): make this less hacky (read manual work) and more robust
    country_rough = virus_name.split("|")[0].split("/")[1]
    country_rough_clean = country_rough.rstrip().lstrip().lower()
    country, iso_a3 = CountryAlphaMap.getCode(country_rough_clean)
    return [country, iso_a3, country_rough_clean]


def match_diag(alignments: pd.Series):
    """ "
    Generate the match diagrams based on two sequences

    Args

        - alignments (pd.Series): Pandas series contianing two indices:
            - "match_seq" the sequence matched
            - "query_seq" the sequecne used for querying
    """

    def find_matches(query_query_seq, match_seq: str) -> str:
        to_return = ""
        for i in range(len(query_seq)):
            if query_seq[i] == match_seq[i]:
                to_return += "|"
            else:
                to_return += "X"
        return to_return

    match_seq, query_seq = alignments["match_seq"], alignments["query_seq"]
    match_diag = find_matches(query_seq, match_seq)
    misses3 = match_diag[-5:].count("X")
    return [f"{query_seq} {match_diag} {match_seq}", misses3]


def clean_missed_results(result: pd.DataFrame):
    result = result[result["abs_mismatch"] >= 1]
    df_cleaned = pd.DataFrame(
        list(
            map(
                lambda x, y, z: x + y + z,
                result["match_id"]
                .str.split("|", expand=True)
                .iloc[:, :3]
                .values.tolist(),
                result["match_id"].map(get_country).values.tolist(),
                result[["match_seq", "query_seq"]].apply(match_diag, axis=1),
            )
        ),
        columns=[
            "virus_name",
            "accession_id",
            "date",
            "country_name",
            "ISO_A3",
            "orig_name",
            "match_diag",
            "misses3",
        ],
    )
    df_cleaned["misses"] = result["abs_mismatch"]
    df_cleaned["match_pct"] = result["pct_match"].astype(float)
    df_cleaned["type"] = result["query_id"]
    df_cleaned["virus_match_idx"] = result[
        ["match_start_idx", "match_end_idx"]
    ].aggregate(" ".join, axis=1)
    df_cleaned["query_match_idx"] = result[
        ["query_start_idx", "query_end_idx"]
    ].aggregate(" ".join, axis=1)

    # print(result.head())
    # print(df_cleaned.head())
    return df_cleaned


def blast(
    blast_bin: str,
    blast_db_loc: str,
    query_seq: str,
    out_file_path: str = "./out.csv",
    is_log: bool = False,
    save_csv: bool = False,
) -> pd.DataFrame:
    """
    Does a blast for a query sequence against a blast database

    Args:

        - blast_bin (str): Directory of the blast Files.
        - blast_db_loc (str): absolute path to the balst database location
        - query_seq (str): The path to the query file path
        - out_file_path(str): The output path (including filename.csv) of the results if [save_csv] is set to [True]
        - is_log (bool): Option to log error messages if they occur
        - save_csv (bool): Option to save the results to a csv file. Use [out_file_path] to specifiy output lcoation.

    Returns:

        - pd.DataFrame: The result with the following headers:
            - "virus_name"
            - "accession_id"
            - "date"
            - "country_name"
            - "ISO_A3"
            - "orig_name"
            - "match_diag"
            - "misses3"
            - "misses"
            - "match_pct"
            - "type"
            - "virus_match_idx"
            - "query_match_idx"
    """
    blast_headers = OrderedDict(
        {
            "qaccver": "query_id",
            "saccver": "match_id",
            "qlen": "query_length",
            "mismatch": "abs_mismatch",
            "nident": "abs_match",
            "pident": "pct_match",
            "length": "alignment_length",
            "qstart": "query_start_idx",
            "qseq": "query_seq",
            "qend": "query_end_idx",
            "sstart": "match_start_idx",
            "sseq": "match_seq",
            "send": "match_end_idx",
            # "gaps": "number_gaps_in _match",
            "evalue": "expected_value",
            "bitscore": "bitscore",
            # "ssciname": "match_scientific_name",
            # "stitle": "match_title"
        }
    )
    process = subprocess.run(
        [
            f"{blast_bin}blastn",
            "-query",
            f"{query_seq}",
            "-db",
            f"{blast_db_loc}",
            f"-word_size",
            "7",
            f"-evalue",
            "700000",
            f"-max_target_seqs",
            "1000000",
            f"-ungapped",
            f"-penalty",
            "-1",
            f"-reward",
            "2",
            f"-num_threads",
            "8",
            f"-outfmt",
            f"10 {' '.join(blast_headers.keys())}",
            # "-out",
            # f"{out_file_path}",
        ],
        capture_output=True,
        universal_newlines=True,
    )

    if process.stderr != "":
        if is_log:
            print(process.stderr)
        raise Exception(f"An error occurred")

    result = process.stdout
    data = StringIO(result)
    df = pd.read_csv(data, dtype=str)
    df.columns = list(blast_headers.values())
    results = clean_missed_results(df)
    if save_csv:
        results.to_csv(f"{out_file_path}", index=False, chunksize=50000)
    return results


def parse_args():
    parser = argparse.ArgumentParser(
        description="Blast query string with WIV04 nucleotide sequence",
        epilog="Any errors, please open an issue!",
    )
    base_path = "C:/Users/winst/Documents/MEGA/intern_and_work_proj/ASTAR_BII/primer_checker/primer_mutation_starter_pack/"
    parser.add_argument(
        "-qf",
        "--query_file",
        type=str,
        dest="query_file",
        default=f"{base_path}US-CDC-N2",
        help=" location for the input fasta file to be used for query",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=str,
        dest="output",
        default=f"./cgi/test.csv",
        help="Location for the output blast file",
    )
    parser.add_argument(
        "-b",
        "--bast_bin",
        type=str,
        dest="blast_bin",
        default="C:/Users/winst/Documents/MEGA/intern_and_work_proj/ASTAR_BII/primer_checker/primer_mutation_starter_pack/NCBI/blast-2.10.1+/bin/",
        help="Location for Blast bin",
    )
    parser.add_argument(
        "-bdb",
        "--blast_db",
        type=str,
        dest="blast_db",
        default="D:/Datasets/GISAID_Update_Analysis/blast/blastdb/database",
        help="Location of the wiv04 blast database",
    )
    parser.add_argument(
        "-l",
        "--log_error",
        dest="log",
        action="store_true",
        help="Logs error output to console",
    )
    return parser.parse_args()


def main():
    start = time.time()
    args = parse_args()
    blast(args.blast_bin, args.blast_db, args.query_file, args.output, args.log)
    print(f"time taken: {time.time() - start:.2f} seconds")


if __name__ == "__main__":
    main()
