import axios from 'axios';

export const FETCH_WORD_COUNTERS_REQUEST = "FETCH_WORD_COUNTERS_REQUEST";
export const FETCH_WORD_COUNTERS_SUCCESS = "FETCH_WORD_COUNTERS_SUCCESS";
export const FETCH_WORD_COUNTERS_ERROR = "FETCH_WORD_COUNTERS_ERROR";
export const TOGGLE_WORD = "TOGGLE_WORD";
export const RESET_CLOUD ="RESET_CLOUD";
export const DISMISS_ERROR = "DISMISS_ERROR";

export const fetchWordCounters = (keywords, caseSensitive, years, genesOnly, logicOp, author, maxResults, weightedScore,
                                  searchType) => {
    return dispatch => {
        dispatch(fetchWordCountersRequest());
        keywords = keywords.map(k => {return '"' + k + '"'});
        let yearsFix = years.map(y => {
            if (y !== '') {
                return y + '*';
            } else {
                return y;
            }
        });
        let apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
        axios
          .post(apiEndpoint, {keywords: keywords, caseSensitive: caseSensitive, years: yearsFix, genesOnly: genesOnly,
              logicOp: logicOp, author: author, maxResults: maxResults, weightedScore: weightedScore, searchType: searchType})
          .then(res => {
              if (res.data.counters && res.data.references && Object.keys(res.data.counters).length !== 0 && res.data.trends) {
                  let i = 1;
                  res.data.references.forEach(r => r.index = i++);
                  res.data.counters = Object.keys(res.data.counters).map(
                      keyword => {
                          return {text: keyword, value: res.data.counters[keyword], active: true }
                      });
                  dispatch(fetchWordCountersSuccess(res.data.counters, res.data.references, res.data.trends, res.data.descriptions));
              }
              else {
                  dispatch(fetchWordCountersError('No data found for the specified keywords'));
              }
          })
          .catch(err => {
            dispatch(fetchWordCountersError(err.message));
          });
    };
};

export const fetchWordCountersRequest = () => ({
   type: FETCH_WORD_COUNTERS_REQUEST,
});

export const fetchWordCountersSuccess = (counters, references, trends, descriptions) => ({
    type: FETCH_WORD_COUNTERS_SUCCESS,
    payload: { counters: counters, references: references, trends: trends, descriptions: descriptions }
});

export const fetchWordCountersError = error => ({
    type: FETCH_WORD_COUNTERS_ERROR,
    payload: { error }
});


export const toggleWord = word => ({
   type: TOGGLE_WORD,
   payload: { word }
});

export const resetCloud = () => ({
    type: RESET_CLOUD
});

export const dismissError = () => ({
    type: DISMISS_ERROR
});