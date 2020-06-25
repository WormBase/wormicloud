import os
from typing import List
from nltk import RegexpTokenizer, WordNetLemmatizer, Counter
import yaml
import nltk
from nltk.corpus import stopwords
from dateutil import parser

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
    abs_tokens = [abs_token for abs_token in abs_tokens if len(abs_token) > 1 and abs_token not in EXCLUSION_LIST and
                  (not gene_only or abs_token not in GENE_EXCLUSION_LIST)]
    return Counter(abs_tokens).most_common(n=count)


def get_year_from_date(datestring):
    if datestring:
        try:
            return parser.parse(datestring).year
        except ValueError:
            pass
    return 0
