#!/afs/bii.a-star.edu.sg/dept/mendel/METHODS/corona/local/anaconda3/envs/primer/bin/python3.7

import argparse
from io import StringIO
import json
from sqlite3.dbapi2 import Connection
import subprocess
import time
from typing import Tuple, Dict, Callable
from collections import OrderedDict

import pandas as pd

from country_to_alpha import CountryAlphaMap


def get_country(virus_name: str) -> Tuple[str, str, str]:
    """
    Retrieves the country info for a given [virus_name]

    Args:

        - virus_name(str): Should be in the format "hCoV-19/COUNTRY_NAME/VIRUS_ID/2020"

    Returns:

        - Tuple[str, str, str]
            - First string correspond to countries name
            - Second string corresponds to the alpha 3 code for the country name
            - Third string corresponds to the cleaned version of original country name from [virus_name]
    """
    # TODO (elastic Bottle): make this less hacky (read manual work) and more robust
    country_rough = virus_name.split("|")[0].split("/")[1]
    country_rough_clean = country_rough.rstrip().lstrip().lower()
    country, iso_a3 = CountryAlphaMap.getCode(country_rough_clean)
    return [country, iso_a3, country_rough_clean]


def find_matches(query_seq, match_seq: str) -> str:
    """
    Finds the match between [query_seq] and [match_seq]

    Args:

        - "match_seq" the sequence matched
        - "query_seq" the sequence used for querying

    Returns:

        - str: indicating if the particular index has a match "|" or a miss "X"
    """
    to_return = ""
    for i in range(len(query_seq)):
        if query_seq[i] == match_seq[i]:
            to_return += "|"
        else:
            to_return += "X"
    return to_return


def is_valid_sequence(sequence: str) -> bool:
    """
    Checks to see if a given [sequence] is valid (only contains "ACGT")
    """
    valid_dna = "ACGT"
    for nuc in sequence:
        if nuc.upper() not in valid_dna:
            return False
    return True


def recalculate_values(actual_seq: str, primer: str):
    # print(actual_seq, primer)
    try:
        assert len(actual_seq) == len(primer)
    except:
        print("actual: ", actual_seq, "query: ", primer)
        raise Exception()
    primer_length = len(primer)
    match_diag = find_matches(primer, actual_seq)
    misses = match_diag.count("X")
    misses3 = match_diag[-5:].count("X")
    abs_match = primer_length - misses
    pct_match = (abs_match / primer_length) * 100
    return (
        actual_seq,
        f"{primer} {match_diag} {actual_seq}",
        misses3,
        misses,
        pct_match,
    )


def get_sequence(fasta_db: Connection, virus_id: str) -> str:
    cursor = fasta_db.cursor()
    cursor.execute("SELECT sequence FROM Sequences WHERE identifier = ?", (virus_id,))
    result = cursor.fetchall()
    return result[0][0]


