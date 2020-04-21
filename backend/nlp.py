import os
from typing import List
from nltk import RegexpTokenizer, MWETokenizer, WordNetLemmatizer, Counter
from backend.api import stop_words
import yaml


with open(os.path.join(os.getcwd(), "backend", "config.yml"), 'r') as stream:
    try:
        EXCLUSION_LIST = yaml.safe_load(stream)["exclusion_list"]
        EXCLUSION_LIST.extend([word.capitalize() for word in EXCLUSION_LIST])
    except yaml.YAMLError as exc:
        print(exc)


def get_word_counts(corpus: List[str], count: int = None):
    tokenizer = RegexpTokenizer(r'[0-9a-zA-Z]+\-[0-9a-zA-Z]+|\S+')
    lemmatizer = WordNetLemmatizer()
    abs_tokens = [lemmatizer.lemmatize(word).replace('.', '').replace('\"', '').replace(',', '').replace(';', '')
                  .strip('()')
                  for abstract in corpus for word in tokenizer.tokenize(abstract)
                  if word not in stop_words and word not in EXCLUSION_LIST and len(word) > 1]
    abs_tokens = [abs_token for abs_token in abs_tokens if len(abs_token) > 1 and abs_token not in EXCLUSION_LIST]
    return Counter(abs_tokens).most_common(n=count)
