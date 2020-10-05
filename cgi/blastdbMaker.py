import subprocess
import argparse


def build_base_fasta_file(inp: str, out_file: str):
    """
    Extracts first sequence in a fast file and puts it into its own file
    """
    with open(inp, "r") as fasta:
        identifier = fasta.readline()
        seq = fasta.readline()
        cleaned_seq = seq.replace("-", "")
        with open(out_file, "w") as out:
            out.write(identifier)
            out.write(cleaned_seq)
    return out_file


def build_blast_db(blast_bin: str, input_file: str, target_file: str):
    """
    Builds blast db from input file
    """
    process = subprocess.run(
        [
            f"{blast_bin}makeblastdb",
            "-in",
            f"{input_file}",
            "-dbtype",
            "nucl",
            "-out",
            f"{target_file}",
        ],
        capture_output=True,
        universal_newlines=True,
    )
    print(process.stdout)
    print(process.stderr)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Builds a blast database from a single sequence in a fasta input",
        epilog="Any errors, please open an issue!",
    )
    base_path = "C:/Users/winst/Documents/MEGA/intern_and_work_proj/ASTAR_BII/primer_checker/primer_mutation_starter_pack/"
    # base_path = "C:/Users/winst/Documents/MEGA/intern_and_work_proj/ASTAR_BII/primer_checker/primer_mutation_starter_pack/"
    parser.add_argument(
        "-ff",
        "--fasta_file",
        type=str,
        dest="fasta_file",
        default=f"{base_path}gisaid_cov2020_sequences_aligned_processed.fasta",
        help=" location for the fasta file",
    )
    parser.add_argument(
        "-cf",
        "--cleaned_fasta",
        type=str,
        dest="fasta_out",
        default=f"{base_path}cleaned_base.fasta",
        help="output for the cleaned fasta file",
    )
    parser.add_argument(
        "-fdb",
        "--fasta_database",
        type=str,
        dest="fasta_db",
        default=f"C:/Users/winst/Documents/MEGA/intern_and_work_proj/ASTAR_BII/primer_checker/primer_mutation_starter_pack/samples/corona2020_export.fasta.clean",
        help="Input path for the fasta file to be used in making the blast database",
    )
    parser.add_argument(
        "-b",
        "--bast_db",
        type=str,
        dest="blast_db",
        default="C:/Users/winst/Documents/MEGA/intern_and_work_proj/ASTAR_BII/primer_checker/primer_mutation_starter_pack/NCBI/blast-2.10.1+/bin/",
        help="Location for Blast Database exe",
    )
    parser.add_argument(
        "-bo",
        "--blast_db_output",
        type=str,
        dest="blast_db_out",
        default="D:/Datasets/GISAID_Update_Analysis/blast/blastdb/database",
        help="Output path for the blast database",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    fasta_output = build_base_fasta_file(
        args.fasta_file,
        args.fasta_out,
    )
    build_blast_db(args.blast_db, args.fasta_db, args.blast_db_out)
    # build_blast_db(args.blast_db, fasta_output, args.blast_db_out)


if __name__ == "__main__":
    main()
