import React from 'react';
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";

class ReferenceElement extends React.Component {
    render() {
        return (
            <Container><Col>Title: <a target="_blank" rel="noopener noreferrer" href={"https://wormbase.org/resources/paper/" + this.props.element.wb_id}>{this.props.element.title}</a></Col>
                <Col>Journal: {this.props.element.journal}</Col>
                <Col>Publication Date: {this.props.element.year}</Col>
            </Container>
        );
    }
}

export default ReferenceElement;