def match_partial_seq(fasta_db: Connection, primers: Dict[str, str]) -> Callable:
    """
    Extends sequence that does not match the full query sequence length

    Args:

        - fasta_db (Connection): A Sqlite3 database for retrieval for sequence.
        -primers (Dict[str, str]): Contains the "fwd", "rev" and "prb"
            primers

    Returns:

        - Callback: A function to be used for row-wise application to dataframe, takes
                - "query_id",
                - "match_id",
                - "match_seq"
                - "abs_mismatch",
                - "pct_match",
                - "query_length",
                - "query_start_idx",
                - "query_end_idx",
                - "match_start_idx",
                - "match_end_idx",
    """

    def inner(
        query_id: str,
        virus_id: str,
        match_seq: str,
        misses: int,
        pct_match: float,
        query_length: int,
        query_start_idx: int,
        query_end_idx: int,
        match_start_idx: int,
        match_end_idx: int,
    ) -> Tuple[str, str, str, int, float, str, str, str, str, str, str, str, str]:
        primer = primers[query_id]
        seq = get_sequence(fasta_db, virus_id)
        actual_seq = ""
        country, iso_a3, original_country_name = get_country(virus_name=virus_id)

        # Magic numbers to account for the fact that blast outputs are 1 indexed.
        # Front and back mismatched
        if query_start_idx != 1 and query_end_idx != query_length:
            if match_end_idx < match_start_idx:
                match_start_idx = match_start_idx + (query_start_idx - 1)
                match_end_idx = match_end_idx - (query_length - query_end_idx)
                actual_seq = seq[match_start_idx + 1 : match_end_idx : -1].upper()
            else:
                match_start_idx = match_start_idx - (query_start_idx - 1)
                match_end_idx = match_end_idx + (query_length - query_end_idx)
                actual_seq = seq[match_start_idx - 1 : match_end_idx].upper()

        # Missing front details
        elif query_start_idx != 1:
            if match_end_idx < match_start_idx:
                match_start_idx = match_start_idx + (query_start_idx - 1)
                actual_seq = seq[match_start_idx + 1 : match_end_idx + 1 : -1].upper()
            else:
                match_start_idx = match_start_idx - (query_start_idx - 1)
                actual_seq = seq[match_start_idx - 1 : match_end_idx].upper()

        # Missing back details
        elif query_end_idx != query_length:
            if match_end_idx < match_start_idx:
                match_end_idx = match_end_idx - (query_length - query_end_idx)
                actual_seq = seq[match_start_idx + 1 : match_end_idx : -1].upper()
            else:
                match_end_idx = match_end_idx + (query_length - query_end_idx)
                actual_seq = seq[match_start_idx - 1 : match_end_idx].upper()

        # No Mismatches
        else:
            match_diag = find_matches(primer, match_seq)
            return (
                match_seq,
                f"{primer} {match_diag} {match_seq}",
                match_diag[-5:].count("X"),
                misses,
                pct_match,
                query_id,
                f"{match_start_idx}",
                f"{match_end_idx}",
                "1",
                f"{query_length}",
                country,
                iso_a3,
                original_country_name,
            )

        # Have mismatch, but at the end of the genome
        if len(actual_seq) <= len(match_seq):
            return (
                match_seq + "--",
                "",
                0,
                misses,
                pct_match,
                query_id,
                f"{match_start_idx}",
                f"{match_end_idx}",
                "1",
                f"{query_length}",
                country,
                iso_a3,
                original_country_name,
            )
        try:
            return recalculate_values(actual_seq, primer) + (
                query_id,
                f"{match_start_idx}",
                f"{match_end_idx}",
                "1",
                f"{query_length}",
                country,
                iso_a3,
                original_country_name,
            )
        except:
            print(
                query_id,
                virus_id,
                match_seq,
                misses,
                pct_match,
                query_length,
                query_start_idx,
                query_end_idx,
                match_start_idx,
                match_end_idx,
            )
            raise Exception("Sequences length does not match")

    return inner


