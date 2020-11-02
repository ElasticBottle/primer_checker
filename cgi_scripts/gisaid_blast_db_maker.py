import argparse
import datetime
import subprocess
import time
from typing import Tuple


def fasta_file_cleaner(
    str_processing: str,
    to_output: bool,
    count: int,
    format_err: int,
    output_stream,
) -> Tuple[bool, int, int]:
    """
    Checks if a given [str_processing] is clean

    [str_processing] is not clean if:

        - date does not contain a year, month, and day

    Args:

        - str_processing (str): The string to process.
            - If the first char is ">", it is an identifier and will be checked for valid date.
            - Identifier should resemble this format "hCoV-19/COUNTRY_NAME/VIRUS_ID/2020|ACCESSION_ID|(date in YYYY-MM-DD fmt)"
        - to_output (bool): Indicates if [str_processing] should be written to file if it is *not* an identifier
        - count (int): The current number of valid sequences written
        - format_err (int): The current number of invalid sequences discarded
        - output_stream (File Object): The stream to write the output content

    Returns

        - bool: Representing whether the next line should be written to file or not
        - int: The total number of valid sequences
        - int: The total number of invalid sequences
    """
    # End of file, terminate
    if str_processing == "":
        return "", count, format_err
    # Identifier, Process, and decide on whether write to output
    elif str_processing[0] == ">":
        details = str_processing.split("|")
        virus_name, accession_id, date = details[0], details[1], details[2]
        virus_name = virus_name.rstrip().lstrip().replace(" ", "_")
        date = date.rstrip().lstrip().split("-")
        # Invalid identifier, don't write sequence to output
        if (
            len(date) != 3
            or int(date[2]) == 0
            or int(date[1]) == 0
            or int(date[0]) < 2019
        ):
            print(f"rejected {details}")
            return False, count, format_err + 1
        # Valid identifier, write sequence to output
        else:
            date = "-".join(date)
            output_stream.write("|".join([virus_name, accession_id, date]))
            output_stream.write("\n")
            return True, count + 1, format_err
    # Sequence of a valid identifier
    elif to_output:
        output_stream.write(str_processing)
    # Invalid sequence
    return to_output, count, format_err


def build_base_fasta_file(inp: str, out_file: str):
    """
    Cleans the fasta file from GISAID to include only those with proper date and writes it to disk

    Args:

        - inp (str): Path to the input fasta file
        - out_file (str): Path to the output fasta file

    Returns:

        - str: the path to the output fasta file
    """
    with open(inp, "r") as fasta:
        with open(out_file, "w") as output:
            to_output = True
            count = 0
            format_errors = 0
            while True:
                to_output, count, format_errors = fasta_file_cleaner(
                    fasta.readline(),
                    to_output,
                    count,
                    format_errors,
                    output,
                )
                if to_output == "":
                    break
    print(
        f"Summary {datetime.datetime.now().strftime('%Y-%m-%d')}: Processed {count} sequences, {format_errors} sequences rejected, {count + format_errors} sequences in total"
    )
    return out_file


def build_gisaid_blast_db(blast_bin: str, input_file: str, target_file: str):
    """
    Builds blast db from a fasta file

    Args:

        - bast_bin (str): path to the blast executables
        - input_file (str): path to the input fasta file
        - target_file (str): path to the blast database file
    """
    _ = subprocess.run(
        [
            f"{blast_bin}makeblastdb",
            "-in",
            f"{input_file}",
            "-dbtype",
            "nucl",
            "-out",
            f"{target_file}",
            "-logfile",
            "blast_db.log",
        ],
        capture_output=True,
        universal_newlines=True,
    )


def parse_args():
    parser = argparse.ArgumentParser(
        description="Builds a blast database from a fasta file",
        epilog="Any errors, please open an issue!",
    )
    base_path = "C:/Users/winst/Documents/MEGA/intern_and_work_proj/ASTAR_BII/primer_checker/primer_mutation_starter_pack/"
    # base_path = "C:/Users/winst/Documents/MEGA/intern_and_work_proj/ASTAR_BII/primer_checker/primer_mutation_starter_pack/"
    parser.add_argument(
        "-ff",
        "--fasta_file",
        type=str,
        dest="fasta_file",
        default=f"{base_path}/samples/corona2020_export.fasta",
        help=" location for the fasta file which will be first cleaned and then used to build a blast database",
    )
    parser.add_argument(
        "-cfo",
        "--cleaned_fasta_out",
        type=str,
        dest="clean_fasta_out",
        default=f"{base_path}/samples/cleaned_base.fasta",
        help="output for the cleaned fasta file",
    )
    parser.add_argument(
        "-fdb",
        "--fasta_database",
        type=str,
        dest="fasta_db",
        default="",
        help="Input path for the fasta file to be used in making the blast database. It is highly recommended that you use -ff instead so that the headings are formatted correctly.",
    )
    parser.add_argument(
        "-bb",
        "--bast_bin",
        type=str,
        dest="blast_bin",
        default="C:/Users/Winston/Documents/Code/intern_and_work/Astar/primer_checker/primer_mutation_starter_pack/NCBI/blast-2.10.1+/bin/",
        help="Path to the Blast Bin",
    )
    parser.add_argument(
        "-bo",
        "--blast_db_output",
        type=str,
        dest="blast_db_out",
        default="D:/Datasets/GISAID_Update_Analysis/blast/blastdb/database",
        help="Path to the blast database",
    )
    return parser.parse_args()


def main():
    start = time.time()
    args = parse_args()
    fasta_output = ""
    if args.fasta_db:
        fasta_output = args.fasta_db
    else:
        fasta_output = build_base_fasta_file(
            args.fasta_file,
            args.clean_fasta_out,
        )
    build_gisaid_blast_db(args.blast_bin, fasta_output, args.blast_db_out)
    print(f"Time Taken: {time.time() - start:.2f}")


if __name__ == "__main__":
    main()
