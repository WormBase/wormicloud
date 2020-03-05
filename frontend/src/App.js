import React from 'react';
import Main from "./pages/Main";
import store from "./redux/store";
import {Provider} from "react-redux";


function App() {
  return (
      <Provider store={store}>
          <Main />
      </Provider>
  );
}

export default App;
