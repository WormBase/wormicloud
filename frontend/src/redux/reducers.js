import {createReducer} from '@reduxjs/toolkit'


const initialState = {
    counters: [],
    references : [],
    isLoading: false,
    error: null
};

export const wordReducer = createReducer(initialState, {
    FETCH_WORD_COUNTERS_REQUEST: (state, action) => {state.isLoading = true},
    FETCH_WORD_COUNTERS_SUCCESS: (state, action) => {
        state.counters = Object.keys(action.payload.counters).map(
            keyword => {
                return {text: keyword, value: action.payload.counters[keyword], active: true }
            });
        state.references = action.payload.references;
        state.isLoading = false;
        state.error = null;
    },
    FETCH_WORD_COUNTERS_ERROR: (state, action) => {
        state.isLoading = false;
        state.error = action.payload.error
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