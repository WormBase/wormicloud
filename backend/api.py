#!/usr/bin/env python3

import argparse
import logging
import falcon
import nltk

from wsgiref import simple_server
from falcon import HTTPStatus
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import RegexpTokenizer
from nltk.corpus import stopwords
from collections import Counter

from backend.dbmanager import DBManager


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


class WordListReader:

    def __init__(self, storage_engine: StorageEngine):
        self.db = storage_engine
        self.logger = logging.getLogger("AFP API")

    def on_post(self, req, resp):
        with self.db:
            if "bait" in req.media and "target" in req.media:
                wb_geneid_a = self.db.get_wb_geneid_from_gene_name(req.media["bait"])
                wb_geneid_b = self.db.get_wb_geneid_from_gene_name(req.media["target"])
                abstracts = self.db.get_interaction_abstracts(wb_geneid_a, wb_geneid_b)
                tokenizer = RegexpTokenizer(r'\w+')
                lemmatizer = WordNetLemmatizer()
                abs_tokens = [lemmatizer.lemmatize(word).lower() for abstract in abstracts for word in
                              tokenizer.tokenize(abstract) if word not in stop_words and len(word) > 1]
                counters = Counter(abs_tokens).most_common(
                    n=int(req.media["count"]) if "count" in req.media and int(req.media["count"]) > 0 else None)
                resp.body = '{{"counters": {}}}'.format("{" + ", ".join(["\"" + word + "\":" + str(count) for word, count in counters]) + "}")
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
    db = StorageEngine(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)
    writer = WordListReader(storage_engine=db)
    app.add_route('/api/get_words_counter_from_wb_db', writer)

    httpd = simple_server.make_server('0.0.0.0', args.port, app)
    httpd.serve_forever()


if __name__ == '__main__':
    main()
