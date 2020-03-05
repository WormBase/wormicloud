import { createStore, applyMiddleware } from "redux";
import thunk from 'redux-thunk';
import {wordReducer} from "./reducers";

let store = createStore(wordReducer, applyMiddleware(thunk));

export default store;