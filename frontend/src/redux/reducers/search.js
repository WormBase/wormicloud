import {createReducer} from '@reduxjs/toolkit'

const initialState = {
    keywords: [''],
    logicOp: 'AND',
    geneNamesOnly: false,
    caseSensitive: true,
    scope: 'document',
    yearRange: {
        yearStart: '',
        yearEnd: ''
    },
    author: '',
    maxNumResults: 200,
    counterType: 'plain',
    clusteringOptions: {
        clusterWords: false,
        clusteringMinSim: 0.6,
        showBestWords: false
    }

};

export default createReducer(initialState, {
    SET_KEYWORDS: (state, action) => {state.keywords = action.payload.keywords},
    SET_LOGIC_OP: (state, action) => {state.logicOp = action.payload.logicOp},
    SET_GENE_NAMES_ONLY: (state, action) => {state.geneNamesOnly = action.payload.geneNamesOnly},
    SET_CASE_SENSITIVE: (state, action) => {state.caseSensitive = action.payload.caseSensitive},
    SET_SCOPE: (state, action) => {state.scope = action.payload.scope},
    SET_YEAR_RANGE: (state, action) => {state.yearRange = {
        yearStart: action.payload.yearStart,
        yearEnd: action.payload.yearEnd
    }},
    SET_AUTHOR: (state, action) => {state.author = action.payload.author},
    SET_MAX_NUM_RESULTS: (state, action) => {state.maxNumResults = action.payload.maxNumResults},
    SET_COUNTER_TYPE: (state, action) => {state.counterType = action.payload.counterType},
    SET_CLUSTERING_OPTIONS: (state, action) => {
        state.clusteringOptions = {
            clusterWords: action.payload.clusterWords,
            clusteringMinSim: action.payload.minSim,
            showBestWords: action.payload.showBestWords
        }
    },
});