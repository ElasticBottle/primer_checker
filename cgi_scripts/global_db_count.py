#!/afs/bii.a-star.edu.sg/dept/mendel/METHODS/corona/local/anaconda3/envs/primer/bin/python3.7

import argparse
import datetime
import json
from io import StringIO
from typing import Dict

import pandas as pd
from country_to_alpha import CountryAlphaMap


def get_raw_count(input_path: str) -> Dict[str, Dict[str, int]]:
    """
    Counts the number of submitted sequences per country

    Args:

        - input_path (str): Specifies the path of the GISAID fasta file.
            - File should have identifier that looks like "hCoV-19/COUNTRY_NAME/VIRUS_ID/2020|ACCESSION_ID|(date in YYYY-MM-DD fmt)"

    Returns:

        - Dict[str. Dict[str, int]]: Returns a dictionary with Date as the high level key.
            - Inner dictionary is country_name -> submissions_from_country
    """
    count = {}
    with open(input_path, "r") as fasta:
        while True:
            info = fasta.readline()
            # End of File
            if not info:
                break
            # Not an identifier so moving on
            if info[0] != ">":
                continue

            details = info.rstrip().split("|")
            country = (
                details[0].split("/")[1].lstrip().rstrip().replace(" ", "_").lower()
            )
            date = details[2].strip()
            yr_month_day = date.split("-")

            # Ensure that date format is valid
            if (
                len(yr_month_day) != 3
                or int(yr_month_day[2]) == 0
                or int(yr_month_day[2]) > 31
                or int(yr_month_day[2]) < 1
                or int(yr_month_day[1]) == 0
                or int(yr_month_day[1]) > 12
                or int(yr_month_day[1]) < 1
                or int(yr_month_day[0]) < 2019
            ):
                print(f"Rejected {details}")

            # Format is valid
            elif len(yr_month_day) == 3:
                _, iso_a3 = CountryAlphaMap.getCode(country)

                curr = count.get(date, None)

                # If detail for current date doesn't exist
                if not curr:
                    count[date] = {}

                # Updating count database
                count[date].update(
                    {
                        "total": count.get(date, {}).get("total", 0) + 1,
                        iso_a3: count.get(date, {}).get(iso_a3, 0) + 1,
                    }
                )
        return count


def accumulate(raw_count: Dict[str, Dict[str, int]]) -> pd.DataFrame:
    """
    Creates a dataFrame from a dictionary of date -> dictionary of country_name -> submission_by_country_name

    Args:

        - raw_count (Dict[str, Dict[str, int]]): The dictionary to convert. It is in a {idx1: {col1: val, col2:val}, idx2: {col1: val, col2:val}} format.

    Returns:

        - pd.DataFrame: Dates are index, column are country names with an additional "Total" column.
            - Index date ranges from the earliest value in [raw_count], to the latest value in [raw_count]
            - Any missing dates in [raw_count] is filled by the closest earliest date
    """
    df = pd.DataFrame.from_dict(raw_count, orient="index")
    df.index = pd.to_datetime(df.index, format="%Y-%m-%d")
    df = df.groupby(df.index).sum()
    date_range = pd.date_range(df.index.min(), df.index.max())

    df = df.reindex(date_range)
    df = df.fillna(0)
    df = df.cumsum(axis=0)
    return df


def fill_forward(raw_count: Dict[str, Dict[str, int]]) -> pd.DataFrame:
    df = pd.DataFrame.from_dict(raw_count, orient="index")
    df.index = pd.to_datetime(df.index)
    df = df.groupby(df.index).sum()
    date_range = pd.date_range(df.index.min(), df.index.max())

    df = df.reindex(date_range)
    df = df.fillna(method="ffill", axis=0)
    return df


def output_to_json(to_output: pd.DataFrame, path: str, file_name: str):
    """
    Outputs the dataframe to a json file
    """
    to_output.index = to_output.index.strftime("%Y-%m-%d")
    to_output.to_json(f"{path}/{file_name}", orient="index")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Maintains the number of sequences in the GISAID database through counting each individual sequence",
        epilog="If you notice any bugs or problem, please open an issue at https://github.com/ElasticBottle/primer_checker",
    )
    parser.add_argument(
        "-i",
        "--input_fasta",
        type=str,
        dest="input_fasta",
        default="./all.fasta",
        help="The path to the fasta file containing the GISAID sequences",
    )
    parser.add_argument(
        "-o",
        "--output_path",
        type=str,
        dest="output_path",
        default="./",
        help="output path for the database_count.json",
    )
    parser.add_argument(
        "-od",
        "--output_path_daily",
        type=str,
        dest="output_path_daily",
        default="./",
        help="output path for the database_count_daily.json",
    )

    return parser.parse_args()


def main():
    args = parse_args()
    raw_count = get_raw_count(args.input_fasta)
    accumulated_count = accumulate(raw_count)
    output_to_json(
        accumulated_count,
        args.output_path,
        f"database_count{datetime.datetime.now().strftime('%Y-%m-%d')}.json",
    )
    daily_count = fill_forward(raw_count)
    output_to_json(
        daily_count,
        args.output_path_daily,
        f"database_count_daily{datetime.datetime.now().strftime('%Y-%m-%d')}.json",
    )


if __name__ == "__main__":
    main()