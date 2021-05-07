export const SET_KEYWORDS = "SET_KEYWORDS";
export const SET_LOGIC_OP = "SET_LOGIC_OP";
export const SET_GENE_NAMES_ONLY = "SET_GENE_NAMES_ONLY";
export const SET_CASE_SENSITIVE = "SET_CASE_SENSITIVE";
export const SET_SCOPE = "SET_SCOPE";
export const SET_YEAR_RANGE = "SET_YEAR_RANGE";
export const SET_AUTHOR = "SET_AUTHOR";
export const SET_MAX_NUM_RESULTS = "SET_MAX_NUM_RESULTS";
export const SET_COUNTER_TYPE = "SET_COUNTER_TYPE";
export const SET_CLUSTERING_OPTIONS = "SET_CLUSTERING_OPTIONS";

export const setKeywords = keywords => ({
    type: SET_KEYWORDS,
    payload: {
        keywords: keywords
    }
});

export const setLogicOp = logicOp => ({
    type: SET_LOGIC_OP,
    payload: {
        logicOp: logicOp
    }
});

export const setGeneNamesOnly = geneNamesOnly => ({
    type: SET_GENE_NAMES_ONLY,
    payload: {
        geneNamesOnly: geneNamesOnly
    }
});

export const setCaseSensitive = caseSensitive => ({
    type: SET_CASE_SENSITIVE,
    payload: {
        caseSensitive: caseSensitive
    }
});

export const setScope = scope => ({
    type: SET_SCOPE,
    payload: {
        scope: scope
    }
});

export const setYearRange = (yearStart, yearEnd) => ({
    type: SET_YEAR_RANGE,
    payload: {
        yearStart: yearStart,
        yearEnd: yearEnd
    }
});

export const setAuthor = author => ({
    type: SET_AUTHOR,
    payload: {
        author: author
    }
});

export const setMaxNumResults = maxNumResults => ({
    type: SET_MAX_NUM_RESULTS,
    payload: {
        maxNumResults: maxNumResults
    }
});

export const setCounterType = counterType => ({
    type: SET_COUNTER_TYPE,
    payload: {
        counterType: counterType
    }
});

export const setClusteringOptions = (clusterWords, minSim, showBestWords) => ({
    type: SET_CLUSTERING_OPTIONS,
    payload: {
        clusterWords: clusterWords,
        minSim: minSim,
        showBestWords: showBestWords
    }
});





