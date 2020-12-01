import argparse
import subprocess
import time


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
    base_path = "D:/Datasets/GISAID/blast/"

    parser.add_argument(
        "-ff",
        "--fasta_file",
        type=str,
        dest="fasta_file",
        default=f"{base_path}/test.fasta",
        help=" location for the fasta file which will be first cleaned and then used to build a blast database",
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
        default="D:/Datasets/GISAID/blast/blastdb/database",
        help="Path to the blast database",
    )
    return parser.parse_args()


def main():
    start = time.time()
    args = parse_args()
    build_gisaid_blast_db(args.blast_bin, args.fasta_file, args.blast_db_out)
    print(f"Time Taken: {time.time() - start:.2f}")


if __name__ == "__main__":
    main()
