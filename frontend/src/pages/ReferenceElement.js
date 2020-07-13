import React from 'react';
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

class ReferenceElement extends React.Component {
    render() {
        return (
            <Container fluid>
                <Row>
                    <Col sm={1}>{this.props.element.index}</Col>
                    <Col sm={4}><a target="_blank" rel="noopener noreferrer" href={"https://wormbase.org/resources/paper/" + this.props.element.wb_id}>{this.props.element.title}</a></Col>
                    <Col sm={2}>{this.props.element.journal}</Col>
                    <Col sm={1}>{this.props.element.year}</Col>
                    <Col sm={2}>{this.props.element.wb_id}</Col>
                    <Col sm={2}><a target="_blank" rel="noopener noreferrer" href={"https://pubmed.ncbi.nlm.nih.gov/" + this.props.element.pmid}>PMID:{this.props.element.pmid}</a></Col>
                </Row>
            </Container>
        );
    }
}

export default ReferenceElement;