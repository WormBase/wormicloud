import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ReactWordcloud from "react-wordcloud";
import Form from "react-bootstrap/Form";
import {fetchWordCounters, resetCloud, toggleWord} from "../redux/actions";
import {connect} from "react-redux";
import {getCounters, getError, isLoading} from "../redux/selectors";
import Button from "react-bootstrap/Button";
import { IoIosAddCircleOutline, IoIosRemoveCircleOutline } from 'react-icons/io';
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";

class Cloud extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            keywords: [''],
            error: this.props.error,
            redraw: false
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.error !== prevProps.error) {
            this.setState({error: this.props.error})
        }
    }

    downloadFile = async (fileContent, fileName, fileType, fileExtension) => {
        const blob = new Blob([fileContent],{type: fileType});
        const href = await URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = fileName + '.' + fileExtension;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    render() {
        return(
            <Container fluid>
                {this.state.keywords.map((keyword, idx) =>
                    <Row>
                        <Col sm={4}>
                            <Form>
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Control type="text" placeholder="insert keyword" onChange={(event) => {
                                        this.props.resetCloud();
                                        let newKeywords = this.state.keywords;
                                        newKeywords[idx] = event.target.value;
                                        this.setState({keywords: newKeywords})
                                    }}/>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                )}
                <Row>
                    <Col sm={4}>
                        <Button variant="light" onClick={() => {
                            this.props.resetCloud();
                            this.setState({keywords: [...this.state.keywords, '']})
                            }}><IoIosAddCircleOutline /></Button>
                    {this.state.keywords.length > 1 ?
                            <Button variant="light" onClick={() => {
                                this.props.resetCloud();
                                this.setState({keywords: this.state.keywords.slice(0, this.state.keywords.length - 1)})}}>
                                <IoIosRemoveCircleOutline />
                            </Button> : ''}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        &nbsp;
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button variant="light" onClick={() => {
                            let filteredKeywords = this.state.keywords.filter(k => k !== '');
                            if (filteredKeywords.length > 0) {
                                this.props.fetchWordCounters(this.state.keywords);
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
                        {this.props.counters.length > 0 ? <Button variant="light" onClick={() => {
                            this.setState({redraw: !this.state.redraw});
                        }}>Redraw cloud</Button> : ''}
                    </Col>
                    <Col sm={4}>
                        {this.props.counters.length > 0 ? <Button variant="light" onClick={() => {
                            this.downloadFile(this.props.counters.sort((a, b) => (a.value > b.value) ? -1 : 1)
                                .map((c) => c.text + ': ' + c.value).join('\n'), "counters", "text/plain", "txt").then(r => {});
                        }}>Download counters</Button> : ''}
                    </Col>
                </Row>
                <Row>
                    <Col sm={4}>
                        {!this.props.isLoading ?
                        <ReactWordcloud redraw={this.state.redraw}
                                        words={this.props.counters}
                                        size={[500, 500]}
                                        options={{
                                            rotations: 1,
                                            rotationAngles: [-0, 0],
                                            fontSizes: [10, 100, 150, 200]
                                        }}/> : ''}
                    </Col>
                </Row>
                <ErrorModal
                    show={this.state.error !== null}
                    onHide={() => this.setState({error: null})}
                    title="Error"
                    body={this.state.error}
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

export default connect(mapStateToProps, {toggleWord, fetchWordCounters, resetCloud})(Cloud);