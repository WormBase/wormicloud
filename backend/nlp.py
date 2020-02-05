from typing import List
from nltk import RegexpTokenizer, WordNetLemmatizer, Counter
from backend.api import stop_words


def get_word_counts(corpus: List[str], count: int = None):
    tokenizer = RegexpTokenizer(r'\w+')
    lemmatizer = WordNetLemmatizer()
    abs_tokens = [lemmatizer.lemmatize(word).lower() for abstract in corpus for word in tokenizer.tokenize(abstract)
                  if word not in stop_words and len(word) > 1]
    return Counter(abs_tokens).most_common(n=count)
