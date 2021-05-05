import React, {useEffect, useRef, useState} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ReactWordcloud from "react-wordcloud";
import {dismissError, fetchWordCounters, resetCloud, setError, toggleWord} from "../redux/actions/cloud";
import {connect} from "react-redux";
import {getCounters, getDescriptions, getError, isLoading} from "../redux/selectors/cloud";
import Button from "react-bootstrap/Button";
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
import SearchForm from "../components/SearchForm";
import Spinner from "react-bootstrap/Spinner";
import CloudButtons from "../components/CloudButtons";
import ErrorModal from "../components/ErrorModal";
import {setKeywords} from "../redux/actions/search";


class ExtWC extends React.Component {
 render() {
   return <ReactWordcloud {...this.props} />
 }
}

const Cloud = (props) => {
    const [showLongWaitMessage, setShowLongWaitMessage] = useState(false);
    const [showYearsError, setShowYearsError] = useState(false);
    const maxYearDiff = 10;
    let componentRef = useRef();
    let waitMessageTimeout = useRef();

    useEffect(() => {
        const value = queryString.parse(props.location.search);
        if (value.keywords !== undefined) {
            const keywords = value.keywords.split(',').filter(k => k !== '');
            if (keywords.length > 0) {
                let years = [''];
                props.fetchWordCounters(keywords, props.caseSensitive, years, props.genesOnly,
                    props.logicOp, props.author, props.maxResults, props.weightedScore);
                props.setKeywords(keywords);
            }
        }
    }, []);

    useEffect(() => {
        props.resetCloud();
    }, [props.geneNamesOnly, props.caseSensitive, props.yearRange, props.logicOp]);

    useEffect(() => {
        if (props.isLoading) {
            waitMessageTimeout.current = setTimeout(() => {
                if (props.isLoading) {
                    setShowLongWaitMessage(true);
                }
            }, 10000)
        } else {
            setShowLongWaitMessage(false);
            if (waitMessageTimeout.current !== undefined) {
                clearTimeout(waitMessageTimeout.current);
            }
        }
    }, [props.isLoading]);

    const generateCloud = () => {
        if ((props.yearRange.yearStart === '' && props.yearRange.yearEnd === '') || (parseInt(props.yearRange.yearStart) <= parseInt(props.yearRange.yearEnd) && parseInt(props.yearRange.yearEnd) - parseInt(props.yearRange.yearStart) <= maxYearDiff && parseInt(props.yearRange.yearStart) > 1900 && parseInt(props.yearRange.yearEnd) > 1900)) {
            let years = [''];
            if (props.yearRange.yearStart !== '') {
                years = Array.from(Array(parseInt(props.yearRange.yearEnd) - parseInt(props.yearRange.yearStart) + 1), (_, i) => i + parseInt(props.yearRange.yearStart))
            }
            let filteredKeywords = props.keywords.filter(k => k !== '');
            if (filteredKeywords.length > 0 || props.author !== '') {
                props.resetCloud();
                props.fetchWordCounters(props.keywords, props.caseSensitive,
                    years, props.geneNamesOnly, props.logicOp, props.author,
                    props.maxNumResults, props.counterType, props.scope,
                    props.clusteringOptions.clusterWords, props.clusteringOptions.clusteringMinSim);
                props.setKeywords(filteredKeywords);
            } else {
                props.setError("The provided keywords are not valid");
            }
        } else {
            setShowYearsError(true);
        }
    }

    return (
        <Container fluid>
            <Row>
                <Col sm={5}>
                    <SearchForm/>
                    <br/>
                    <Button onClick={() => {
                        generateCloud()
                    }}>Generate word cloud {props.isLoading ? <Spinner as="span" animation="border"
                                                                            size="sm" role="status"
                                                                            aria-hidden="true"
                                                                            variant="secondary"/> : ''}</Button>
                </Col>
                <Col sm={7}>
                    <Container fluid style={{paddingLeft: 0, paddingRight: 0}}>
                        <Row>
                            <Col sm={12}>
                                {!props.isLoading ?
                                    <ExtWC ref={componentRef}
                                           redraw={props.redraw}
                                           words={props.counters}
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
                                                   let newKeywords = [...props.keywords];
                                                   newKeywords.push(word.text)
                                                   props.setKeywords(newKeywords);
                                                   props.resetCloud();
                                                   let years = [''];
                                                   if (props.yearRange.yearStart !== '') {
                                                       years = Array.from(Array(parseInt(props.yearRange.yearEnd) - parseInt(props.yearRange.yearStart) + 1), (_, i) => i + parseInt(props.yearRange.yearStart))
                                                   }
                                                   props.fetchWordCounters(props.keywords, props.caseSensitive,
                                                       years, props.geneNamesOnly, props.logicOp, props.author,
                                                       props.maxNumResults, props.counterType, props.scope,
                                                       props.clusteringOptions.clusterWords, props.clusteringOptions.clusteringMinSim);
                                               },
                                               getWordTooltip: word => {
                                                   if (props.geneNamesOnly) {
                                                       return `<strong>${word.text}</strong><br/><br/>Count: ${word.value}<br/><br/>Gene Description: ${props.descriptions[word.text]}`;
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
                                <CloudButtons myRef={componentRef} />
                            </Col>
                        </Row>
                    </Container>
                </Col>
            </Row>
            <ErrorModal
                show={props.error !== null}
                onHide={props.dismissError}
                title="Error"
                body={props.error}
            />
            <ErrorModal
                show={showLongWaitMessage}
                onHide={() => setShowLongWaitMessage(false)}
                title="Warning"
                body={"The search on Textpressocentral is taking a long time. Please wait until you see the word cloud or reload this page to perform another search. You can try to add more keywords (or remove them if 'combine keywords by' is set to 'OR') to speed up the search. Also, gene only clouds require more queries to be performed at the same time and may take longer."}
            />
            <ErrorModal
                show={showYearsError}
                onHide={() => setShowYearsError(false)}
                title="Error"
                body={"Please provide both 'from' and 'to' years. The maximum time span for searches is limited to 10 years."}
            />
        </Container>
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
    dismissError, setError})(withRouter(Cloud));