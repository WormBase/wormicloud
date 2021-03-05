import json
import logging
import math
import os
import re
import ssl
import urllib.request

from typing import List
from backend.nlp import get_year_from_date

logger = logging.getLogger(__name__)


class TPCManager(object):
    def __init__(self, textpresso_api_token):
        self.textpresso_api_token = textpresso_api_token
        self.tpc_api_endpoint = "http://textpressocentral.org:9001/v1/textpresso/api/search_documents"
        self.tpc_category_matches_endpoint = "http://textpressocentral.org:9001/v1/textpresso/api/get_category_matches_document_fulltext"
        if not os.environ.get('PYTHONHTTPSVERIFY', '') and getattr(ssl, '_create_unverified_context', None):
            ssl._create_default_https_context = ssl._create_unverified_context

    @staticmethod
    def remove_bad_chars(string):
        return string.replace('\'', '').replace('\"', '').replace('\\', '').replace('\\', '')

    @staticmethod
    def get_abstracts(papers: List):
        """get the abstracts from the provided list of papers and the respective years of publication

        Args:
            papers (List[str]): list of papers
        Returns:
            List[Tuple[str, int]]: the list of abstracts
        """
        return [(paper["abstract"], get_year_from_date(paper["year"]), paper["score"]) for paper in papers] \
            if papers and papers != 'null' else []

    @staticmethod
    def get_references(papers: List):
        """get the references from the provided list of papers

        Args:
            papers (List[str]): list of papers
        Returns:
            List[str]: the list of references
        """
        return [(paper["identifier"].split("/")[1], TPCManager.remove_bad_chars(paper["title"]),
                 TPCManager.remove_bad_chars(paper["journal"]), TPCManager.remove_bad_chars(paper["year"]),
                 re.search(r'.* PMID:([0-9]+) .*', paper["accession"]).group(1) if "PMID:" in paper["accession"] else
                "", TPCManager.remove_bad_chars(paper["author"])) for paper in papers] if papers and papers != 'null' else []

    def get_papers(self, keywords: List[str], case_sensitive: bool = True, year: str = '', logic_op: str = 'AND',
                   author: str = '', max_results: int = 200):
        """get all papers that match **all** the specified keywords

        Args:
            keywords (List[str]): list of keywords to search
            case_sensitive (bool): case sensitive search
            year (str): limit search to specific year
            logic_op (bool): logic operator used to combine keywords
            author (str): author name to search
            max_results (int): maximum number of results to be returned
        Returns:
            List[List[str]]: the list of papers
        """
        query = {
            "type": "document",
            "case_sensitive": case_sensitive,
            "corpora": ["C. elegans and Suppl"]
        }
        if keywords:
            query["keywords"] = (" " + logic_op + " ").join(keywords)
        if author != '':
            query["author"] = author
        if year != '':
            query["year"] = year
        papers = []
        for i in range(math.ceil(max_results / 200)):
            data = json.dumps({"token": self.textpresso_api_token, "query": query, "include_fulltext": True,
                               "count": 200, "since_num": 200 * i})
            data = data.encode('utf-8')
            req = urllib.request.Request(self.tpc_api_endpoint, data, headers={'Content-type': 'application/json',
                                                                               'Accept': 'application/json'})
            logger.debug("Sending request to Textpresso Central API")
            results = json.loads(urllib.request.urlopen(req).read().decode('latin1'))
            if results:
                papers.extend(results)
            if not results or len(results) < 200:
                break
        return papers

    def get_category_matches(self, keywords: List[str], case_sensitive: bool = True, year: str = '',
                             category: str = '', author: str = '', logic_op: str = 'AND', max_results: int = 200,
                             lower: bool = False):
        query = {
            "type": "document",
            "case_sensitive": case_sensitive,
            "corpora": ["C. elegans and Suppl"]
        }
        if keywords:
            query["keywords"] = (" " + logic_op + " ").join(keywords)
        if author != '':
            query["author"] = author
        if year != '':
            query["year"] = year
        results = []
        for i in range(math.ceil(max_results / 200)):
            data = json.dumps({"token": self.textpresso_api_token, "query": query, "category": category, "count": 200})
            data = data.encode('utf-8')
            req = urllib.request.Request(self.tpc_category_matches_endpoint, data,
                                         headers={'Content-type': 'application/json', 'Accept': 'application/json'})
            logger.debug("Sending request to Textpresso Central API")
            res = json.loads(urllib.request.urlopen(req).read().decode('latin1'))
            if lower:
                for idx, p in enumerate(res):
                    if 'matches' in p:
                        res[idx]['matches'] = [w.lower() for w in p['matches']]
            if res:
                results.extend(res)
            if not res or len(res) < 200:
                break
        return results

