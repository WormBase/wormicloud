import json
import logging
import os
import ssl
import urllib.request
from typing import List

logger = logging.getLogger(__name__)


class TPCManager(object):
    def __init__(self, textpresso_api_token):
        self.textpresso_api_token = textpresso_api_token
        self.tpc_api_endpoint = "https://textpressocentral.org:18080/v1/textpresso/api/search_documents"
        if not os.environ.get('PYTHONHTTPSVERIFY', '') and getattr(ssl, '_create_unverified_context', None):
            ssl._create_default_https_context = ssl._create_unverified_context

    def get_abstracts(self, keywords: List[str]):
        """get the abstracts of all papers that match **all** the specified keywords

        Args:
            keywords (List[str]): list of keywords to search
        Returns:
            List[str]: the list of abstracts
        """
        data = json.dumps({"token": self.textpresso_api_token, "query": {
            "keywords": " AND ".join(keywords), "type": "document", "case_sensitive": True, "corpora": ["C. elegans"]},
                           "include_fulltext": True, "count": 200})
        data = data.encode('utf-8')
        req = urllib.request.Request(self.tpc_api_endpoint, data, headers={'Content-type': 'application/json',
                                                                           'Accept': 'application/json'})
        logger.debug("Sending request to Textpresso Central API")
        res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
        return [paper["abstract"] for paper in res] if res and res != 'null' else []
