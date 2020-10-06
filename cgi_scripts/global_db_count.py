#!/afs/bii.a-star.edu.sg/dept/mendel/METHODS/corona/local/anaconda3/envs/primer/bin/python3.7

import argparse
import datetime
import json
from io import StringIO
from typing import Dict

import pandas as pd
from country_to_alpha import CountryAlphaMap


def get_raw_count(input_path: str):
    count = {}
    with open(input_path, "r") as fasta:
        while True:
            info = fasta.readline()
            if not info:
                break
            if info[0] != ">":
                continue

            details = info.rstrip().split("|")

            country = (
                details[0].split("/")[1].lstrip().rstrip().replace(" ", "_").lower()
            )
            date = details[2].strip()
            yr_month_day = date.split("-")

            if len(yr_month_day) == 2:
                yr_month_day.append("01")
                date = "-".join(yr_month_day)

            if len(yr_month_day) != 1:
                if int(yr_month_day[1]) > 12 or int(yr_month_day[1]) < 1:
                    print(f"month error {details}")
                    continue
                if int(yr_month_day[2]) > 31 or int(yr_month_day[2]) < 1:
                    print(f"Day error {details}")
                    continue
                _, iso_a3 = CountryAlphaMap.getCode(country)

                curr = count.get(date, None)
                if not curr:
                    count[date] = {}
                count[date].update(
                    {
                        "total": count.get(date, {}).get("total", 0) + 1,
                        iso_a3: count.get(date, {}).get(iso_a3, 0) + 1,
                    }
                )
        return count


def accumulate(raw_count: Dict[str, int]):

    to_read = StringIO(json.dumps(raw_count))
    df = pd.read_json(to_read, orient="index")
    df.index = pd.to_datetime(df.index)
    df = df.groupby(df.index).sum()
    date_range = pd.date_range(df.index.min(), df.index.max())

    df = df.reindex(date_range)
    df = df.fillna(0)
    df = df.cumsum(axis=0)
    return df


def output_to_json(to_output: pd.DataFrame, path: str):
    to_output.index = to_output.index.strftime("%Y-%m-%d")
    to_output.to_json(f"{path}/database_count.json", orient="index")


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

    return parser.parse_args()


def main():
    args = parse_args()
    raw_count = get_raw_count(args.input_fasta)
    final_count = accumulate(raw_count)
    output_to_json(final_count, args.output_path)


if __name__ == "__main__":
    main()