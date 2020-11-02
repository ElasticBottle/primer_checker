#%%
import time
import pandas as pd
import numpy as np
import json
from typing import Dict, Tuple

from pandas.core.arrays.sparse import dtype
from country_to_alpha import CountryAlphaMap


def check_string(to_check):
    for char in to_check:
        if char not in "ASDF":
            return False

    return True


data = {"test": ["ASDFASFASDJJSAFASD", "ASDASDASDFSASD", "ASDF", "mf"]}

result = pd.DataFrame.from_dict(data)

result = result[[check_string(string) for string in result["test"]]]

print(result)

test = {"2020-01": {"CHN": 12, "SGP": 1}, "2020-02": {"CHN": 11, "HKG": 20}}

test_result = pd.DataFrame.from_dict(
    test,
    orient="index",
)
test_result.fillna(method="ffill", inplace=True, axis=0)
print(test_result)

# start = time.time()
# seq_dict = pd.read_json(
#     "C:/Users/Winston/Documents/Code/intern_and_work/Astar/primer_checker/backend/models/seq_dict.json",
#     orient="index",
# )
# print(f"{time.time() - start:.2f}seconds")

# start = time.time()
# with open(
#     "C:/Users/Winston/Documents/Code/intern_and_work/Astar/primer_checker/backend/models/seq_dict.json",
#     "r",
# ) as f:
#     json_read = json.load(f)
# print(f"{time.time() - start:.2f}seconds")

start = time.time()
test = pd.DataFrame.from_dict(
    {
        "A": np.random.randint(1, 10, size=int(1e6)) * 10,
        "B": np.random.randint(1, 10, size=int(1e6)) * 20,
        "C": np.random.randint(1, 10, size=int(1e6)) * 30,
    },
    dtype=int,
)
print(f"reading {time.time() - start:.2f} seconds")
print(len(test))

start = time.time()
# test["C"] = test["C"].astype("string")
print(f"to string type {time.time() - start:.2f} seconds")

start = time.time()
test["B"] = test["C"]
print(f"orgiinal {time.time()-start:.2f}")

results = []
df = {}
start = time.time()
df = pd.read_csv(
    "C:/Users/Winston/Documents/Code/intern_and_work/Astar/primer_checker/cgi_scripts/output/US-CDC-N2&1604286834.fasta.csv",
    dtype={
        "query_id": "string",
        "match_id": "string",
        "query_length": "int",
        "abs_mismatch": "int",
        "abs_match": "int",
        "pct_match": "float",
        "alignment_length": "int",
        "query_start_idx": "int",
        "query_seq": "string",
        "query_end_idx": "int",
        "match_start_idx": "int",
        "match_seq": "string",
        "match_end_idx": "int",
        "expected_value": "int",
        "bitscore": "float",
    },
)
results.append(round(time.time() - start, 5))
print(f"avg time taken {np.mean(results, axis = 0)} sec")
print(df.dtypes)
# start = time.time()
# test["B"] = test["B"].str.cat(test["C"], sep=" ")
# print(f"basic assignment {time.time()-start:.2f}")
# start = time.time()
# test["B"] = test[["B", "C"]].aggregate(" ".join, axis=1).values
# print(f"orgiinal {time.time()-start:.2f}")

# print(test["B"])
# print(test["B"].str)
# for i in range(100):
#     test.loc[test["A"] < 80, "B"] = 1
#     start = time.time()
#     test.loc[test["A"] < 80, "B"] = test[test["A"] < 80].eval("B = 1")
#     print(f"eval {time.time()-start:.2f}")
# print("after", test["B"].value_counts().sort_values())
def f(row):
    return row[1] + row[0]


