import {createReducer} from '@reduxjs/toolkit'


const initialState = {
    counters: [],
    references : [],
    trends: {},
    isLoading: false,
    error: null
};

export const wordReducer = createReducer(initialState, {
    FETCH_WORD_COUNTERS_REQUEST: (state, action) => {state.isLoading = true},
    FETCH_WORD_COUNTERS_SUCCESS: (state, action) => {
        state.counters = action.payload.counters;
        state.references = action.payload.references;
        state.trends = action.payload.trends;
        state.isLoading = false;
        state.error = null;
    },
    FETCH_WORD_COUNTERS_ERROR: (state, action) => {
        state.isLoading = false;
        state.error = action.payload.error
    },
    DISMISS_ERROR: (state, action) => {
        state.error = null
    },
    TOGGLE_WORD: (state, action) => {
        state.counters.every(c => {
            if (c.keyword === action.payload.keyword) {
                c.active = !c.active;
                return false
            } else {
                return true
            }
        })
    },
    RESET_CLOUD: (state, action) => {
        state.counters = [];
        state.references = [];
    }
});