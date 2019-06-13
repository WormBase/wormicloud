import logging

import psycopg2 as psycopg2

logger = logging.getLogger(__name__)


class DBManager(object):

    def __init__(self, dbname, user, password, host):
        connection_str = "dbname='" + dbname
        if user:
            connection_str += "' user='" + user
        if password:
            connection_str += "' password='" + password
        connection_str += "' host='" + host + "'"
        self.conn = psycopg2.connect(connection_str)
        self.cur = self.conn.cursor()

    def close(self):
        self.conn.commit()
        self.cur.close()
        self.conn.close()

    def get_interaction_abstracts(self, wb_geneid_a, wb_geneid_b):
        self.cur.execute("SELECT int_paper.int_paper FROM int_paper "
                         "JOIN int_genebait ON int_paper.joinkey = int_genebait.joinkey "
                         "JOIN int_genetarget ON int_paper.joinkey = int_genetarget.joinkey "
                         "WHERE int_genebait.int_genebait = '{}' AND int_genetarget.int_genetarget = '\"{}\"'".format(
            wb_geneid_a, wb_geneid_b))
        rows = self.cur.fetchall()
        ids = set([row[0][7:] for row in rows])
        self.cur.execute("SELECT pap_abstract from pap_abstract WHERE pap_abstract.joinkey IN ('{}')".format(
            "','".join(ids)))
        rows = self.cur.fetchall()
        abstracts = [row[0] for row in rows]
        return abstracts

    def get_wb_geneid_from_gene_name(self, gene_name):
        self.cur.execute("SELECT gin_locus.joinkey FROM gin_locus "
                         "FULL OUTER JOIN gin_synonyms ON gin_locus.joinkey = gin_synonyms.joinkey "
                         "WHERE gin_locus.gin_locus = '{}' OR gin_synonyms.gin_synonyms = '{}'".format(
            gene_name, gene_name))
        row = self.cur.fetchone()
        if row:
            return "WBGene" + row[0]
        else:
            return None
