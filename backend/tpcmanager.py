import json
import logging
import os
import re
import ssl
import urllib.request
from typing import List

logger = logging.getLogger(__name__)


class TPCManager(object):
    def __init__(self, textpresso_api_token):
        self.textpresso_api_token = textpresso_api_token
        self.tpc_api_endpoint = "https://textpressocentral.org:18080/v1/textpresso/api/search_documents"
        self.tpc_category_matches_endpoint = "https://textpressocentral.org:18080/v1/textpresso/api/get_category_matches_document_fulltext"
        if not os.environ.get('PYTHONHTTPSVERIFY', '') and getattr(ssl, '_create_unverified_context', None):
            ssl._create_default_https_context = ssl._create_unverified_context

    @staticmethod
    def get_abstracts(papers: List):
        """get the abstracts from the provided list of papers

        Args:
            papers (List[str]): list of papers
        Returns:
            List[str]: the list of abstracts
        """
        return [paper["abstract"] for paper in papers] if papers and papers != 'null' else []

    @staticmethod
    def get_references(papers: List):
        """get the references from the provided list of papers

        Args:
            papers (List[str]): list of papers
        Returns:
            List[str]: the list of references
        """
        return [(paper["identifier"].split("/")[1], paper["title"].replace('\'', '').replace('\"', '')
                 .replace('\\', ''), paper["journal"], paper["year"],
                 re.search(r'.* (PMID:[0-9]+) .*', paper["accession"]).group(1) if "PMID:" in paper["accession"] else
                "PMID:") for paper in papers] if papers and papers != 'null' else []

    def get_papers(self, keywords: List[str], case_sensitive: bool = True, year: str = '', logic_op: str = 'AND'):
        """get all papers that match **all** the specified keywords

        Args:
            keywords (List[str]): list of keywords to search
            case_sensitive (bool): case sensitive search
            year (str): limit search to specific year
            logic_op (bool): logic operator used to combine keywords
        Returns:
            List[str]: the list of papers
        """
        query = {
            "keywords": (" " + logic_op + " ").join(keywords),
            "type": "document",
            "case_sensitive": case_sensitive,
            "corpora": ["C. elegans"]
        }
        if year != '':
            query["year"] = year
        data = json.dumps({"token": self.textpresso_api_token, "query": query, "include_fulltext": True, "count": 200})
        data = data.encode('utf-8')
        req = urllib.request.Request(self.tpc_api_endpoint, data, headers={'Content-type': 'application/json',
                                                                           'Accept': 'application/json'})
        logger.debug("Sending request to Textpresso Central API")
        return json.loads(urllib.request.urlopen(req).read().decode('utf-8'))

    def get_category_matches(self, keywords: List[str], caseSensitive: bool = True, year: str = '', category: str = ''):
        query = {
            "keywords": " AND ".join(keywords),
            "type": "document",
            "case_sensitive": caseSensitive,
            "corpora": ["C. elegans"]
        }
        if year != '':
            query["year"] = year
        data = json.dumps({"token": self.textpresso_api_token, "query": query, "category": category})
        data = data.encode('utf-8')
        req = urllib.request.Request(self.tpc_category_matches_endpoint, data,
                                     headers={'Content-type': 'application/json', 'Accept': 'application/json'})
        logger.debug("Sending request to Textpresso Central API")
        return json.loads(urllib.request.urlopen(req).read().decode('utf-8'))

