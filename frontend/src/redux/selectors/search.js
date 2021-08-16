export const getSearchState = store => store.search;

export const getKeywords = store => getSearchState(store) ? getSearchState(store).keywords : [''];
export const getLogicOp = store => getSearchState(store) ? getSearchState(store).logicOp : 'AND';
export const getGeneNamesOnly = store => getSearchState(store) ? getSearchState(store).geneNamesOnly : false;
export const getCaseSensitive = store => getSearchState(store) ? getSearchState(store).caseSensitive : false;
export const getScope = store => getSearchState(store) ? getSearchState(store).scope : 'document';
export const getYearRange = store => getSearchState(store) ? getSearchState(store).yearRange : {yearStart: '', yearEnd: ''};
export const getAuthor = store => getSearchState(store) ? getSearchState(store).author : '';
export const getMaxNumResults = store => getSearchState(store) ? getSearchState(store).maxNumResults : 200;
export const getCounterType = store => getSearchState(store) ? getSearchState(store).counterType : 'plain';
export const getClusteringOptions = store => getSearchState(store) ? getSearchState(store).clusteringOptions : {clusterWords: false, clusteringMinSim: 0.6, showBestWords: false};
export const getShowNumCuratedObjects = store => getSearchState(store) ? getSearchState(store).showNumCuratedObjects : false;



