import argparse
from io import StringIO
import subprocess
import time
from collections import OrderedDict

import pandas as pd
import pycountry as pc
import pycountry_convert as pcc

china_cities = frozenset(
    [
        "anqing",
        "bengbu",
        "hefei",
        "huainan",
        "huangshan",
        "ma’anshan",
        "shexian",
        "tongcheng",
        "tongling",
        "wuhu",
        "xuancheng",
        "beijing",
        "chongqing",
        "hechuan",
        "wanzhou",
        "fuzhou",
        "longyan",
        "nanping",
        "quanzhou",
        "sanming",
        "shaowu",
        "xiamen",
        "yong’an",
        "zhangzhou",
        "dunhuang",
        "jiuquan",
        "lanzhou",
        "pingliang",
        "tianshui",
        "wuwei",
        "yumen",
        "chaozhou",
        "foshan",
        "guangzhou",
        "jiangmen",
        "maoming",
        "meizhou",
        "shantou",
        "shaoguan",
        "shenzhen",
        "zhanjiang",
        "zhaoqing",
        "zhongshan",
        "baise",
        "beihai",
        "guilin",
        "liuzhou",
        "nanning",
        "pingxiang",
        "wuzhou",
        "yulin",
        "anshun",
        "duyun",
        "guiyang",
        "zunyi",
        "haikou",
        "baoding",
        "cangzhou",
        "chengde",
        "handan",
        "kalgan",
        "qinhuangdao",
        "shanhaiguan",
        "shijiazhuang",
        "tangshan",
        "xingtai",
        "xuanhua",
        "zhengding",
        "acheng",
        "binxian",
        "harbin",
        "hegang",
        "hulan",
        "jiamusi",
        "jixi",
        "mudanjiang",
        "qiqihar",
        "shuangyashan",
        "yichun",
        "anyang",
        "hebi",
        "jiaozuo",
        "kaifeng",
        "luohe",
        "luoyang",
        "nanyang",
        "shangqiu",
        "xinxiang",
        "xinyang",
        "xuchang",
        "zhengzhou",
        "zhoukou",
        "hongkong",
        "victoria",
        "daye",
        "hankou",
        "hanyang",
        "huangshi",
        "jingzhou",
        "laohekou",
        "wuchang",
        "wuhan",
        "xiangfan",
        "yichang",
        "changde",
        "changsha",
        "hengyang",
        "jinshi",
        "shaoyang",
        "xiangtan",
        "yiyang",
        "yueyang",
        "zhuzhou",
        "baotou",
        "chifeng",
        "duolun",
        "erenhot",
        "hailar",
        "hohhot",
        "jining",
        "manzhouli",
        "tongliao",
        "changshu",
        "changzhou",
        "huai’an",
        "huaiyin",
        "lianyungang",
        "nanjing",
        "nantong",
        "suzhou",
        "taizhou",
        "wuxi",
        "xuzhou",
        "yancheng",
        "yangzhou",
        "zhenjiang",
        "ganzhou",
        "ji’an",
        "jingdezhen",
        "jiujiang",
        "nanchang",
        "pingxiang",
        "shangrao",
        "zhangshu",
        "baicheng",
        "changchun",
        "jilin",
        "liaoyuan",
        "siping",
        "tonghua",
        "yanji",
        "anshan",
        "beipiao",
        "benxi",
        "dalian",
        "dandong",
        "fushun",
        "fuxin",
        "liaoyang",
        "lüshun",
        "shenyang",
        "wafangdian",
        "yingkou",
        "macau",
        "yinchuan",
        "golmud",
        "lenghu",
        "xining",
        "ankang",
        "baoji",
        "hanzhong",
        "shangluo",
        "tongguan",
        "xi’an",
        "xianyang",
        "yan’an",
        "dezhou",
        "jinan",
        "jining",
        "linzi",
        "qingdao",
        "qufu",
        "weifang",
        "weihai",
        "yantai",
        "zaozhuang",
        "zibo",
        "shanghai",
        "changzhi",
        "datong",
        "jinzhong",
        "linfen",
        "puzhou",
        "taiyuan",
        "yangquan",
        "chengdu",
        "kangding",
        "luzhou",
        "mianyang",
        "nanchong",
        "neijiang",
        "wutongqiao",
        "ya’an",
        "yibin",
        "zigong",
        "tanggu",
        "tianjin",
        "gartok",
        "gyangzê",
        "lhasa",
        "xigazê",
        "hami",
        "hotan",
        "karamay",
        "kashgar",
        "kucha",
        "kuldja",
        "shihezi",
        "turfan",
        "ürümqi",
        "yarkand",
        "dali",
        "gejiu",
        "jinghong",
        "kaiyuan",
        "kunming",
        "pu’er",
        "fenghua",
        "hangzhou",
        "huzhou",
        "jiaxing",
        "jinhua",
        "ningbo",
        "quzhou",
        "shaoxing",
        "wenzhou",
    ]
)

north_a_map = {
    "belize": "BLZ",
    "canada": "CAN",
    "costa rica": "CRI",
    "cuba": "CUB",
    "dominican_republic": "DOM",
    "guatemala": "GTM",
    "jamaica": "JAM",
    "mexico": "MEX",
    "panama": "PAN",
    "usa": "USA",
}