def clean_missed_results(
    result: pd.DataFrame, fasta_db: Connection, primers: Dict[str, str]
) -> pd.DataFrame:
    """
    Filers the matched data to only show missed viruses.

    Args:

        - result (pd.DataFrame): The dataframe of matches. DateFrame
            will should contain the following column
            - "query_id",
            - "match_id",
            - "query_length",
            - "abs_mismatch",
            - "abs_match",
            - "pct_match",
            - "alignment_length",
            - "query_start_idx",
            - "query_seq",
            - "query_end_idx",
            - "match_start_idx",
            - "match_seq",
            - "match_end_idx",
            - "expected_value",
            - "bitscore",
        - fasta_db (Connection): Mapping Sequence identifier to
            their sequence.
        -primers (Dict[str, str]): Contains the "fwd", "rev" and "prb"
            primers
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
    # ToDo (EB): Consider dropping columns directly from blast to reduce memory consumption
    result = result.drop(
        ["expected_value", "bitscore", "alignment_length"],
        axis=1,
    )
    result = result[
        (result["abs_mismatch"] >= 1) | (result["abs_match"] != result["query_length"])
    ]

    # Checking the virus is globally aligned to query sequence
    df_cleaned = pd.DataFrame(
        list(
            map(
                match_partial_seq(fasta_db, primers),
                result["query_id"],
                result["match_id"],
                result["match_seq"],
                result["abs_mismatch"],
                result["pct_match"],
                result["query_length"],
                result["query_start_idx"],
                result["query_end_idx"],
                result["match_start_idx"],
                result["match_end_idx"],
            )
        ),
        columns=[
            "match_seq",
            "match_diag",
            "misses3",
            "misses",
            "match_pct",
            "type",
            "m_start",
            "m_end",
            "q_start",
            "q_end",
            "country_name",
            "ISO_A3",
            "orig_name",
        ],
        index=result.index,
    )

    # Parses out the virus_name, accession_id, and date from virus identifier
    df_temp = result["match_id"].str.split("|", expand=True).iloc[:, :3]
    df_temp.columns = [
        "virus_name",
        "accession_id",
        "date",
    ]

    # Merges the globally aligned dataframe with the parsed data frame
    df_cleaned = pd.merge(
        left=df_temp, right=df_cleaned, how="inner", left_index=True, right_index=True
    )

    # Removes sequences with weird nucleotide characters
    df_cleaned = df_cleaned[[is_valid_sequence(seq) for seq in df_cleaned["match_seq"]]]

    # Merging the index of alignment for sequence and virus.
    df_cleaned["virus_match_idx"] = df_cleaned["m_start"].str.cat(
        df_cleaned["m_end"], sep=" "
    )
    df_cleaned["query_match_idx"] = df_cleaned["q_start"].str.cat(
        df_cleaned["q_end"], sep=" "
    )

    # reordering data columns to be returned
    df_cleaned = df_cleaned[
        [
            "virus_name",
            "accession_id",
            "date",
            "country_name",
            "ISO_A3",
            "orig_name",
            "match_diag",
            "misses3",
            "misses",
            "match_pct",
            "type",
            "virus_match_idx",
            "query_match_idx",
        ]
    ]
    return df_cleaned


def blast(
    blast_bin: str,
    blast_db_loc: str,
    query_seq: str,
    fasta_db: Connection,
    primers: Dict[str, str] = None,
    out_file_path: str = "./out.csv",
    is_log: bool = False,
    save_csv: bool = False,
) -> pd.DataFrame:
    """
    Does a blast for a query sequence against a blast database

    Args:

        - blast_bin (str): Path of the blast bin folder.
        - blast_db_loc (str): Path to the blast database file.
        - query_seq (str): Path to the query file
        - fasta_db (Connection): Database connection containing Sequence identifier and
            their sequence.
        -primers (Dict[str, str]): Contains the "fwd", "rev" and "prb"
            primers
        - out_file_path(str): The output path (including filename.csv) of the results if [save_csv] is set to [True]
        - is_log (bool): Option to log error messages if they occur
        - save_csv (bool): Option to save the results to a csv file. Use [out_file_path] to specify output location.

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
            "5",
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
    df = pd.read_csv(
        data,
        dtype={
            "qaccver": "string",
            "saccver": "string",
            "qlen": "int",
            "mismatch": "int",
            "nident": "int",
            "pident": "float",
            "length": "int",
            "qstart": "int",
            "qseq": "string",
            "qend": "int",
            "sstart": "int",
            "sseq": "string",
            "send": "int",
            "evalue": "int",
            "bitscore": "float",
        },
    )
    df.columns = list(blast_headers.values())

    if primers is None:
        with open(query_seq) as f:
            content = f.readlines().split()
            _, fwd, _, rev, _, prb = content.split()
            primers = {"fwd": fwd, "rev": rev, "prb": prb}

    results = clean_missed_results(df, fasta_db, primers)
    if save_csv:
        # df.to_csv(f"{out_file_path}_temp.csv", index=False, chunksize=50000)
        results.to_csv(f"{out_file_path}", index=False, chunksize=50000)
    return results


def parse_args():
    parser = argparse.ArgumentParser(
        description="Blast query string against the GISAID hCov-19 datebase",
        epilog="Any errors, please open an issue!",
    )
    parser.add_argument(
        "-qf",
        "--query_file",
        type=str,
        dest="query_file",
        default="",
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
        "-bb",
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
        help="Location of the blast database",
    )
    parser.add_argument(
        "-l",
        "--log_error",
        dest="log",
        action="store_true",
        help="Logs error output to console",
    )

    parser.add_argument(
        "-ib",
        "--is-blast",
        dest="is_blast",
        action="store_true",
        help="Flag to enable blast query",
    )
    return parser.parse_args()


def main():
    start = time.time()
    args = parse_args()

    if args.is_blast:
        with open(args.fasta_seq_dict, "r") as f:
            seq_dict = json.load(f)
        blast(
            args.blast_bin,
            args.blast_db,
            args.query_file,
            seq_dict,
            args.output,
            args.log,
        )
        print(f"time taken: {time.time() - start:.2f} seconds")


if __name__ == "__main__":
    main()
