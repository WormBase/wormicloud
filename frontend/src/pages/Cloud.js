import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ReactWordcloud from "react-wordcloud";
import Form from "react-bootstrap/Form";
import {dismissError, fetchWordCounters, resetCloud, toggleWord} from "../redux/actions";
import {connect} from "react-redux";
import {getCounters, getDescriptions, getError, isLoading} from "../redux/selectors";
import Button from "react-bootstrap/Button";
import { IoIosAddCircleOutline, IoIosRemoveCircleOutline, IoIosHelpCircleOutline } from 'react-icons/io';
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import {downloadFile} from "../lib/file";
import {exportComponentAsJPEG} from "react-component-export-image";
import {Tooltip} from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import queryString from 'query-string';
import {withRouter} from "react-router-dom";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';


class ExtWC extends React.Component {
 render() {
   return <ReactWordcloud {...this.props} />
 }
}

class Cloud extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.componentRef = React.createRef();
        this.state = {
            keywords: [''],
            redraw: false,
            caseSensitive: true,
            searchType: 'document',
            publicationYearFrom: '',
            publicationYearTo: '',
            author: '',
            genesOnly: false,
            logicOp: 'AND',
            showLongWaitMessage: false,
            showYearsError: false,
            maxYearDiff: 10,
            viewAdvOpts: false,
            maxResults: 200,
            weightedScore: false
        }
        this.waitMessageTimeout = undefined;

        this.generateCloud = this.generateCloud.bind(this);
    }

    componentDidMount() {
        const value = queryString.parse(this.props.location.search);
        if (value.keywords !== undefined) {
            const keywords = value.keywords.split(',').filter(k => k !== '');
            if (keywords.length > 0) {
                let years = [''];
                this.props.fetchWordCounters(keywords, this.state.caseSensitive, years, this.state.genesOnly,
                    this.state.logicOp, this.state.author, this.state.maxResults, this.state.weightedScore);
                this.setState({keywords: keywords});
            }
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.genesOnly !== prevState.genesOnly || this.state.caseSensitive !== prevState.caseSensitive || this.state.publicationYearFrom !== prevState.publicationYearFrom || this.state.publicationYearTo !== prevState.publicationYearTo || this.state.logicOp !== prevState.logicOp) {
            this.props.resetCloud();
        }
        if (this.props.isLoading !== prevProps.isLoading) {
            if (this.props.isLoading) {
                this.waitMessageTimeout = setTimeout(() => {
                    if (this.props.isLoading) {
                        this.setState({showLongWaitMessage: true})
                    }}, 10000)
            } else{
                this.setState({showLongWaitMessage: false});
                if (this.waitMessageTimeout !== undefined) {
                    clearTimeout(this.waitMessageTimeout);
                }
            }
        }
    }

    generateCloud() {
        if ((this.state.publicationYearFrom === '' && this.state.publicationYearTo === '' ) || (parseInt(this.state.publicationYearFrom) <= parseInt(this.state.publicationYearTo) && parseInt(this.state.publicationYearTo) - parseInt(this.state.publicationYearFrom) <= this.state.maxYearDiff && parseInt(this.state.publicationYearFrom) > 1900 && parseInt(this.state.publicationYearTo) > 1900)) {
            let years = [''];
            if (this.state.publicationYearFrom !== '') {
                years = Array.from(Array(parseInt(this.state.publicationYearTo) - parseInt(this.state.publicationYearFrom) + 1), (_, i) => i + parseInt(this.state.publicationYearFrom))
            }
            let filteredKeywords = this.state.keywords.filter(k => k !== '');
            if (filteredKeywords.length > 0 || this.state.author !== '') {
                this.props.resetCloud();
                this.props.fetchWordCounters(this.state.keywords, this.state.caseSensitive,
                    years, this.state.genesOnly, this.state.logicOp, this.state.author,
                    this.state.maxResults, this.state.weightedScore, this.state.searchType);
                this.setState({keywords: filteredKeywords});
            } else {
                this.setState({error: "The provided keywords are not valid"})
            }
        } else {
            this.setState({showYearsError: true})
        }
    }

    render() {
        const keywordTooltip = <Tooltip id="button-tooltip">You can provide keywords in separate text fields to build a word cloud from abstracts of documents containing all the provided keywords or the union of documents containing each separate keyword (depending on the 'combine by' option). You can also insert text spans with multiple words in each field to perform exact match searches on combination of words.</Tooltip>;
        return(
            <Container fluid>
                <Row>
                    <Col sm={5}>
                        <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
                            <Row>
                                <Col>
                                    <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
                                        <Row>
                                            <Col>
                                                <h6>Keywords to search <OverlayTrigger placement="bottom"
                                                                                       delay={{ show: 250, hide: 400 }}
                                                                                       overlay={keywordTooltip}>
                                                    <IoIosHelpCircleOutline/></OverlayTrigger></h6>
                                            </Col>
                                        </Row>
                                    </Container>
                                </Col>
                            </Row>
                            {this.state.keywords.map((keyword, idx) =>
                                <Row>
                                    <Col sm={7}>
                                        <Form>
                                            <Form.Group controlId="formBasicEmail">
                                                <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
                                                    <Row>
                                                        <Col sm={11}>
                                                            <Form.Control inline type="text" placeholder="insert keyword"
                                                                          value={keyword} onChange={(event) => {
                                                                let newKeywords = [...this.state.keywords];
                                                                newKeywords[idx] = event.target.value;
                                                                this.setState({keywords: newKeywords})
                                                            }}/>
                                                        </Col>
                                                        <Col sm={1}>
                                                            {this.state.keywords.length > 1 ?
                                                                <Button variant="light" onClick={() => {
                                                                    let newKeywords = [...this.state.keywords];
                                                                    newKeywords.splice(idx, 1);
                                                                    this.setState({keywords: newKeywords})}}>
                                                                    <IoIosRemoveCircleOutline />
                                                                </Button> : ''}
                                                        </Col>
                                                    </Row>
                                                </Container>
                                            </Form.Group>
                                        </Form>
                                    </Col>
                                </Row>
                            )}
                            <Row>
                                <Col sm={4}>
                                    <Button variant="light" onClick={() => {
                                        this.setState({keywords: [...this.state.keywords, '']})
                                    }}><IoIosAddCircleOutline /></Button>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    &nbsp;
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={7}>
                                    <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
                                        <Row>
                                            <Col>
                                                <strong>Combine keywords by:</strong>&nbsp;
                                                <Form.Check inline type="radio" name="filtersLogic"
                                                            onChange={() => this.setState({logicOp: 'AND'})}
                                                            label="AND" defaultChecked/>
                                                <Form.Check inline type="radio" name="filtersLogic"
                                                            onChange={() => this.setState({logicOp: 'Overlap'})}
                                                            label="OR"/>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>&nbsp;</Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Form.Check type="checkbox" label="Word cloud with gene names only"
                                                            checked={this.state.genesOnly}
                                                            onChange={() => {
                                                                this.setState({genesOnly: !this.state.genesOnly})
                                                            }}/>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>&nbsp;</Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Accordion>
                                                    <Accordion.Toggle as={Button} variant="link" eventKey="0" onClick={() => this.setState({viewAdvOpts: !this.state.viewAdvOpts})}>
                                                        {this.state.viewAdvOpts ? 'Hide' : 'Show'} Advanced Options
                                                    </Accordion.Toggle>
                                                    <Accordion.Collapse eventKey="0">
                                                        <Card>
                                                            <Card.Body>
                                                                <Container>
                                                                    <Row>
                                                                        <Col>
                                                                            <Form.Check type="checkbox" label="Case sensitive"
                                                                                        checked={this.state.caseSensitive}
                                                                                        onChange={() => {
                                                                                            this.setState({caseSensitive: !this.state.caseSensitive})
                                                                                        }}/>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row><Col>&nbsp;</Col></Row>
                                                                    <Row>
                                                                        <Col>
                                                                            Search Scope:
                                                                            <Form.Control as="select"
                                                                                          checked={this.state.searchType}
                                                                                          onChange={(event) => {
                                                                                              this.setState({searchType: event.target.value})
                                                                                          }}>
                                                                                <option value="document">Document</option>
                                                                                <option value="sentence">Sentence</option>
                                                                            </Form.Control>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row><Col>&nbsp;</Col></Row>
                                                                    <Row>
                                                                        <Col>
                                                                            Publication year:
                                                                        </Col>
                                                                        <Col>
                                                                            From <Form.Control type="text" placeholder="" value={this.state.publicationYearFrom}
                                                                                               onChange={(event) => {this.setState({publicationYearFrom: event.target.value})}}/>
                                                                        </Col>
                                                                        <Col>
                                                                            To <Form.Control type="text" placeholder="" value={this.state.publicationYearTo}
                                                                                             onChange={(event) => {this.setState({publicationYearTo: event.target.value})}}/>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row><Col>&nbsp;</Col></Row>
                                                                    <Row>
                                                                        <Col>
                                                                            Author: <Form.Control type="text" placeholder="" value={this.state.author}
                                                                                                  onChange={(event) => {this.setState({author: event.target.value})}}/>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row><Col>&nbsp;</Col></Row>
                                                                    <Row>
                                                                        <Col>
                                                                            Max number of results: <Form.Control as="select" value={this.state.maxResults.toString()}
                                                                                                                 onChange={(event) => {this.setState({maxResults: parseInt(event.target.value)})}}>
                                                                            <option value="200">200</option>
                                                                            <option value="400">400</option>
                                                                            <option value="1000">1000</option>
                                                                        </Form.Control>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row><Col>&nbsp;</Col></Row>
                                                                    <Row>
                                                                        <Col>
                                                                            Word Counts: <Form.Control as="select" value={this.state.weightedScore.toString()}
                                                                                                                 onChange={(event) => {this.setState({weightedScore: event.target.value === 'true'})}}>
                                                                            <option value="false">Plain count</option>
                                                                            <option value="true">Weighted by paper score</option>
                                                                        </Form.Control>
                                                                        </Col>
                                                                    </Row>
                                                                </Container>
                                                            </Card.Body>
                                                        </Card>
                                                    </Accordion.Collapse>
                                                </Accordion>
                                            </Col>
                                        </Row>
                                    </Container>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    &nbsp;
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Button onClick={() => {
                                        this.generateCloud()
                                    }}>Generate word cloud {this.props.isLoading ? <Spinner as="span" animation="border"
                                                                                            size="sm" role="status"
                                                                                            aria-hidden="true" variant="secondary"/> : ''}</Button>
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                    <Col sm={7}>
                        <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>

                            <Row>
                                <Col sm={12}>
                                    {!this.props.isLoading ?
                                        <ExtWC ref={this.componentRef}
                                               redraw={this.state.redraw}
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
                                                       let newKeywords = [...this.state.keywords];
                                                       newKeywords.push(word.text)
                                                       this.setState({keywords: newKeywords});
                                                       this.generateCloud();
                                                   },
                                                   getWordTooltip: word => {
                                                       if (this.state.genesOnly) {
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
                                    {this.props.counters.length > 0 ? <Button size="sm" variant="outline-primary" onClick={() => {
                                        this.setState({redraw: !this.state.redraw});
                                    }}>Redraw cloud</Button> : ''}&nbsp;
                                    {this.props.counters.length > 0 ? <Button size="sm" variant="outline-primary" onClick={() => {
                                        downloadFile(this.props.counters.sort((a, b) => (a.value > b.value) ? -1 : 1)
                                            .map((c) => this.state.genesOnly ? '"' + c.text + '",' + c.value + ',"' + this.props.descriptions[c.text] + '"' : '"' + c.text + '",' + c.value).join('\n'), "counters", "text/plain", "csv").then(r => {});
                                    }}>Download counters</Button> : ''}&nbsp;
                                    {this.props.counters.length > 0 ? <Button size="sm" variant="outline-primary" onClick={() => {
                                        exportComponentAsJPEG(this.componentRef, 'wormicloud.jpg', '#FFFFFF')
                                    }}>Export JPEG</Button> : ''}&nbsp;
                                    {this.props.counters.length > 0 && this.state.genesOnly ?
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
                                    {this.props.counters.length > 0 && this.state.genesOnly ?
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
                                    {this.props.counters.length > 0 && this.state.genesOnly ?
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

function ErrorModal(props) {
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
    counters: getCounters(state),
    descriptions: getDescriptions(state),
    isLoading: isLoading(state),
    error: getError(state)
});

export default connect(mapStateToProps, {toggleWord, fetchWordCounters, resetCloud, dismissError})(withRouter(Cloud));