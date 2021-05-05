import itertools
import os
from typing import List

from networkx.algorithms.community import greedy_modularity_communities
from nltk import RegexpTokenizer, WordNetLemmatizer, Counter
import yaml
import nltk
from nltk.corpus import stopwords
from dateutil import parser
import networkx as nx

nltk.download('wordnet')
nltk.download('stopwords')
stop_words = set(stopwords.words('english'))


with open(os.path.join(os.getcwd(), "backend", "config.yml"), 'r') as stream:
    try:
        config = yaml.safe_load(stream)
        EXCLUSION_LIST = config["exclusion_list"]
        EXCLUSION_LIST.extend([word.capitalize() for word in EXCLUSION_LIST])
        GENE_EXCLUSION_LIST = config["gene_exclusion_list"]
        GENE_EXCLUSION_LIST.extend([word.capitalize() for word in GENE_EXCLUSION_LIST])
        GENE_EXCLUSION_LIST.extend([word.upper() for word in GENE_EXCLUSION_LIST])
    except yaml.YAMLError as exc:
        print(exc)


def get_word_counts(corpus: List[str], count: int = None, gene_only: bool = False):
    tokenizer = RegexpTokenizer(r'[0-9a-zA-Z]+\-[0-9a-zA-Z]+|\S+')
    lemmatizer = WordNetLemmatizer()
    abs_tokens = [lemmatizer.lemmatize(word).replace('.', '').replace('\"', '').replace(',', '').replace(';', '')
                  .strip('()').strip('\'')
                  for abstract in corpus for word in tokenizer.tokenize(abstract)
                  if word not in stop_words and word not in EXCLUSION_LIST and len(word) > 1 and
                  (not gene_only or word not in GENE_EXCLUSION_LIST)]
    abs_tokens = [abs_token for abs_token in abs_tokens if len(abs_token) > 1 and abs_token not in
                  EXCLUSION_LIST and (not gene_only or abs_token not in GENE_EXCLUSION_LIST)]
    return Counter(abs_tokens).most_common(n=count)


def get_year_from_date(datestring):
    if datestring:
        try:
            return parser.parse(datestring).year
        except ValueError:
            pass
    return 0


def cluster_words_by_similarity(model, counter_map, min_sim: float = 0.5):
    words = [word for word, count in counter_map.items()][0:500]
    graph = nx.Graph()
    for word in words:
        graph.add_node(word)
    for word_pair in itertools.combinations(words, 2):
        if word_pair[0] in model and word_pair[1] in model:
            sim = get_word_similarity(model, word_pair[0], word_pair[1])
            if sim > min_sim:
                graph.add_edge(word_pair[0], word_pair[1], weight=sim)
    g_distance_dict = {(e1, e2): 1 / weight for e1, e2, weight in graph.edges(data='weight')}
    nx.set_edge_attributes(graph, g_distance_dict, 'distance')
    comm_structure = greedy_modularity_communities(graph, weight="weight")
    cluster_counter_map = {}
    for subgraph_comm in comm_structure:
        node_highest_count = sorted([(node, counter_map[node]) for node in subgraph_comm], key=lambda x: x[1])[-1]
        cluster_counter_map[node_highest_count[0]] = node_highest_count[1]
    return cluster_counter_map

    return None


def get_word_similarity(model, word1, word2):
    return model.similarity(word1, word2)
