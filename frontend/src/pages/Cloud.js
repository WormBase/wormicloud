import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ReactWordcloud from "react-wordcloud";
import Form from "react-bootstrap/Form";
import {dismissError, fetchWordCounters, resetCloud, toggleWord} from "../redux/actions";
import {connect} from "react-redux";
import {getCounters, getError, isLoading} from "../redux/selectors";
import Button from "react-bootstrap/Button";
import { IoIosAddCircleOutline, IoIosRemoveCircleOutline } from 'react-icons/io';
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
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
        this.componentRef = React.createRef();
        this.state = {
            keywords: [''],
            redraw: false,
            caseSensitive: true,
            publicationYear: '',
            genesOnly: false,
            logicOp: 'AND'
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.genesOnly !== prevState.genesOnly) {
            this.props.resetCloud();
        }
    }

    render() {
        return(
            <Container fluid>
                <Row>
                    <Col>
                        <Container fluid>
                            {this.state.keywords.map((keyword, idx) =>
                                <Row>
                                    <Col sm={7}>
                                        <Form>
                                            <Form.Group controlId="formBasicEmail">
                                                <Container fluid>
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
                                <Col sm={5}>
                                    <Container fluid>
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
                                                Publication year:
                                            </Col>
                                            <Col>
                                                <Form.Control type="text" placeholder="" value={this.state.publicationYear}
                                                              onChange={(event) => {this.setState({publicationYear: event.target.value})}}/>
                                            </Col>
                                        </Row>
                                        <Row><Col>&nbsp;</Col></Row>
                                        <Row>
                                            <Col>
                                                <Form.Check type="checkbox" label="Word cloud with gene names only"
                                                            checked={this.state.genesOnly}
                                                            onChange={() => {
                                                                this.setState({genesOnly: !this.state.genesOnly})
                                                            }}/>
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
                                        let filteredKeywords = this.state.keywords.filter(k => k !== '');
                                        if (filteredKeywords.length > 0) {
                                            this.props.resetCloud();
                                            this.props.fetchWordCounters(this.state.keywords, this.state.caseSensitive,
                                                this.state.publicationYear, this.state.genesOnly, this.state.logicOp);
                                            this.setState({keywords: filteredKeywords});
                                        } else {
                                            this.setState({error: "The provided keywords are not valid"})
                                        }
                                    }}>Generate word cloud {this.props.isLoading ? <Spinner as="span" animation="border"
                                                                                            size="sm" role="status"
                                                                                            aria-hidden="true" variant="secondary"/> : ''}</Button>
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                    <Col>
                        <Container fluid>
                            <Row>
                                <Col>
                                    <Row>
                                        <Col sm={2}>
                                            {this.props.counters.length > 0 ? <Button size="sm" variant="light" onClick={() => {
                                                this.setState({redraw: !this.state.redraw});
                                            }}>Redraw cloud</Button> : ''}
                                        </Col>
                                        <Col sm={2}>
                                            {this.props.counters.length > 0 ? <Button size="sm" variant="light" onClick={() => {
                                                downloadFile(this.props.counters.sort((a, b) => (a.value > b.value) ? -1 : 1)
                                                    .map((c) => c.text + ': ' + c.value).join('\n'), "counters", "text/plain", "txt").then(r => {});
                                            }}>Download counters</Button> : ''}
                                        </Col>
                                        <Col sm={2}>
                                            {this.props.counters.length > 0 ? <Button size="sm" variant="light" onClick={() => {
                                                exportComponentAsJPEG(this.componentRef)
                                            }}>Export As JPEG</Button> : ''}
                                        </Col>
                                        <Col sm={2}>
                                            {this.props.counters.length > 0 && this.state.genesOnly ?
                                                <Button size="sm" variant="light" onClick={() => {
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
                                                    geneListInput.value = this.props.counters.map(c => c.text).join(' ');
                                                    form.appendChild(geneListInput);

                                                    const columnHeaders = [
                                                    'WormBase Gene ID',
                                                    'Public Name',
                                                    'WormBase Status',
                                                    'Sequence Name',
                                                    'Other Name',
                                                    'Transcript',
                                                    'Operon',
                                                    'WormPep',
                                                    'Protein Domain',
                                                    'Uniprot',
                                                    'Reference Uniprot ID',
                                                    'TreeFam',
                                                    'RefSeq_mRNA',
                                                    'RefSeq_protein',
                                                    'Genetic Map Position',
                                                    'RNAi Phenotype Observed',
                                                    'Allele Phenotype Observed',
                                                    'Sequenced Allele',
                                                    'Interacting Gene',
                                                    'Expr_pattern Tissue',
                                                    'Genomic Study Tissue',
                                                    'Expr_pattern LifeStage',
                                                    'Genomic Study LifeStage',
                                                    'Disease Info',
                                                    'Human Ortholog',
                                                    'Reference',
                                                    'Concise Description',
                                                    'Automated Description',
                                                    'Expression Cluster Summary',
                                                    ];

                                                    const options = [
                                                { name: 'outputFormat', value: 'html' },
                                                { name: 'duplicatesToggle', value: 'merge' },
                                                { name: 'headers', value: columnHeaders.join('\t') },
                                                    ].concat(
                                                    columnHeaders.map((name) => ({
                                                    name,
                                                }))
                                                    );

                                                    options.forEach(({ name, value, checked = 'checked' }) => {
                                                    const optionInput = document.createElement('input');
                                                    optionInput.setAttribute('type', 'checkbox');
                                                    optionInput.setAttribute('name', name);
                                                    optionInput.setAttribute('value', value || name);
                                                    optionInput.setAttribute('checked', checked);
                                                    form.appendChild(optionInput);
                                                });

                                                    const submitInput = document.createElement('input');
                                                    submitInput.setAttribute('name', 'action');
                                                    submitInput.setAttribute('type', 'submit');
                                                    submitInput.setAttribute('value', 'query list');
                                                    form.appendChild(submitInput);

                                                    document.body.appendChild(form);
                                                    submitInput.click();
                                                    document.body.removeChild(form);
                                                }}>View on SimpleMine</Button> : ''}
                                        </Col>
                                        <Col sm={2}>
                                            {this.props.counters.length > 0 && this.state.genesOnly ?
                                                <Button size="sm" variant="light" onClick={() => {
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
                                                }}>View on Gene Set Enrichment tool</Button> : ''}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            &nbsp;
                                        </Col>
                                    </Row>
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
                                                           fontFamily: 'verdana'
                                                       }}
                                                       callbacks={{
                                                           onWordClick: (word, event) => {
                                                               let newKeywords = [...this.state.keywords];
                                                               newKeywords.push(word.text)
                                                               this.setState({keywords: newKeywords});
                                                           }
                                                       }}/> : ''}
                                        </Col>
                                    </Row>
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
    isLoading: isLoading(state),
    error: getError(state)
});

export default connect(mapStateToProps, {toggleWord, fetchWordCounters, resetCloud, dismissError})(Cloud);