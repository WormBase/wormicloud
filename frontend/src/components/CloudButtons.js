import React from 'react';
import {downloadFile} from "../lib/file";
import {exportComponentAsJPEG} from "react-component-export-image";
import Button from "react-bootstrap/Button";
import {getGeneNamesOnly, getRedraw} from "../redux/selectors/search";
import {connect} from "react-redux";
import {setRedraw} from "../redux/actions/cloud";
import {getCounters, getDescriptions} from "../redux/selectors/cloud";

const CloudButtons = (props) => {
    return (
        ''
    );
}

const mapStateToProps = state => ({
    redraw: getRedraw(state),
    counters: getCounters(state),
    geneNamesOnly: getGeneNamesOnly(state),
    descriptions: getDescriptions(state)
});

export default connect(mapStateToProps, {setRedraw})(CloudButtons);