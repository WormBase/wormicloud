#!/usr/bin/env python3

import argparse
import json
import logging
from collections import defaultdict
import falcon

from wsgiref import simple_server
from falcon import HTTPStatus
from backend.dbmanager import DBManager
from backend.nlp import *
from backend.tpcmanager import TPCManager
from datetime import datetime
from gensim.models import KeyedVectors

from backend.wb_api_manager import get_alliance_descriptions


class HandleCORS(object):
    def process_request(self, req, resp):
        allow_headers = req.get_header(
            'Access-Control-Request-Headers',
            default='*'
        )
        resp.set_header('Access-Control-Allow-Origin', '*')
        resp.set_header('Access-Control-Allow-Methods', '*')
        resp.set_header('Access-Control-Allow-Headers', allow_headers)
        resp.set_header('Access-Control-Max-Age', 1728000)  # 20 days
        if req.method == 'OPTIONS':
            raise HTTPStatus(falcon.HTTP_200, body='\n')


class StorageEngine(object):

    def __init__(self, dbname, user, password, host):
        self.dbname = dbname
        self.user = user
        self.password = password
        self.host = host
        self.db_manager = None

    def __enter__(self):
        self.db_manager = DBManager(self.dbname, self.user, self.password, self.host)

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.db_manager.close()

    def get_interaction_abstracts(self, wb_geneid_a, wb_geneid_b):
        return self.db_manager.get_interaction_abstracts(wb_geneid_a, wb_geneid_b)

    def get_wb_geneid_from_gene_name(self, gene_name):
        return self.db_manager.get_wb_geneid_from_gene_name(gene_name)

    def get_gene_name_id_map(self, gene_names):
        return self.db_manager.get_gene_name_id_map(gene_names)


class WBDBWordListReader:

    def __init__(self, storage_engine: StorageEngine):
        self.db = storage_engine
        self.logger = logging.getLogger(__name__)

    def on_post(self, req, resp):
        with self.db:
            if "gene1" in req.media and "gene2" in req.media:
                wb_geneid_a = self.db.get_wb_geneid_from_gene_name(req.media["gene1"])
                wb_geneid_b = self.db.get_wb_geneid_from_gene_name(req.media["gene2"])
                abstracts = set(self.db.get_interaction_abstracts(wb_geneid_a, wb_geneid_b)) | set(
                    self.db.get_interaction_abstracts(wb_geneid_b, wb_geneid_a))
                counters = get_word_counts(corpus=list(abstracts), count=int(req.media["count"]) if
                                           "count" in req.media and int(req.media["count"]) > 0 else None)
                resp.body = '{{"counters": {}}}'.format("{" + ", ".join(["\"" + word + "\":" + str(count) for
                                                                         word, count in counters]) + "}")
                resp.status = falcon.HTTP_OK
            else:
                resp.status = falcon.HTTP_BAD_REQUEST


