import json
import pandas as pd

base = "D:/Datasets/GISAID_Update_Analysis/blast/"

result = "C:/Users/Winston/Documents/Code/intern_and_work/Astar/primer_checker/cgi_scripts/output"

data = {}
with open(f"{result}/test.csv") as f:
    data["US-CDC-2"] = pd.read_csv(
        f,
        dtype={
            "virus_name": "string",
            "accession_id": "string",
            "date": "string",
            "country_name": "string",
            "ISO_A3": "string",
            "orig_name": "string",
            "match_diag": "string",
            "misses3": "int",
            "misses": "int",
            "match_pct": "float",
            "type": "string",
            "virus_match_idx": "string",
            "query_match_idx": "string",
        },
    ).to_dict("records")

database_counts = []
with open(f"{base}database_count.json", "r") as f:
    database_counts.append(json.load(f))

with open(f"{base}database_count_daily.json", "r") as f:
    database_counts.append(json.load(f))

to_dump = [data, database_counts]

with open(f"{result}/final.json", "w") as f:
    json.dump(to_dump, f, separators=(",", ":"))
