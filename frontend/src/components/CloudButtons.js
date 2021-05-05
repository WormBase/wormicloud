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
        <div>
            {props.counters.length > 0 ?
                <Button size="sm" variant="outline-primary" onClick={() => {
                    props.setRedraw();
                }}>Redraw cloud</Button> : ''}&nbsp;
            {props.counters.length > 0 ?
                <Button size="sm" variant="outline-primary" onClick={() => {
                    downloadFile(props.counters.sort((a, b) => (a.value > b.value) ? -1 : 1)
                        .map((c) => props.geneNamesOnly ? '"' + c.text + '",' + c.value + ',"' + props.descriptions[c.text] + '"' : '"' + c.text + '",' + c.value).join('\n'), "counters", "text/plain", "csv").then(r => {
                    });
                }}>Download counters</Button> : ''}&nbsp;
            {props.counters.length > 0 ?
                <Button size="sm" variant="outline-primary" onClick={() => {
                    exportComponentAsJPEG(props.myRef, 'wormicloud.jpg', '#FFFFFF')
                }}>Export JPEG</Button> : ''}&nbsp;
            {props.counters.length > 0 && props.geneNamesOnly ?
                <Button size="sm" variant="outline-primary" onClick={() => {
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
                    geneListInput.value = props.counters.map(c => c.text).join('\n');
                    form.appendChild(geneListInput);

                    const submitInput = document.createElement('input');
                    submitInput.setAttribute('name', 'action');
                    submitInput.setAttribute('type', 'submit');
                    form.appendChild(submitInput);

                    document.body.appendChild(form);
                    submitInput.click();
                    document.body.removeChild(form);
                }}>SimpleMine</Button> : ''}&nbsp;
            {props.counters.length > 0 && props.geneNamesOnly ?
                <Button size="sm" variant="outline-primary" onClick={() => {
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
                    geneListInput.value = props.counters.map(c => c.text).join(' ');
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
                }}>Gene Set Enrichment tool</Button> : ''}&nbsp;
            {props.counters.length > 0 && props.geneNamesOnly ?
                <Button size="sm" variant="outline-primary" onClick={() => {
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
                    geneListInput.value = props.counters.map(c => c.text).sort().join('\n');
                    form.appendChild(geneListInput);

                    const submitInput = document.createElement('input');
                    submitInput.setAttribute('name', 'action');
                    submitInput.setAttribute('type', 'submit');
                    form.appendChild(submitInput);

                    document.body.appendChild(form);
                    submitInput.click();
                    document.body.removeChild(form);
                }}>Gene name sanitizer</Button> : ''}
        </div>
    );
}

const mapStateToProps = state => ({
    redraw: getRedraw(state),
    counters: getCounters(state),
    geneNamesOnly: getGeneNamesOnly(state),
    descriptions: getDescriptions(state)
});

export default connect(mapStateToProps, {setRedraw})(CloudButtons);