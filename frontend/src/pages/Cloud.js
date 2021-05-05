import React, {createRef, useEffect, useRef, useState} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ReactWordcloud from "react-wordcloud";
import {dismissError, fetchWordCounters, resetCloud, setError, toggleWord} from "../redux/actions/cloud";
import {connect} from "react-redux";
import {getCounters, getDescriptions, getError, isLoading} from "../redux/selectors/cloud";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import queryString from 'query-string';
import {withRouter} from "react-router-dom";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import {
    getAuthor,
    getCaseSensitive, getClusteringOptions, getCounterType,
    getGeneNamesOnly,
    getKeywords,
    getLogicOp, getMaxNumResults, getRedraw,
    getScope,
    getYearRange
} from "../redux/selectors/search";
import {
    setAuthor,
    setCaseSensitive,
    setClusteringOptions, setCounterType,
    setGeneNamesOnly,
    setKeywords,
    setLogicOp, setMaxNumResults, setScope, setYearRange
} from "../redux/actions/search";
import SearchForm from "../components/SearchForm";
import Spinner from "react-bootstrap/Spinner";
import CloudButtons from "../components/CloudButtons";
import {downloadFile} from "../lib/file";
import {exportComponentAsJPEG} from "react-component-export-image";


class ExtWC extends React.Component {
 render() {
   return <ReactWordcloud {...this.props} />
 }
}

