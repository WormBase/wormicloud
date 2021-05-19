import React from 'react';
import 'video-react/dist/video-react.css';
import TitleBar from "./TitleBar";
import SearchCloudTrends from "./SearchCloudTrends";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import ChangeLog from "./ChangeLog";

const Main = () => {

    return(
        <Router>
            <TitleBar/>
            <Switch>
                <Route exact path="/">
                    <SearchCloudTrends/>
                </Route>
                <Route path="/changelog">
                    <ChangeLog />
                </Route>
            </Switch>
        </Router>

    );
}

export default Main;