#!/afs/bii.a-star.edu.sg/dept/mendel/METHODS/corona/local/anaconda3/envs/primer/bin/python3.7

import argparse
import sqlite3
from sqlite3.dbapi2 import Connection
import time


def create_connection(fasta_dict_output_path: str):
    """
    create a database connection to the SQLite database
        specified by db_file
    Args:
        - fasta_dict_output_path (str): Path to store the converted database
            of the cleaned fasta file

    Return:

        - Connection object or None
    """
    conn = None
    try:
        conn = sqlite3.connect(fasta_dict_output_path)
        return conn
    except sqlite3.Error as e:
        print(e)

    return conn


def build_seq_dict(clean_fasta_file_path: str, fasta_dict_output_path: str):
    """
    Builds a dictionary mapping identifiers to their sequence and outputs it.

    - Args

        - clean_fasta_file_path (str): The path to the fasta file used
            to build the blast database.
        - fasta_dict_output_path (str): Path to store the converted database
            of the cleaned fasta file

    """
    connection = create_connection(fasta_dict_output_path=fasta_dict_output_path)
    if connection is None:
        raise Exception("Error connecting to database")
    with connection:
        sequence_table = """CREATE TABLE IF NOT EXISTS Sequences (
                                    identifier text PRIMARY KEY,
                                    sequence text NOT NULL
                                );"""
        connection.execute(sequence_table)

    with connection:
        sql = "DELETE FROM Sequences"
        connection.execute(sql)

    insert_database_from(clean_fasta_file_path, connection=connection)


def insert_database_from(clean_fasta_file_path: str, connection: Connection):
    """
    Builds a dictionary mapping identifiers to their sequence and outputs it.

    - Args

        - clean_fasta_file_path (str): The path to the fasta file used
            to build the blast database.
        - connection (Connection): Connection to database to insert sequence
    """
    identifier = ""
    batch_seq_dict = {}
    batch_num = 0
    with open(clean_fasta_file_path, "r") as f:
        f.readline()
        for line in f.readlines():
            if line.startswith(">"):
                batch_num += 1
                if batch_num % 10000 == 0:
                    insert_db(connection=connection, sequences=batch_seq_dict)
                    batch_seq_dict.clear()
                identifier = line[1:].strip()
                batch_seq_dict[identifier] = ""
            else:
                try:
                    batch_seq_dict[identifier] += line.strip()
                except:
                    print(identifier, line)
                    print(batch_num)
                    raise Exception("keyError")
    insert_db(connection=connection, sequences=batch_seq_dict)


def insert_db(connection: Connection, sequences: str):
    try:
        with connection:
            sql = """INSERT INTO Sequences(identifier,sequence)
            VALUES(?,?)"""
            connection.executemany(sql, sequences.items())
    except (sqlite3.OperationalError, sqlite3.IntegrityError) as e:
        print("Operation failed", e)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Blast query string against the GISAID hCov-19 datebase",
        epilog="Any errors, please open an issue!",
    )

    parser.add_argument(
        "-fsdi",
        "--fasta-seq-dict-input",
        type=str,
        dest="fasta_seq_dict_input",
        default="D:/Datasets/GISAID/blast/test.fasta",
        help="Path to the fasta file used to build the Blast database",
    )
    parser.add_argument(
        "-fsdo",
        "--fasta-seq-dict-output",
        type=str,
        dest="fasta_seq_dict_output",
        default="D:/Datasets/GISAID/blast/seq_db.db",
        help="Path to the sql database file mapping identifies to sequences used to build the Blast database",
    )
    return parser.parse_args()


def main():
    start = time.time()
    args = parse_args()

    build_seq_dict(
        args.fasta_seq_dict_input,
        args.fasta_seq_dict_output,
    )
    print(f"time taken: {time.time() - start:.2f} seconds")


if __name__ == "__main__":
    main()