class Cloud extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            showLongWaitMessage: false,
            showYearsError: false,

        }
        this.maxYearDiff = 10;
        this.componentRef = createRef();
        this.waitMessageTimeout = undefined;
    }

    componentDidMount() {
        const value = queryString.parse(this.props.location.search);
        if (value.keywords !== undefined) {
            const keywords = value.keywords.split(',').filter(k => k !== '');
            if (keywords.length > 0) {
                let years = [''];
                this.props.fetchWordCounters(keywords, this.props.caseSensitive, years, this.props.genesOnly,
                    this.props.logicOp, this.props.author, this.props.maxResults, this.props.weightedScore);
                this.setState({keywords: keywords});
            }
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.genesOnly !== prevProps.genesOnly || this.props.caseSensitive !== prevProps.caseSensitive || this.props.publicationYearFrom !== prevProps.publicationYearFrom || this.props.publicationYearTo !== prevProps.publicationYearTo || this.props.logicOp !== prevProps.logicOp) {
            this.props.resetCloud();
        }
        if (this.props.isLoading !== prevProps.isLoading) {
            if (this.props.isLoading) {
                this.waitMessageTimeout = setTimeout(() => {
                    if (this.props.isLoading) {
                        this.setState({showLongWaitMessage: true})
                    }
                }, 10000)
            } else {
                this.setState({showLongWaitMessage: false});
                if (this.waitMessageTimeout !== undefined) {
                    clearTimeout(this.waitMessageTimeout);
                }
            }
        }
    }

    generateCloud = () => {
        if ((this.props.yearRange.yearStart === '' && this.props.yearRange.yearEnd === '') || (parseInt(this.props.yearRange.yearStart) <= parseInt(this.props.yearRange.yearEnd) && parseInt(this.props.yearRange.yearEnd) - parseInt(this.props.yearRange.yearStart) <= this.maxYearDiff && parseInt(this.props.yearRange.yearStart) > 1900 && parseInt(this.props.yearRange.yearEnd) > 1900)) {
            let years = [''];
            if (this.props.yearRange.yearStart !== '') {
                years = Array.from(Array(parseInt(this.props.yearRange.yearEnd) - parseInt(this.props.yearRange.yearStart) + 1), (_, i) => i + parseInt(this.props.yearRange.yearStart))
            }
            let filteredKeywords = this.props.keywords.filter(k => k !== '');
            if (filteredKeywords.length > 0 || this.props.author !== '') {
                this.props.resetCloud();
                this.props.fetchWordCounters(this.props.keywords, this.props.caseSensitive,
                    years, this.props.geneNamesOnly, this.props.logicOp, this.props.author,
                    this.props.maxNumResults, this.props.counterType, this.props.scope,
                    this.props.clusteringOptions.clusterWords, this.props.clusteringOptions.clusteringMinSim);
                this.props.setKeywords(filteredKeywords);
            } else {
                this.props.setError("The provided keywords are not valid");
            }
        } else {
            this.setState({showYearsError: true});
        }
    }

    render() {
        return (
            <Container fluid>
                <Row>
                    <Col sm={5}>
                        <SearchForm/>
                        <br/>
                        <Button onClick={() => {
                            this.generateCloud()
                        }}>Generate word cloud {this.props.isLoading ? <Spinner as="span" animation="border"
                                                                                size="sm" role="status"
                                                                                aria-hidden="true"
                                                                                variant="secondary"/> : ''}</Button>
                    </Col>
                    <Col sm={7}>
                        <Container fluid style={{paddingLeft: 0, paddingRight: 0}}>
                            <Row>
                                <Col sm={12}>
                                    {!this.props.isLoading ?
                                        <ExtWC ref={this.componentRef}
                                               redraw={this.props.redraw}
                                               words={this.props.counters}
                                               options={{
                                                   rotations: 1,
                                                   rotationAngles: [-0, 0],
                                                   padding: 3,
                                                   fontSizes: [14, 48],
                                                   fontFamily: 'verdana',
                                                   tooltipOptions: {allowHTML: true, maxWidth: 500}
                                               }}
                                               callbacks={{
                                                   onWordClick: (word, event) => {
                                                       let newKeywords = [...this.props.keywords];
                                                       newKeywords.push(word.text)
                                                       this.props.setKeywords(newKeywords);
                                                       this.props.resetCloud();
                                                       let years = [''];
                                                       if (this.props.yearRange.yearStart !== '') {
                                                           years = Array.from(Array(parseInt(this.props.yearRange.yearEnd) - parseInt(this.props.yearRange.yearStart) + 1), (_, i) => i + parseInt(this.props.yearRange.yearStart))
                                                       }
                                                       this.props.fetchWordCounters(this.props.keywords, this.props.caseSensitive,
                                                           years, this.props.geneNamesOnly, this.props.logicOp, this.props.author,
                                                           this.props.maxNumResults, this.props.counterType, this.props.scope,
                                                           this.props.clusteringOptions.clusterWords, this.props.clusteringOptions.clusteringMinSim);
                                                   },
                                                   getWordTooltip: word => {
                                                       if (this.props.geneNamesOnly) {
                                                           return `<strong>${word.text}</strong><br/><br/>Count: ${word.value}<br/><br/>Gene Description: ${this.props.descriptions[word.text]}`;
                                                       } else {
                                                           return `<strong>${word.text}</strong><br/><br/>Count: ${word.value}`;
                                                       }
                                                   }
                                               }}/> : ''}
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    &nbsp;
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={12} align="right">
                                    <div>
                                        {this.props.counters.length > 0 ?
                                            <Button size="sm" variant="outline-primary" onClick={() => {
                                                this.props.setRedraw();
                                            }}>Redraw cloud</Button> : ''}&nbsp;
                                        {this.props.counters.length > 0 ?
                                            <Button size="sm" variant="outline-primary" onClick={() => {
                                                downloadFile(this.props.counters.sort((a, b) => (a.value > b.value) ? -1 : 1)
                                                    .map((c) => this.props.geneNamesOnly ? '"' + c.text + '",' + c.value + ',"' + this.props.descriptions[c.text] + '"' : '"' + c.text + '",' + c.value).join('\n'), "counters", "text/plain", "csv").then(r => {
                                                });
                                            }}>Download counters</Button> : ''}&nbsp;
                                        {this.props.counters.length > 0 ?
                                            <Button size="sm" variant="outline-primary" onClick={() => {
                                                console.log(this.componentRef);
                                                exportComponentAsJPEG(this.componentRef, 'wormicloud.jpg', '#FFFFFF')
                                            }}>Export JPEG</Button> : ''}&nbsp;
                                        {this.props.counters.length > 0 && this.props.geneNamesOnly ?
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
                                                geneListInput.value = this.props.counters.map(c => c.text).join('\n');
                                                form.appendChild(geneListInput);

                                                const submitInput = document.createElement('input');
                                                submitInput.setAttribute('name', 'action');
                                                submitInput.setAttribute('type', 'submit');
                                                form.appendChild(submitInput);

                                                document.body.appendChild(form);
                                                submitInput.click();
                                                document.body.removeChild(form);
                                            }}>SimpleMine</Button> : ''}&nbsp;
                                        {this.props.counters.length > 0 && this.props.geneNamesOnly ?
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
                                                geneListInput.value = this.props.counters.map(c => c.text).join(' ');
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
                                        {this.props.counters.length > 0 && this.props.geneNamesOnly ?
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
                                                geneListInput.value = this.props.counters.map(c => c.text).sort().join('\n');
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
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                </Row>
                <ErrorModal
                    show={this.props.error !== null}
                    onHide={this.props.dismissError}
                    title="Error"
                    body={this.props.error}
                />
                <ErrorModal
                    show={this.state.showLongWaitMessage}
                    onHide={() => this.setState({showLongWaitMessage: false})}
                    title="Warning"
                    body={"The search on Textpressocentral is taking a long time. Please wait until you see the word cloud or reload this page to perform another search. You can try to add more keywords (or remove them if 'combine keywords by' is set to 'OR') to speed up the search. Also, gene only clouds require more queries to be performed at the same time and may take longer."}
                />
                <ErrorModal
                    show={this.state.showYearsError}
                    onHide={() => this.setState({showYearsError: false})}
                    title="Error"
                    body={"Please provide both 'from' and 'to' years. The maximum time span for searches is limited to 10 years."}
                />
            </Container>
        );
    }
}

const ErrorModal = (props) => {
        return (
            <Modal
                {...props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        {props.title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        {props.body}
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={props.onHide}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
}

const mapStateToProps = state => ({
    redraw: getRedraw(state),
    counters: getCounters(state),
    descriptions: getDescriptions(state),
    isLoading: isLoading(state),
    error: getError(state),
    keywords: getKeywords(state),
    logicOp: getLogicOp(state),
    geneNamesOnly: getGeneNamesOnly(state),
    caseSensitive: getCaseSensitive(state),
    scope: getScope(state),
    yearRange: getYearRange(state),
    author: getAuthor(state),
    maxNumResults: getMaxNumResults(state),
    counterType: getCounterType(state),
    clusteringOptions: getClusteringOptions(state)
});

export default connect(mapStateToProps, {toggleWord, fetchWordCounters, resetCloud, setKeywords,
    setLogicOp, setGeneNamesOnly, setCaseSensitive, setScope, setYearRange, setAuthor, setMaxNumResults, setCounterType,
    setClusteringOptions, dismissError, setError})(withRouter(Cloud));