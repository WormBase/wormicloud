import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Cloud from "./Cloud";
import ReferenceList from "./ReferenceList";

class Main extends React.Component {

    render() {
        return(
            <Container fluid>
                <Row>
                    <Col sm={6}>
                        <Cloud />
                    </Col>
                    <Col sm={6}>
                        <ReferenceList />
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Main;