class TPCWordListReader:

    def __init__(self, tpc_manager: TPCManager, db_manager: StorageEngine, we_model_path):
        self.tpc_manager = tpc_manager
        self.db_manager = db_manager
        self.logger = logging.getLogger(__name__)
        self.we_model = KeyedVectors.load_word2vec_format(we_model_path, binary=True)

    def get_geneabs_year_score(self, papers, keywords_list, case_sensitive, year_filter, max_results, search_type, author):
        geneabs_year_score = []
        paperid_year = {paper["identifier"]: get_year_from_date(paper["year"]) for paper in papers}
        paperid_score = {paper["identifier"]: paper["score"] for paper in papers}
        genes_matches = self.tpc_manager.get_category_matches(keywords_list, case_sensitive, year_filter,
                                                              "Gene (C. elegans) (tpgce:0000000)", author,
                                                              max_results=max_results, lower=True,
                                                              search_type=search_type)
        protein_matches = self.tpc_manager.get_category_matches(keywords_list, case_sensitive, year_filter,
                                                                "Protein (C. elegans) (tppce:0000000)", author,
                                                                max_results=max_results, lower=True,
                                                                search_type=search_type)
        geneabs_year_score.extend([(" ".join(gene_m["matches"]), paperid_year[gene_m["identifier"]],
                                    paperid_score[gene_m["identifier"]]) for gene_m in genes_matches if "matches" in
                                   gene_m and gene_m["matches"] and gene_m["identifier"] in paperid_year])
        geneabs_year_score.extend([(" ".join(protein_m["matches"]), paperid_year[protein_m["identifier"]],
                                    paperid_score[protein_m["identifier"]]) for protein_m in protein_matches if "matches"
                                   in protein_m and protein_m["matches"]])
        return geneabs_year_score

    @staticmethod
    def get_word_counters(weighted_score, abstracts, genes_only, count):
        counters = []
        if weighted_score:
            counter_all_abs = defaultdict(int)
            for ab in abstracts:
                for word, counter in get_word_counts(corpus=[ab[0]], count=count, gene_only=genes_only):
                    counter_all_abs[word] += counter * (ab[2] if weighted_score else 1)
            counters.append(list(counter_all_abs.items()))
        else:
            counters.append(get_word_counts(corpus=[ab[0] for ab in abstracts], count=count, gene_only=genes_only))
        counters = [[(word.replace("'", "").replace("\"", "").replace("\\", ""), count) for word, count in counter] for
                    counter in counters]
        return counters

    def on_post(self, req, resp):
        with self.db_manager:
            start = datetime.now()
            if "keywords" in req.media and "caseSensitive" in req.media and "years" in req.media and "logicOp" in req.media:
                keywords_lists = [[k] for k in req.media["keywords"]] if req.media["logicOp"] == 'Overlap' else \
                    [req.media["keywords"]]
                search_type = req.media["searchType"] if "searchType" in req.media else "document"
                genes_only = req.media["genesOnly"] if "genesOnly" in req.media else False
                max_counters = int(req.media["count"]) if "count" in req.media and int(req.media["count"]) > 0 else None
                case_sensitive = req.media["caseSensitive"]
                logic_operator = req.media["logicOp"]
                author = req.media["author"]
                max_api_results = req.media["maxResults"]
                cluster_words = req.media["clusterWords"]
                weighted_score = req.media["weightedScore"]
                min_similarity = float(req.media["clusterWordsMinSim"]) if "clusterWordsMinSim" in req.media else 0.7
                references = []
                ab_year_score = []
                years_abstracts = defaultdict(list)

                for year_filter in req.media["years"]:
                    for keywords_list in keywords_lists:
                        papers = self.tpc_manager.get_papers(keywords_list, case_sensitive , year_filter,
                                                             logic_operator, author, max_api_results , search_type)
                        references.extend(self.tpc_manager.get_references(papers))
                        if genes_only and papers:
                            ab_year_score.extend(self.get_geneabs_year_score(papers, keywords_list, case_sensitive,
                                                                             year_filter, max_api_results, search_type,
                                                                             author))
                        else:
                            ab_year_score.extend(self.tpc_manager.get_ab_year_score(papers))
                for ab, year, score in ab_year_score:
                    years_abstracts[year].append(ab)
                counters = self.get_word_counters(weighted_score, ab_year_score, genes_only, max_counters)
                word_trends = []
                all_words = [w for counter in counters for w, _ in counter]
                for year, all_abstracts in years_abstracts.items():
                    if year != 0:
                        word_trends.append({"name": year})
                        word_counters = {wc[0]: wc[1] for wc in get_word_counts(corpus=all_abstracts)}
                        word_trends[-1].update({w: word_counters[w] if w in word_counters else 0 for w in all_words})
                word_trends.sort(key=lambda x: x['name'])
                prev_year = -1
                for index, year_trend in enumerate(word_trends):
                    if prev_year > 0 and int(prev_year) != int(year_trend['name']) + 1:
                        word_trends[index:index] = [{**{'name': y}, **{w: 0 for w in all_words}} for y in range(
                            int(prev_year) + 1, int(year_trend['name']))]
                    prev_year = year_trend['name']
                merged_counters = defaultdict(int)
                words_overlap = defaultdict(int)
                for counter in counters:
                    for word, count in counter:
                        words_overlap[word] += 1
                words_overlap = [w for w, c in words_overlap.items() if c == len(counters)]
                for counter in counters:
                    for word, count in counter:
                        if logic_operator != 'Overlap' or word in words_overlap:
                            merged_counters[word] += count
                gene_descriptions = None
                if genes_only:
                    gene_name_id_map = self.db_manager.get_gene_name_id_map(
                        [gene_name for gene_name, count in sorted(list(merged_counters.items()), key=lambda x: x[1],
                                                                  reverse=True)])
                    gene_id_desc_map = get_alliance_descriptions()
                    gene_descriptions = {gene_name: gene_id_desc_map[gene_id] if gene_id in gene_id_desc_map else ""
                                         for gene_name, gene_id in gene_name_id_map.items()}
                if cluster_words and len(merged_counters) > 0:
                    merged_counters = cluster_words_by_similarity(self.we_model, merged_counters, min_similarity)
                resp.body = '{{"counters": {}, "references": {}, "trends": {}, "descriptions": {}}}'.format("{" + ", ".join(
                    ["\"" + word + "\":" + str(count) for word, count in merged_counters.items()]) + "}", "[" + ",".join(
                    ["{\"wb_id\":\"" + ref[0] + "\", \"title\":\"" + ref[1] + "\", \"journal\":\"" + ref[2] +
                     "\", \"year\":\"" + ref[3] + "\", \"pmid\":\"" + ref[4] + "\", \"authors\":\"" + ref[5] + "\"}" for ref in references]) + "]" if
                  references else "[]", json.dumps(word_trends), json.dumps(gene_descriptions) if gene_descriptions else "{}")
                resp.status = falcon.HTTP_OK
                end = datetime.now()
                print(end - start)
            else:
                resp.status = falcon.HTTP_BAD_REQUEST


