import React, {useEffect, useMemo, useRef, useState} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ReactWordcloud from "react-wordcloud";
import {dismissError, fetchWordCounters, resetCloud, setError, toggleWord} from "../redux/actions/cloud";
import {connect} from "react-redux";
import {getCounters, getDescriptions, getError, getRedraw, isLoading} from "../redux/selectors/cloud";
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
    getLogicOp, getMaxNumResults,
    getScope, getShowNumCuratedObjects,
    getYearRange
} from "../redux/selectors/search";
import SearchForm from "../components/SearchForm";
import Spinner from "react-bootstrap/Spinner";
import CloudButtons from "../components/CloudButtons";
import ErrorModal from "../components/ErrorModal";
import {setKeywords} from "../redux/actions/search";
import distinctColors from "distinct-colors";


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
    const palette = [
        "#000000", "#FFFF00", "#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059",
        "#FFDBE5", "#7A4900", "#0000A6", "#63FFAC", "#B79762", "#004D43", "#8FB0FF", "#997D87",
        "#5A0007", "#809693", "#FEFFE6", "#1B4400", "#4FC601", "#3B5DFF", "#4A3B53", "#FF2F80",
        "#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100",
        "#DDEFFF", "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F",
        "#372101", "#FFB500", "#C2FFED", "#A079BF", "#CC0744", "#C0B9B2", "#C2FF99", "#001E09",
        "#00489C", "#6F0062", "#0CBD66", "#EEC3FF", "#456D75", "#B77B68", "#7A87A1", "#788D66",
        "#885578", "#FAD09F", "#FF8A9A", "#D157A0", "#BEC459", "#456648", "#0086ED", "#886F4C",

        "#34362D", "#B4A8BD", "#00A6AA", "#452C2C", "#636375", "#A3C8C9", "#FF913F", "#938A81",
        "#575329", "#00FECF", "#B05B6F", "#8CD0FF", "#3B9700", "#04F757", "#C8A1A1", "#1E6E00",
        "#7900D7", "#A77500", "#6367A9", "#A05837", "#6B002C", "#772600", "#D790FF", "#9B9700",
        "#549E79", "#FFF69F", "#201625", "#72418F", "#BC23FF", "#99ADC0", "#3A2465", "#922329",
        "#5B4534", "#FDE8DC", "#404E55", "#0089A3", "#CB7E98", "#A4E804", "#324E72", "#6A3A4C",
        "#83AB58", "#001C1E", "#D1F7CE", "#004B28", "#C8D0F6", "#A3A489", "#806C66", "#222800",
        "#BF5650", "#E83000", "#66796D", "#DA007C", "#FF1A59", "#8ADBB4", "#1E0200", "#5B4E51",
        "#C895C5", "#320033", "#FF6832", "#66E1D3", "#CFCDAC", "#D0AC94", "#7ED379", "#012C58",

        "#7A7BFF", "#D68E01", "#353339", "#78AFA1", "#FEB2C6", "#75797C", "#837393", "#943A4D",
        "#B5F4FF", "#D2DCD5", "#9556BD", "#6A714A", "#001325", "#02525F", "#0AA3F7", "#E98176",
        "#DBD5DD", "#5EBCD1", "#3D4F44", "#7E6405", "#02684E", "#962B75", "#8D8546", "#9695C5",
        "#E773CE", "#D86A78", "#3E89BE", "#CA834E", "#518A87", "#5B113C", "#55813B", "#E704C4",
        "#00005F", "#A97399", "#4B8160", "#59738A", "#FF5DA7", "#F7C9BF", "#643127", "#513A01",
        "#6B94AA", "#51A058", "#A45B02", "#1D1702", "#E20027", "#E7AB63", "#4C6001", "#9C6966",
        "#64547B", "#97979E", "#006A66", "#391406", "#F4D749", "#0045D2", "#006C31", "#DDB6D0",
        "#7C6571", "#9FB2A4", "#00D891", "#15A08A", "#BC65E9", "#FFFFFE", "#C6DC99", "#203B3C",

        "#671190", "#6B3A64", "#F5E1FF", "#FFA0F2", "#CCAA35", "#374527", "#8BB400", "#797868",
        "#C6005A", "#3B000A", "#C86240", "#29607C", "#402334", "#7D5A44", "#CCB87C", "#B88183",
        "#AA5199", "#B5D6C3", "#A38469", "#9F94F0", "#A74571", "#B894A6", "#71BB8C", "#00B433",
        "#789EC9", "#6D80BA", "#953F00", "#5EFF03", "#E4FFFC", "#1BE177", "#BCB1E5", "#76912F",
        "#003109", "#0060CD", "#D20096", "#895563", "#29201D", "#5B3213", "#A76F42", "#89412E",
        "#1A3A2A", "#494B5A", "#A88C85", "#F4ABAA", "#A3F3AB", "#00C6C8", "#EA8B66", "#958A9F",
        "#BDC9D2", "#9FA064", "#BE4700", "#658188", "#83A485", "#453C23", "#47675D", "#3A3F00",
        "#061203", "#DFFB71", "#868E7E", "#98D058", "#6C8F7D", "#D7BFC2", "#3C3E6E", "#D83D66",

        "#2F5D9B", "#6C5E46", "#D25B88", "#5B656C", "#00B57F", "#545C46", "#866097", "#365D25",
        "#252F99", "#00CCFF", "#674E60", "#FC009C", "#92896B"]
    //const palette = useMemo(() => distinctColors({count: 200, lightMin: 10}), [props.redraw]);

    useEffect(() => {
        const value = queryString.parse(props.location.search);
        let keywords = [];
        let caseSensitive = true;
        let author = '';
        let geneNamesOnly = false;
        let maxNumResults = 200;
        let logicOp = 'AND';
        let counterType = 'plain';
        let scope = 'document';
        let clusterWords = false;
        let clusterWordsMinSim = 0.0;
        let clusterShowBestWords = false;
        let showNumCuratedObjects = false;
        if (value.keywords !== undefined || value.author !== undefined) {
            if (value.keywords !== undefined) {
                keywords = value.keywords.split(',').filter(k => k !== '');
            }
            if (value.caseSensitive !== undefined && ['true', 'false'].includes(value.caseSensitive)) {
                caseSensitive = value.caseSensitive === 'true';
            }
            if (value.author !== undefined) {
                author = value.author;
            }
            if (value.geneNamesOnly !== undefined && ['true', 'false'].includes(value.geneNamesOnly)) {
                geneNamesOnly = value.geneNamesOnly === 'true';
            }
            if (value.maxNumResults !== undefined) {
                maxNumResults = parseInt(value.maxNumResults);
            }
            if (value.logicOp !== undefined && ['AND', 'OR'].includes(value.logicOp)) {
                logicOp = value.logicOp;
            }
            if (value.counterType !== undefined && ['plain', 'weighted'].includes(value.counterType)) {
                counterType = value.counterType;
            }
            if (value.scope !== undefined && ['document', 'sentence'].includes(value.scope)) {
                scope = value.scope;
            }
            if (value.clusterWords !== undefined && ['true', 'false'].includes(value.clusterWords)) {
                clusterWords = value.clusterWords === 'true';
            }
            if (value.clusterWordsMinSim !== undefined) {
                clusterWordsMinSim = parseFloat(value.clusterWordsMinSim);
            }
            if (value.clusterShowBestWords !== undefined) {
                clusterShowBestWords = parseFloat(value.clusterShowBestWords);
            }
            if (value.showNumCuratedObjects !== undefined && ['true', 'false'].includes(value.showNumCuratedObjects)) {
                showNumCuratedObjects = value.showNumCuratedObjects === 'true';
            }
            if (keywords.length > 0 || author !== '') {
                props.fetchWordCounters(keywords, caseSensitive, [''], geneNamesOnly, logicOp, author, maxNumResults,
                    counterType, scope, clusterWords, clusterWordsMinSim, clusterShowBestWords, showNumCuratedObjects);
                props.setKeywords(keywords);
            }
        }
    }, [props.location]);

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
                    props.clusteringOptions.clusterWords, props.clusteringOptions.clusteringMinSim,
                    props.clusteringOptions.showBestWords, props.showNumCuratedObjects);
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
                                                       props.clusteringOptions.clusterWords, props.clusteringOptions.clusteringMinSim, props.clusteringOptions.showBestWords, props.showNumCuratedObjects);
                                               },
                                               getWordTooltip: word => {
                                                   if (props.geneNamesOnly) {
                                                       return `<strong>${word.text}</strong><br/><br/>Count: ${word.value}<br/><br/>Gene Description: ${props.descriptions[word.text]}`;
                                                   } else {
                                                       let clusteringStr = props.clusteringOptions.clusterWords ? `<br/><br/>Cluster: ${word.cluster + 1}` : '';
                                                       return `<strong>${word.text}</strong><br/><br/>Count: ${word.value}${clusteringStr}`;
                                                   }
                                               },
                                               getWordColor: word => palette[word.cluster]
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
                                <CloudButtons counters={props.counters} geneNamesOnly={props.geneNamesOnly}
                                              descriptions={props.descriptions} myRef={componentRef} />
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
    clusteringOptions: getClusteringOptions(state),
    showNumCuratedObjects: getShowNumCuratedObjects(state)
});

export default connect(mapStateToProps, {toggleWord, fetchWordCounters, resetCloud, setKeywords,
    dismissError, setError})(withRouter(Cloud));
