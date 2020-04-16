from typing import List
from nltk import RegexpTokenizer, MWETokenizer, WordNetLemmatizer, Counter
from backend.api import stop_words

fixed_words = [('C.', 'elegans'), ('Caenorhabditis', 'elegans')]
EXCLUSION_LIST = {'the', 'The', 'in', 'In', 'we', 'We'}


def get_word_counts(corpus: List[str], count: int = None):
    tokenizer = RegexpTokenizer(r'[0-9a-zA-Z]+\-[0-9a-zA-Z]+|\S+')
    lemmatizer = WordNetLemmatizer()
    abs_tokens = [lemmatizer.lemmatize(word).replace('.', '').replace('\"', '').replace(',', '').replace(';', '')
                  .strip('()').replace("Caenorhabditis_elegans", "C_elegans")
                  for abstract in corpus for word in MWETokenizer(fixed_words).tokenize(tokenizer.tokenize(abstract))
                  if word not in stop_words and word not in EXCLUSION_LIST and len(word) > 1]
    return Counter(abs_tokens).most_common(n=count)