timing = []
for i in range(10):
    iter_time = []
    # start = time.time()
    # test["A"] = test[["A", "B"]].apply(lambda x: x["A"] + x["B"], axis=1)
    # print(f"time taken {time.time()-start:.2f}")
    # iter_time.append(time.time() - start)

    start = time.time()
    test["A"] = list(map(lambda x: x[1] + x[0], zip(test["A"], test["B"])))
    print(f"time taken {time.time()-start:.2f}")
    iter_time.append(time.time() - start)

    start = time.time()
    test["A"] = [f(row) for row in zip(test["A"], test["B"])]
    print(f"time taken {time.time()-start:.2f}")
    iter_time.append(time.time() - start)

    start = time.time()
    test["A"] = np.where(test["A"] < 1000, test["A"], 1001)
    print(f"time taken {time.time()-start:.2f}")
    print(test["A"].value_counts())

    start = time.time()
    test["A"] = np.vectorize(lambda x, y: [x, f"{y}"], otypes=[list])(
        test["A"], test["B"]
    )
    print(f"time taken {time.time()-start:.2f}")
    iter_time.append(time.time() - start)
    test["A"] = test["B"]

    start = time.time()
    test["A"] = np.frompyfunc(lambda x, y: x + y, 2, 1)(test["A"], test["B"])
    print(f"time taken {time.time()-start:.2f}")
    iter_time.append(time.time() - start)
    test["A"] = test["A"].astype(int)

    start = time.time()
    test["A"] = test.eval("A + B")
    print(f"time taken {time.time()-start:.5f}")
    iter_time.append(time.time() - start)

    start = time.time()
    test["A"] = test["A"] + test["B"]
    print(f"time taken {time.time()-start:.5f}")
    iter_time.append(time.time() - start)

    timing.append(iter_time)
print(np.mean(timing, axis=0))
#%%


def find_matches(query_seq: str, match_seq: str) -> str:
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


def recalculate_values(actual_seq: str, primer: str):
    # print(actual_seq, primer)
    assert len(actual_seq) == len(primer)
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


def match_partial_seq(fasta_seq_dict: Dict[str, str], primers: Dict[str, str]):
    def inner(
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
    ):
        primer = primers[query_id]
        seq = fasta_seq_dict[virus_id]
        actual_seq = ""
        country, iso_a3, original_country_name = get_country(virus_name=virus_id)
        if query_start_idx != 1 and query_end_idx != query_length:
            match_start_idx = match_start_idx - query_start_idx
            match_end_idx = match_end_idx + (query_length - query_end_idx)
            actual_seq = seq[match_start_idx:match_end_idx].upper()
            # print(f"front, back mismatch, orig: {match_seq}, actual: {actual_seq}")

        elif query_start_idx != 1:
            match_start_idx = match_start_idx - query_start_idx
            actual_seq = seq[match_start_idx:match_end_idx].upper()
            # print(f"front mismatch, orig: {match_seq}, actual: {actual_seq}")

        elif query_end_idx != query_length:
            match_end_idx = match_end_idx + (query_length - query_end_idx)
            actual_seq = seq[match_start_idx - 1 : match_end_idx].upper()
            # print(f"back mismatch, orig: {match_seq}, actual: {actual_seq}")

        else:
            # print("no mismatch")
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

            # dtype="object, object, i4, i4, f4, object, object, object, object, object, ",

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

    return inner