africa_map = {
    "algeria": "DZA",
    "benin": "BEN",
    "botswana": "BWA",
    "cameroon": "CMR",
    "drc": "COD",
    "democratic_republic_of_the_congo": "COD",
    "egypt": "EGY",
    "gabon": "GAB",
    "gambia": "GMB",
    "ghana": "GHA",
    "kenya": "KEN",
    "madagascar": "MDG",
    "mali": "MLI",
    "morocco": "MAR",
    "nigeria": "NGA",
    "reunion": "REU",
    "senegal": "SEN",
    "sierra_leone": "SLE",
    "south_africa": "ZAF",
    "tunisia": "TUN",
    "uganda": "UGA",
    "zambia": "ZMB",
}

south_a_map = {
    "argentina": "ARG",
    "aruba": "ABW",
    "brazil": "BRA",
    "chile": "CHL",
    "colombia": "COL",
    "curacao": "NLD",
    "ecuador": "ECU",
    "peru": "PER",
    "suriname": "SUR",
    "uruguay": "URY",
    "venezuela": "VEN",
}


europe_map = {
    "andorra": "AND",
    "austria": "AUT",
    "belarus": "BLR",
    "belgium": "BEL",
    "bosnia_and_herzegovina": "BIH",
    "bulgaria": "BGR",
    "crimea": "RUS",
    "croatia": "HRV",
    "cyprus": "CYP",
    "czech_republic": "CZE",
    "denmark": "DNK",
    "estonia": "EST",
    "faroe_islands": "FRO",
    "finland": "FIN",
    "france": "FRA",
    "germany": "DEU",
    "gibraltar": "GIB",
    "greece": "GRC",
    "hungary": "HUN",
    "iceland": "ISL",
    "northern_ireland": "IRL",
    "ireland": "IRL",
    "italy": "ITA",
    "latvia": "LVA",
    "lithuania": "LTU",
    "luxembourg": "LUX",
    "moldova": "MDA",
    "montenegro": "MNE",
    "netherlands": "NLD",
    "north_macedonia": "MKD",
    "norway": "NOR",
    "poland": "POL",
    "portugal": "PRT",
    "romania": "ROU",
    "russia": "RUS",
    "serbia": "SRB",
    "scotland": "SRB",
    "slovakia": "SVK",
    "slovenia": "SVN",
    "spain": "ESP",
    "sweden": "SWE",
    "switzerland": "CHE",
    "turkey": "TUR",
    "ukraine": "UKR",
    "united_kingdom": "GBR",
    "scotland": "GBR",
    "wales": "GBR",
    "england": "GBR",
}

asia_map = {
    "bahrain": "BHR",
    "bahrein": "BHR",
    "bangladesh": "BGD",
    "brunei": "BRN",
    "cambodia": "KHM",
    "china": "CHN",
    "georgia": "GEO",
    "hong_kong": "HKG",
    "india": "IND",
    "indonesia": "IDN",
    "iran": "IRN",
    "iraq": "IRQ",
    "israel": "ISR",
    "japan": "JPN",
    "jordan": "JOR",
    "kazakhstan": "KAZ",
    "kuwait": "KWT",
    "lebanon": "LBN",
    "malaysia": "MYS",
    "mongolia": "MNG",
    "myanmar": "MMR",
    "nepal": "NPL",
    "oman": "OMN",
    "pakistan": "PAK",
    "philippines": "PHL",
    "qatar": "QAT",
    "saudi_arabia": "SAU",
    "saudiarabia": "SAU",
    "singapore": "SGP",
    "south_korea": "KOR",
    "sri_lanka": "LKA",
    "taiwan": "TWN",
    "thailand": "THA",
    "timor-leste": "TLS",
    "united_arab_emirates": "ARE",
    "uzbekistan": "UZB",
    "vietnam": "VNM",
}

oceania_map = {
    "new_zealand": "NZL",
    "australia": "AUS",
    "guam": "GUM",
}


def get_country(virus_name: str):
    country_rough = virus_name.split("|")[0].split("/")[1]
    country_rough_clean = country_rough.rstrip().lstrip().lower()
    maps = [africa_map, europe_map, south_a_map, north_a_map, asia_map, oceania_map]
    country = "China"
    iso_a3 = "CHN"
    for continent in maps:
        actl_iso = continent.get(country_rough_clean, "")

        if actl_iso:
            country = " ".join(
                map(lambda x: x.capitalize(), country_rough_clean.split("_"))
            )
            country = "Saudi Arabia" if country == "Saudiarabia" else country

            iso_a3 = actl_iso
            break

    return [country, iso_a3, country_rough_clean]


def match_diag(alignments: pd.Series):
    # print(type(alignments))
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


def clean_result(result: pd.DataFrame):
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
    blast_bin: str, blast_db: str, query_seq: str, out_file_path: str, is_log: bool
):
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
            f"{blast_db}",
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
    # with open(f"{out_file_path}", "w") as f:
    #     f.write(result)
    df = pd.read_csv(data, dtype=str)
    df.columns = list(blast_headers.values())
    results = clean_result(df)
    results.to_csv(f"{out_file_path}", index=False, chunksize=50000)


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
