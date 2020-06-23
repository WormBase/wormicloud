import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Cloud from "./Cloud";
import ReferenceList from "./ReferenceList";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import {connect} from "react-redux";
import {getCounters} from "../redux/selectors";
import Trends from "./Trends";


class Main extends React.Component {

    render() {
        return(
            <Container fluid>
                <Row>
                    <Col sm={12}>
                        <h3>Wormicloud</h3>
                    </Col>
                </Row>
                <Row>
                    <Col sm={11}>
                        <h6><i>Powered by <a href="https://www.textpressocentral.org/tpc">Textpressocentral</a></i></h6>
                    </Col>
                    <Col sm={1} align="right">
                        <a href="mailto:help@wormbase.org">Contact Us</a>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <div id="titleBanner">&nbsp;</div>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        &nbsp;
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <Cloud />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        &nbsp;
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        {this.props.counters.length > 0 ?
                        <Tabs defaultActiveKey="references" id="uncontrolled-tab-example">
                            <Tab eventKey="references" title="References">
                                <ReferenceList />
                                </Tab>
                            <Tab eventKey="trends" title="Word Trends">
                                <Trends />
                            </Tab>
                        </Tabs>
                            : ''}
                    </Col>
                </Row>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    counters: getCounters(state)
});

export default connect(mapStateToProps, {})(Main)