def clean_missed_results(
    result: pd.DataFrame, fasta_seq_dict: Dict[str, str], primers: Dict[str, str]
) -> pd.DataFrame:
    # ToDo (EB): Consider dropping columns directly from blast to reduce memory consumption
    result = result.drop(
        ["expected_value", "bitscore", "alignment_length"],
        axis=1,
    )
    result = result[
        (result["abs_mismatch"] >= 1) | (result["abs_match"] != result["query_length"])
    ]
    df_cleaned = pd.DataFrame(
        list(
            map(
                match_partial_seq(fasta_seq_dict, primers),
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

    df_temp = result["match_id"].str.split("|", expand=True).iloc[:, :3]
    df_temp.columns = [
        "virus_name",
        "accession_id",
        "date",
    ]
    df_cleaned = pd.merge(
        left=df_temp, right=df_cleaned, how="inner", left_index=True, right_index=True
    )
    # df_cleaner.columns = [
    #     "virus_name",
    #     "accession_id",
    #     "date",
    # ]
    # print(df_cleaner)

    df_cleaned = df_cleaned[[is_valid_sequence(seq) for seq in df_cleaned["match_seq"]]]
    df_cleaned["virus_match_idx"] = df_cleaned["m_start"].str.cat(
        df_cleaned["m_end"], sep=" "
    )
    df_cleaned["query_match_idx"] = df_cleaned["q_start"].str.cat(
        df_cleaned["q_end"], sep=" "
    )
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


#%%
fasta_seq_dict_path = "C:/Users/Winston/Documents/Code/intern_and_work/Astar/primer_checker/backend/models/seq_dict.json"

primers = {
    "fwd": "GGGGAACTTCTCCTGCTAGAAT",
    "rev": "CAGCTTGAGAGCAAAATGTCTG",
    "prb": "TTGCTGCTGCTTGACAGATT",
}
fasta_seq_dict = {}
start = time.time()
with open(fasta_seq_dict_path, "r") as f:
    fasta_seq_dict = json.load(f)
print(f"read seq dict, {time.time() - start:.3f}s")
raw_df = pd.read_csv(
    "C:/Users/Winston/Documents/Code/intern_and_work/Astar/primer_checker/cgi_scripts/output/Chine-CDC-N&1603771490.fasta.csv",
    dtype={
        "query_id": "string",
        "match_id": "string",
        "query_length": "int",
        "abs_mismatch": "int",
        "abs_match": "int",
        "pct_match": "float",
        "alignment_length": "int",
        "query_start_idx": "int",
        "query_seq": "string",
        "query_end_idx": "int",
        "match_start_idx": "int",
        "match_seq": "string",
        "match_end_idx": "int",
        "expected_value": "int",
        "bitscore": "float",
    },
)
#%%
start = time.time()
data = clean_missed_results(
    result=raw_df, fasta_seq_dict=fasta_seq_dict, primers=primers
)
print(time.time() - start)
#%%
data.head()

#%%
df = pd.read_csv(
    "C:/Users/Winston/Documents/Code/intern_and_work/Astar/primer_checker/cgi_scripts/output/US-CDC-N2&1604286834.fasta.csv",
    dtype={
        "query_id": "string",
        "match_id": "string",
        "query_length": "int",
        "abs_mismatch": "int",
        "abs_match": "int",
        "pct_match": "float",
        "alignment_length": "int",
        "query_start_idx": "int",
        "query_seq": "string",
        "query_end_idx": "int",
        "match_start_idx": "int",
        "match_seq": "string",
        "match_end_idx": "int",
        "expected_value": "int",
        "bitscore": "float",
    },
)

vid_to_type = {}
with open(
    "C:/Users/Winston/Documents/Code/intern_and_work/Astar/primer_checker/primer_mutation_starter_pack/samples/US-CDC-N2_sensitivity_miss.txt"
) as f:
    while True:
        line = f.readline()
        if len(line.split()) == 0:
            print(f.readline())
            break
        virus_id = line.split()[0].split("|")[0]
        line = f.readline()
        primer_type = line.split()[0]
        vid_to_type[virus_id] = primer_type
        f.readline()
        f.readline()

#%%
df_txt = pd.DataFrame.from_dict(vid_to_type, orient="index")
# %%
df_txt.columns = ["type"]
#%%
df_rev_txt = df_txt[df_txt["type"] == "rev"]

#%%
df_rev = df[df["type"] == "rev"]
#%%
print(len(df))
print(len(df[df["type"] == "rev"]), "rev")
print(len(df[df["type"] == "prb"]), "prb")
print(len(df[df["type"] == "fwd"]), "fwd")
#%%
print(len(df_txt))
print(len(df_txt[df_txt["type"] == "rev"]), "Rev")
print(len(df_txt[df_txt["type"] == "prb"]), "prb")
print(len(df_txt[df_txt["type"] == "fwd"]), "fwd")
#%%
df_rev_txt[~df_rev_txt.index.isin(df_rev["virus_name"])]

#%%
df_rev[~df_rev["virus_name"].isin(df_rev_txt.index)]
# %%
df_rev[df_rev["virus_name"] == "hCoV-19/Wales/PHWC-2AB78/2020"]

#%%
df_rev_txt.loc["hCoV-19/Scotland/CVR3969/2020"]

#%%
# df_txt["hCoV-19/Wales/PHWC-2AB78/2020"]
vid_to_type["hCoV-19/Scotland/CVR3969/2020"]