def main():
    parser = argparse.ArgumentParser(description="Find new documents in WormBase collection and pre-populate data "
                                                 "structures for Author First Pass")
    parser.add_argument("-N", "--db-name", metavar="db_name", dest="db_name", type=str)
    parser.add_argument("-U", "--db-user", metavar="db_user", dest="db_user", type=str)
    parser.add_argument("-P", "--db-password", metavar="db_password", dest="db_password", type=str, default="")
    parser.add_argument("-H", "--db-host", metavar="db_host", dest="db_host", type=str)
    parser.add_argument("-l", "--log-file", metavar="log_file", dest="log_file", type=str, default=None,
                        help="path to the log file to generate. Default ./afp_pipeline.log")
    parser.add_argument("-L", "--log-level", dest="log_level", choices=['DEBUG', 'INFO', 'WARNING', 'ERROR',
                                                                        'CRITICAL'], default="INFO",
                        help="set the logging level")
    parser.add_argument("-m", "--we-model", metavar="we_model_path", dest="we_model_path", type=str)
    parser.add_argument("-t", "--tpc-token", metavar="tpc_token", dest="tpc_token", type=str, default="")
    parser.add_argument("-p", "--port", metavar="port", dest="port", type=int, help="API port")
    args = parser.parse_args()

    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')

    app = falcon.API(middleware=[HandleCORS()])
    tpc_manager = TPCManager(textpresso_api_token=args.tpc_token)
    db_manager = StorageEngine(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)
    tpc_writer = TPCWordListReader(tpc_manager=tpc_manager, db_manager=db_manager, we_model_path=args.we_model_path)
    app.add_route('/word_counter', tpc_writer)

    httpd = simple_server.make_server('0.0.0.0', args.port, app)
    httpd.serve_forever()


if __name__ == '__main__':
    main()
else:
    import os
    app = falcon.API(middleware=[HandleCORS()])
    tpc_manager = TPCManager(textpresso_api_token=os.environ['TPC_TOKEN'])
    db_manager = StorageEngine(dbname=os.environ["DB_NAME"], user=os.environ["DB_USER"],
                               password=os.environ["DB_PASSWORD"], host=os.environ["DB_HOST"])
    tpc_writer = TPCWordListReader(tpc_manager=tpc_manager, db_manager=db_manager,
                                   we_model_path=os.environ["WE_MODEL_PATH"])
    app.add_route('/word_counter', tpc_writer)
