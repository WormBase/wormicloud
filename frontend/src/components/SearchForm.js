import React, {useState} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {IoIosAddCircleOutline, IoIosHelpCircleOutline, IoIosRemoveCircleOutline} from "react-icons/io";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import {connect} from "react-redux";
import {
    getAuthor,
    getCaseSensitive, getClusteringOptions, getCounterType,
    getGeneNamesOnly,
    getKeywords,
    getLogicOp, getMaxNumResults,
    getScope,
    getYearRange
} from "../redux/selectors/search";
import {resetCloud} from "../redux/actions/cloud";
import {
    setAuthor,
    setCaseSensitive, setClusteringOptions, setCounterType,
    setGeneNamesOnly,
    setKeywords,
    setLogicOp, setMaxNumResults,
    setScope,
    setYearRange
} from "../redux/actions/search";

const SearchForm = (props) => {

    const [viewAdvOpts, setViewAdvOpts] = useState(false);

    return (
        <Container fluid style={{paddingLeft: 0, paddingRight: 0}}>
            <Row>
                <Col>
                    <Container fluid style={{paddingLeft: 0, paddingRight: 0}}>
                        <Row>
                            <Col>
                                <h6>Keywords to search <OverlayTrigger placement="bottom"
                                                                       delay={{show: 250, hide: 400}}
                                                                       overlay={<Tooltip id="button-tooltip">You can provide keywords in separate text fields to build a word
        cloud from abstracts of documents containing all the provided keywords or the union of documents containing each
        separate keyword (depending on the 'combine by' option). You can also insert text spans with multiple words in
        each field to perform exact match searches on combination of words.</Tooltip>}>
                                    <IoIosHelpCircleOutline/></OverlayTrigger></h6>
                            </Col>
                        </Row>
                    </Container>
                </Col>
            </Row>
            {props.keywords.map((keyword, idx) =>
                <Row>
                    <Col>
                        <Form>
                            <Form.Group controlId="formBasicEmail">
                                <Container fluid style={{paddingLeft: 0, paddingRight: 0}}>
                                    <Row>
                                        <Col xs="auto">
                                            <Form.Control inline type="text" placeholder="insert keyword"
                                                          value={keyword} style={{maxWidth: "500px"}} onChange={(event) => {
                                                let newKeywords = [...props.keywords];
                                                newKeywords[idx] = event.target.value;
                                                props.setKeywords(newKeywords)
                                            }}/>
                                        </Col>
                                        <Col xs="auto">
                                            {props.keywords.length > 1 ?
                                                <Button variant="light" onClick={() => {
                                                    let newKeywords = [...props.keywords];
                                                    newKeywords.splice(idx, 1);
                                                    props.setKeywords(newKeywords)
                                                }}>
                                                    <IoIosRemoveCircleOutline/>
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
                <Col>
                    <Button variant="light" onClick={() => {
                        props.setKeywords([...props.keywords, '']);
                    }}><IoIosAddCircleOutline/></Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    &nbsp;
                </Col>
            </Row>
            <Row>
                <Col xs="auto">
                    <Container fluid style={{paddingLeft: 0, paddingRight: 0}}>
                        <Row>
                            <Col>
                                <strong>Combine keywords by:</strong>&nbsp;
                                <Form.Check inline type="radio" name="filtersLogic"
                                            onChange={() => props.setLogicOp('AND')}
                                            label="AND" defaultChecked/>
                                <Form.Check inline type="radio" name="filtersLogic"
                                            onChange={() => props.setLogicOp('Overlap')}
                                            label="OR"/>
                            </Col>
                        </Row>
                        <Row>
                            <Col>&nbsp;</Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Check type="checkbox" label="Word cloud with gene names only"
                                            checked={props.geneNamesOnly}
                                            onChange={() => {
                                                props.setGeneNamesOnly(!props.geneNamesOnly);
                                            }}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col>&nbsp;</Col>
                        </Row>
                        <Row>
                            <Col xs="auto">
                                <Accordion>
                                    <Accordion.Toggle as={Button} variant="link" eventKey="0"
                                                      onClick={() => setViewAdvOpts(!viewAdvOpts)}>
                                        {viewAdvOpts ? 'Hide' : 'Show'} Advanced Options
                                    </Accordion.Toggle>
                                    <Accordion.Collapse eventKey="0">
                                        <Card>
                                            <Card.Body>
                                                <Container>
                                                    <Row>
                                                        <Col xs="auto">
                                                            <Form.Check type="checkbox" label={<h6>Case sensitive</h6>}
                                                                        checked={props.caseSensitive}
                                                                        onChange={() => {
                                                                            props.setCaseSensitive(!props.caseSensitive);
                                                                        }}/>
                                                        </Col>
                                                    </Row>
                                                    <Row><Col>&nbsp;</Col></Row>
                                                    <Row>
                                                        <Col xs="auto">
                                                            <Form.Check type="checkbox"
                                                                        label={<h6>Cluster words by similarity <OverlayTrigger
                                                            delay={{show: 250, hide: 400}}
                                                            overlay={<Tooltip id="button-tooltip">Show only words with highest counts in each cluster</Tooltip>}>
                                                                            <IoIosHelpCircleOutline/></OverlayTrigger></h6>}
                                                                        checked={props.clusteringOptions.clusterWords}
                                                                        onChange={() => {
                                                                            props.setClusteringOptions(!props.clusteringOptions.clusterWords, props.clusteringOptions.clusteringMinSim);
                                                                        }}/>
                                                        </Col>
                                                    </Row>
                                                    <Row><Col>&nbsp;</Col></Row>
                                                    {props.clusteringOptions.clusterWords ?
                                                        <><Row>
                                                            <Col xs="auto">
                                                                <h6>Minimum word similarity</h6>
                                                                <Form.Control type="text" placeholder=""
                                                                              value={props.clusteringOptions.clusteringMinSim}
                                                                              onChange={(event) => {
                                                                                  props.setClusteringOptions(props.clusteringOptions.clusterWords, event.target.value)
                                                                              }}/>
                                                            </Col>
                                                        </Row><Row><Col>&nbsp;</Col></Row></> : ''}

                                                    <Row>
                                                        <Col xs="auto">
                                                            <h6>Search Scope</h6>
                                                            <Form.Control as="select"
                                                                          checked={props.scope}
                                                                          onChange={(event) => {
                                                                              props.setScope(event.target.value);
                                                                          }}>
                                                                <option value="document">Document</option>
                                                                <option value="sentence">Sentence</option>
                                                            </Form.Control>
                                                        </Col>
                                                    </Row>
                                                    <Row><Col>&nbsp;</Col></Row>
                                                    <Row>
                                                        <Col xs="auto">
                                                            <h6>Publication year</h6>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col xs="auto">
                                                            From <Form.Control type="text" placeholder=""
                                                                               value={props.yearRange.yearStart}
                                                                               style={{maxWidth: "100px"}}
                                                                               onChange={(event) => {
                                                                                   props.setYearRange(event.target.value, props.yearRange.yearEnd)
                                                                               }}/>
                                                        </Col>
                                                        <Col xs="auto">
                                                            To <Form.Control type="text" placeholder=""
                                                                             style={{maxWidth: "100px"}}
                                                                             value={props.yearRange.yearEnd}
                                                                             onChange={(event) => {
                                                                                 props.setYearRange(props.yearRange.yearStart, event.target.value)
                                                                             }}/>
                                                        </Col>
                                                    </Row>
                                                    <Row><Col>&nbsp;</Col></Row>
                                                    <Row>
                                                        <Col xs="auto">
                                                            <h6>Author</h6>
                                                            <Form.Control type="text" placeholder=""
                                                                          value={props.author}
                                                                          onChange={(event) => {
                                                                              props.setAuthor(event.target.value)
                                                                          }}/>
                                                        </Col>
                                                    </Row>
                                                    <Row><Col>&nbsp;</Col></Row>
                                                    <Row>
                                                        <Col xs="auto">
                                                            <h6>Max number of results</h6>
                                                            <Form.Control as="select"
                                                                          value={props.maxNumResults.toString()}
                                                                          onChange={(event) => {
                                                                              props.setMaxNumResults(parseInt(event.target.value))
                                                                          }}>
                                                            <option value="200">200</option>
                                                            <option value="400">400</option>
                                                            <option value="1000">1000</option>
                                                        </Form.Control>
                                                        </Col>
                                                    </Row>
                                                    <Row><Col>&nbsp;</Col></Row>
                                                    <Row>
                                                        <Col xs="auto">
                                                            <h6>Word Counts</h6>
                                                            <Form.Control as="select"
                                                                          value={props.counterType.toString()}
                                                                          onChange={(event) => {
                                                                              props.setCounterType(event.target.value)
                                                                          }}>
                                                            <option value="plain">Plain count</option>
                                                            <option value="weighted">Weighted by paper score</option>
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
        </Container>
    );
}

const mapStateToProps = state => ({
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

export default connect(mapStateToProps, {resetCloud, setKeywords,
    setLogicOp, setGeneNamesOnly, setCaseSensitive, setScope, setYearRange, setAuthor, setMaxNumResults, setCounterType,
    setClusteringOptions})(SearchForm);