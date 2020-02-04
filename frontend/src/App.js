import React from 'react';
import Selection from "./pages/Selection";
import {BrowserRouter as Router} from "react-router-dom";
import Route from "react-router-dom/es/Route";
import Cloud from "./pages/Cloud";
import Redirect from "react-router-dom/es/Redirect";


function App() {
  return (
      <Router>
          <Route exact path="/" render={() => (<Redirect to={"/selection"}/>)}/>
          <Route path="/selection" component={Selection} />
          <Route path="/cloud/:gene1/:gene2" component={Cloud} />
      </Router>
  );
}

export default App;
