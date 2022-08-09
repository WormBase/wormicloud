import gzip
import urllib.request

import requests as requests


def get_description_from_gene_id(gene_id):
    api_uri = f"http://rest.wormbase.org/rest/field/gene/{gene_id}/concise_description"
    r = requests.get(url=api_uri)
    return r.json()["concise_description"]["data"]["text"]


def get_alliance_descriptions():
    response = urllib.request.urlopen("https://fms.alliancegenome.org/api/data/download/GENE-DESCRIPTION-TSV_WB.tsv.gz")
    gene_id_description_map = {}
    with gzip.GzipFile(fileobj=response, mode='r') as fin:
        for line in fin:
            line = line.decode('utf-8').strip()
            if line and not line.startswith("#"):
                linearr = line.split("\t")
                gene_id_description_map[linearr[0][3:]] = linearr[2]
    return gene_id_description_map
