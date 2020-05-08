#!/usr/bin/env python3

import argparse
import logging
import falcon
import nltk

from wsgiref import simple_server
from falcon import HTTPStatus
from nltk.corpus import stopwords
from backend.dbmanager import DBManager
from backend.nlp import *
from backend.tpcmanager import TPCManager

nltk.download('wordnet')
nltk.download('stopwords')
stop_words = set(stopwords.words('english'))


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

    def __init__(self, tpc_manager: TPCManager):
        self.tpc_manager = tpc_manager
        self.logger = logging.getLogger(__name__)

    def on_post(self, req, resp):
        if "keywords" in req.media and "caseSensitive" in req.media and "year" in req.media:
            papers = self.tpc_manager.get_papers(req.media["keywords"], req.media["caseSensitive"], req.media["year"])
            abstracts = self.tpc_manager.get_abstracts(papers)
            references = self.tpc_manager.get_references(papers)
            if "genesOnly" in req.media and req.media["genesOnly"] and papers:
                genes_matches = self.tpc_manager.get_category_matches(
                    req.media["keywords"], req.media["caseSensitive"], req.media["year"],
                    "Gene (C. elegans) (tpgce:0000001)")
                protein_matches = self.tpc_manager.get_category_matches(
                    req.media["keywords"], req.media["caseSensitive"], req.media["year"],
                    "Protein (C. elegans) (tpprce:0000001)")
                abstracts = [" ".join(gene_m["matches"]) for gene_m in genes_matches if "matches" in gene_m and
                             gene_m["matches"]]
                abstracts.extend([" ".join(protein_m["matches"]) for protein_m in protein_matches if "matches" in
                                  protein_m and protein_m["matches"]])
            counters = get_word_counts(corpus=abstracts, count=int(req.media["count"]) if "count" in req.media and int(
                req.media["count"]) > 0 else None)
            resp.body = '{{"counters": {}, "references": {}}}'.format("{" + ", ".join(["\"" + word + "\":" + str(
                count) for word, count in counters]) + "}", "[" + ",".join(
                ["{\"wb_id\":\"" + ref[0] + "\", \"title\":\"" + ref[1] + "\", \"journal\":\"" + ref[2] +
                 "\", \"year\":\"" + ref[3] + "\"}" for ref in references]) + "]" if references
                else "[]")
            resp.status = falcon.HTTP_OK
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
    parser.add_argument("-t", "--tpc-token", metavar="tpc_token", dest="tpc_token", type=str, default="")
    parser.add_argument("-p", "--port", metavar="port", dest="port", type=int, help="API port")
    args = parser.parse_args()

    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')

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

    app = falcon.API(middleware=[HandleCORS()])
    #db = StorageEngine(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)
    tpc_manager = TPCManager(textpresso_api_token=args.tpc_token)
    tpc_writer = TPCWordListReader(tpc_manager=tpc_manager)
    app.add_route('/word_counter', tpc_writer)

    httpd = simple_server.make_server('0.0.0.0', args.port, app)
    httpd.serve_forever()


if __name__ == '__main__':
    main()
