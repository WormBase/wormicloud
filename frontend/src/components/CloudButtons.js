import React from 'react';
import {downloadFile} from "../lib/file";
import {exportComponentAsJPEG} from "react-component-export-image";
import Button from "react-bootstrap/Button";
import {getGeneNamesOnly} from "../redux/selectors/search";
import {connect} from "react-redux";
import {setRedraw} from "../redux/actions/cloud";
import {getCounters, getDescriptions, getRedraw} from "../redux/selectors/cloud";
import PropTypes from "prop-types";

const CloudButtons = ({counters, geneNamesOnly, descriptions, myRef}) => {
    return (
        <div>
            {counters.length > 0 ?
                <><Button size="sm" variant="outline-primary" onClick={() => {
                    setRedraw();
                }}>Redraw cloud</Button>&nbsp;</> : ''}
            {counters.length > 0 ?
                <><Button size="sm" variant="outline-primary" onClick={() => {
                    downloadFile(counters.sort((a, b) => (a.value > b.value) ? -1 : 1)
                        .map((c) => geneNamesOnly ? '"' + c.text + '",' + c.value + ',"' + descriptions[c.text] + '"' : '"' + c.text + '",' + c.value).join('\n'), "counters", "text/plain", "csv").then(r => {
                    });
                }}>Download counters</Button>&nbsp;</> : ''}
            {counters.length > 0 ?
                <><Button size="sm" variant="outline-primary" onClick={() => {
                    exportComponentAsJPEG(myRef, 'wormicloud.jpg', '#FFFFFF')
                }}>Export JPEG</Button>&nbsp;</> : ''}
            {counters.length > 0 && geneNamesOnly ?
                <><Button size="sm" variant="outline-primary" onClick={() => {
                    const form = document.createElement('form');
                    form.setAttribute('method', 'post');
                    form.setAttribute(
                        'action',
                        'https://wormbase.org/tools/mine/simplemine.cgi'
                    );
                    form.setAttribute('target', '_blank');
                    form.setAttribute('enctype', 'multipart/form-data');

                    const geneListInput = document.createElement('textarea');
                    geneListInput.setAttribute('type', 'hidden');
                    geneListInput.setAttribute('name', 'geneInput');
                    geneListInput.value = counters.map(c => c.text).join('\n');
                    form.appendChild(geneListInput);

                    const submitInput = document.createElement('input');
                    submitInput.setAttribute('name', 'action');
                    submitInput.setAttribute('type', 'submit');
                    form.appendChild(submitInput);

                    document.body.appendChild(form);
                    submitInput.click();
                    document.body.removeChild(form);
                }}>SimpleMine</Button>&nbsp;</> : ''}
            {counters.length > 0 && geneNamesOnly ?
                <><Button size="sm" variant="outline-primary" onClick={() => {
                    const form = document.createElement('form');
                    form.setAttribute('method', 'post');
                    form.setAttribute(
                        'action',
                        'https://wormbase.org/tools/enrichment/tea/tea.cgi'
                    );
                    form.setAttribute('target', '_blank');
                    form.setAttribute('enctype', 'multipart/form-data');

                    const geneListInput = document.createElement('textarea');
                    geneListInput.setAttribute('type', 'hidden');
                    geneListInput.setAttribute('name', 'genelist');
                    geneListInput.value = counters.map(c => c.text).join(' ');
                    form.appendChild(geneListInput);

                    const qvalueThresholdInput = document.createElement('input');
                    qvalueThresholdInput.setAttribute('type', 'hidden');
                    qvalueThresholdInput.setAttribute('name', 'qvalueThreshold');
                    qvalueThresholdInput.setAttribute('value', '0.1');
                    qvalueThresholdInput.id = 'qvalueThreshold';
                    form.appendChild(qvalueThresholdInput);

                    const submitInput = document.createElement('input');
                    submitInput.setAttribute('name', 'action');
                    submitInput.setAttribute('type', 'submit');
                    submitInput.setAttribute('value', 'Analyze List');
                    form.appendChild(submitInput);

                    document.body.appendChild(form);
                    submitInput.click();
                    document.body.removeChild(form);
                }}>Gene Set Enrichment tool</Button>&nbsp;</> : ''}
            {counters.length > 0 && geneNamesOnly ?
                <><Button size="sm" variant="outline-primary" onClick={() => {
                    const form = document.createElement('form');
                    form.setAttribute('method', 'post');
                    form.setAttribute(
                        'action',
                        'https://wormbase.org/tools/mine/gene_sanitizer.cgi'
                    );
                    form.setAttribute('target', '_blank');
                    form.setAttribute('enctype', 'multipart/form-data');

                    const geneListInput = document.createElement('textarea');
                    geneListInput.setAttribute('type', 'hidden');
                    geneListInput.setAttribute('name', 'geneInput');
                    geneListInput.value = counters.map(c => c.text).sort().join('\n');
                    form.appendChild(geneListInput);

                    const submitInput = document.createElement('input');
                    submitInput.setAttribute('name', 'action');
                    submitInput.setAttribute('type', 'submit');
                    form.appendChild(submitInput);

                    document.body.appendChild(form);
                    submitInput.click();
                    document.body.removeChild(form);

                }}>Gene name sanitizer</Button>&nbsp;</> : ''}
            {!geneNamesOnly && counters.length > 0 && counters.reduce((sum, curCounter) => sum + curCounter.cluster, 0) !== ((counters.length - 1) * counters.length / 2) ?
                <Button size="sm" variant="outline-primary" onClick={() => {
                    downloadFile("WORD, CLUSTER\n" + counters.map((c) => '"' + c.text + '",' + c.cluster + 1).join('\n'), "clustering_info", "text/plain", "csv").then(r => {
                    });
                }}>Download clustering info</Button> : null}
        </div>
    );
}

const mapStateToProps = state => ({
    redraw: getRedraw(state),
    counters: getCounters(state),
    geneNamesOnly: getGeneNamesOnly(state),
    descriptions: getDescriptions(state)
});

CloudButtons.propType = {
    counters: PropTypes.array,
    geneNamesOnly: PropTypes.bool,
    descriptions: PropTypes.object,
    myRef: PropTypes.any
}



export default connect(mapStateToProps, {setRedraw})(CloudButtons);