import React from 'react';
import Main from "./pages/Main";
import store from "./redux/store";
import {Provider} from "react-redux";
import {BrowserRouter as Router} from "react-router-dom";


function App() {
  return (
      <Provider store={store}>
          <Router>
              <Main />
          </Router>
      </Provider>
  );
}

export default App;
