import argparse
import logging

from wordcloud import WordCloud
import matplotlib.pyplot as plt
from backend.dbmanager import DBManager

logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="Find new documents in WormBase collection and pre-populate data "
                                                 "structures for Author First Pass")
    parser.add_argument("-b", "--bait", metavar="bait", dest="bait", type=str)
    parser.add_argument("-t", "--target", metavar="target", dest="target", type=str)
    parser.add_argument("-N", "--db-name", metavar="db_name", dest="db_name", type=str)
    parser.add_argument("-U", "--db-user", metavar="db_user", dest="db_user", type=str)
    parser.add_argument("-P", "--db-password", metavar="db_password", dest="db_password", type=str, default="")
    parser.add_argument("-H", "--db-host", metavar="db_host", dest="db_host", type=str)
    parser.add_argument("-l", "--log-file", metavar="log_file", dest="log_file", type=str, default=None,
                        help="path to the log file to generate. Default ./afp_pipeline.log")
    parser.add_argument("-L", "--log-level", dest="log_level", choices=['DEBUG', 'INFO', 'WARNING', 'ERROR',
                                                                        'CRITICAL'], default="INFO",
                        help="set the logging level")
    args = parser.parse_args()
    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')

    db_manager = DBManager(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)

    wb_geneid_a = db_manager.get_wb_geneid_from_gene_name(args.bait)
    wb_geneid_b = db_manager.get_wb_geneid_from_gene_name(args.target)
    abstracts = db_manager.get_interaction_abstracts(wb_geneid_a, wb_geneid_b)

    abs_words = " ".join([word.lower() for abstract in abstracts for word in abstract])
    wordcloud = WordCloud(width=800, height=800,
                          background_color='white',
                          min_font_size=10).generate(abs_words)
    plt.figure(figsize=(8, 8), facecolor=None)
    plt.imshow(wordcloud)
    plt.axis("off")
    plt.tight_layout(pad=0)
    plt.show()


if __name__ == '__main__':
    main()
