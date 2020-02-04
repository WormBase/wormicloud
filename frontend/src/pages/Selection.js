import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {Link} from "react-router-dom";

class Selection extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            gene1: undefined,
            gene2: undefined,
        };
    }

    render() {
        return (
            <Container fluid>
                <Row>
                    <Col xs={12}>
                        &nbsp;
                    </Col>
                </Row>
                <Row>
                    <Col xs={5}>
                        &nbsp;
                    </Col>
                    <Col xs={2}>
                        <Form>
                            <Row>
                                <Col>
                                    <Form.Control placeholder="Gene 1" onInput={(event) => {this.setState({gene1: event.target.value})}}/>
                                </Col>
                                <Col>
                                    <Form.Control placeholder="Gene 2" onInput={(event) => {this.setState({gene2: event.target.value})}}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    &nbsp;
                                </Col>
                            </Row>
                            <Row>
                                <Col className="text-center">
                                    <Link to={`/cloud/${this.state.gene1}/${this.state.gene2}`}>
                                        <Button variant="outline-primary">Generate Wordcloud</Button>
                                    </Link>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                    <Col xs={5}>
                        &nbsp;
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Selection;