import logging
from typing import List

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
                         "FULL OUTER JOIN gin_seqname ON gin_locus.joinkey = gin_seqname.joinkey "
                         "WHERE gin_locus.gin_locus = '{}' OR gin_synonyms.gin_synonyms = '{}' "
                         "OR gin_seqname.gin_seqname = '{}'".format(
            gene_name, gene_name, gene_name))
        row = self.cur.fetchone()
        if row:
            return "WBGene" + row[0]
        else:
            return None

    def get_gene_name_id_map(self, gene_names: List[str]):
        self.cur.execute("SELECT gin_locus.joinkey, gin_locus.gin_locus, gin_synonyms.gin_synonyms, "
                         "gin_seqname.gin_seqname FROM gin_locus "
                         "FULL OUTER JOIN gin_synonyms ON gin_locus.joinkey = gin_synonyms.joinkey "
                         "FULL OUTER JOIN gin_seqname ON gin_locus.joinkey = gin_seqname.joinkey "
                         "WHERE gin_locus.gin_locus IN %(gene_names)s OR gin_synonyms.gin_synonyms IN %(gene_names)s "
                         "OR gin_seqname.gin_seqname IN %(gene_names)s", {'gene_names': tuple(gene_names)})
        gene_name_id = {}
        for row in self.cur.fetchall():
            for gene_name in (row[1], row[2], row[3]):
                if gene_name and row[0] and gene_name in gene_names:
                    if gene_name not in gene_name_id:
                        gene_name_id[gene_name] = "WBGene" + row[0]
        return gene_name_id
