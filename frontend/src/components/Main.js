import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InteractionWordCloud from "./InteractionWordCloud";

class Main extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            target: undefined,
            bait: undefined,
            target_tmp: undefined,
            bait_tmp: undefined
        };
    }

    render() {
        return(
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
                                    <Form.Control placeholder="Bait" onInput={(event) => {this.setState({bait_tmp: event.target.value})}}/>
                                </Col>
                                <Col>
                                    <Form.Control placeholder="Target" onInput={(event) => {this.setState({target_tmp: event.target.value})}}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    &nbsp;
                                </Col>
                            </Row>
                            <Row>
                                <Col className="text-center">
                                    <Button variant="outline-primary" onClick={() => this.setState({target: this.state.target_tmp, bait: this.state.bait_tmp})}>Generate Wordcloud</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                    <Col xs={5}>
                        &nbsp;
                    </Col>
                </Row>
                <Row>
                    <Col xs={4}>
                        &nbsp;
                    </Col>
                    <Col xs={4}>
                        <InteractionWordCloud bait={this.state.bait} target={this.state.target}/>
                    </Col>
                    <Col xs={4}>
                        &nbsp;
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Main;