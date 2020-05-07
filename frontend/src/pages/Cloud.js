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
import Collapse from "react-bootstrap/Collapse";
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
            showAdvOpts: false,
            caseSensitive: true,
            publicationYear: ''
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state !== prevState) {
            this.props.resetCloud();
        }
    }

    render() {
        return(
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
                        <Button variant="light" size="sm" onClick={() => {
                            this.setState({showAdvOpts: !this.state.showAdvOpts});
                        }}>
                            Advanced options
                        </Button>
                        <Collapse in={this.state.showAdvOpts}>
                            <Container fluid>
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
                            </Container>
                        </Collapse>
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
                                this.props.fetchWordCounters(this.state.keywords, this.state.caseSensitive, this.state.publicationYear);
                                this.setState({keywords: filteredKeywords});
                            } else {
                                this.setState({error: "The provided keywords are not valid"})
                            }
                        }}>Generate word cloud {this.props.isLoading ? <Spinner as="span" animation="border"
                                                                                size="sm" role="status"
                                                                                aria-hidden="true" variant="secondary"/> : ''}</Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        &nbsp;
                    </Col>
                </Row>
                <Row>
                    <Col sm={4}>
                        {this.props.counters.length > 0 ? <Button size="sm" variant="light" onClick={() => {
                            this.setState({redraw: !this.state.redraw});
                        }}>Redraw cloud</Button> : ''}
                    </Col>
                    <Col sm={4}>
                        {this.props.counters.length > 0 ? <Button size="sm" variant="light" onClick={() => {
                            downloadFile(this.props.counters.sort((a, b) => (a.value > b.value) ? -1 : 1)
                                .map((c) => c.text + ': ' + c.value).join('\n'), "counters", "text/plain", "txt").then(r => {});
                        }}>Download counters</Button> : ''}
                    </Col>
                    <Col sm={4}>
                        {this.props.counters.length > 0 ? <Button size="sm" variant="light" onClick={() => {
                            exportComponentAsJPEG(this.componentRef)
                        }}>Export As JPEG</Button> : ''}
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
                                   fontSizes: [14, 32],
                                   fontFamily: 'verdana'
                               }}/> : ''}
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