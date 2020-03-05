import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {Link} from "react-router-dom";
import {sources, entityTypes} from "../commons";

class Selection extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            gene1: undefined,
            gene2: undefined,
            source: sources.WORMBASE,
            entityType: entityTypes.GENE
        };
    }

    getEntityTypeFromSource(source) {
        switch(source) {
            case sources.WORMBASE:
                return entityTypes.GENE;
            case sources.TPC:
                return entityTypes.KEYWORD;
        }
    }

    render() {
        return (
            <Container fluid>
                <Row className="justify-content-md-center">
                    <Col xs={4}>
                        &nbsp;
                    </Col>
                </Row>
                <Row className="justify-content-md-center">
                    <Col xs={4}>
                        <h2 className="text-center">WormBase Word Cloud Generator</h2>
                    </Col>
                </Row>
                <Row className="justify-content-md-center">
                    <Col xs={4}>
                        &nbsp;
                    </Col>
                </Row>
                <Row className="justify-content-md-center">
                    <Col xs={2}>
                        <Form.Group>
                            <Form.Label>Select data Source</Form.Label>
                            <Form.Control as="select" onChange={(event) => {
                                this.setState(
                                    {
                                        source: event.target.value,
                                        entityType: this.getEntityTypeFromSource(event.target.value)
                                    })}
                            }>
                                <option value={sources.WORMBASE}>WormBase curated data</option>
                                <option value={sources.TPC}>Textpresso</option>
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="justify-content-md-center">
                    <Col xs={2}>
                        <Form>
                            <Row>
                                <Col>
                                    <Form.Control placeholder={`${this.state.entityType} 1`} onInput={(event) => {this.setState({gene1: event.target.value})}}/>
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
                                    <Link to={`/cloud/${this.state.gene1}/${this.state.gene2}/${this.state.source}`}>
                                        <Button variant="outline-primary">Generate Wordcloud</Button>
                                    </Link>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Selection;