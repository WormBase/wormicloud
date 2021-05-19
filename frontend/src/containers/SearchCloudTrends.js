import React from 'react';
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Cloud from "./Cloud";
import Nav from "react-bootstrap/Nav";
import {IoIosHelpCircleOutline} from "react-icons/io";
import Tab from "react-bootstrap/Tab";
import ReferenceList from "./ReferenceList";
import Trends from "./Trends";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import {getCounters} from "../redux/selectors/cloud";
import {connect} from "react-redux";


const SearchCloudTrends = (props) => {
    return (
        <Container fluid>
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
                    {props.counters.length > 0 ?
                        <Tab.Container defaultActiveKey="references">
                            <Row>
                                <Col>
                                    <Nav variant="tabs" defaultActiveKey="references">
                                        <Nav.Item>
                                            <Nav.Link eventKey="references">References
                                                <OverlayTrigger placement="bottom"
                                                                delay={{ show: 250, hide: 400 }}
                                                                overlay={<Tooltip id="button-tooltip">References matched
                                                                    by the textpresso search and limited to the
                                                                    specified maximum number of results (for
                                                                    performance) are displayed here, sorted by a
                                                                    relevance score assigned by textpresso with respect
                                                                    to the keywords provided.</Tooltip>}>
                                                <IoIosHelpCircleOutline/></OverlayTrigger></Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="trends">Word Trends
                                                <OverlayTrigger placement="bottom"
                                                                delay={{ show: 250, hide: 400 }}
                                                                overlay={<Tooltip id="button-tooltip">Note that the
                                                                    trends are obtained on abstracts only, whereas
                                                                    keywords are matched on fulltext in searches and
                                                                    therefore some of the latter may be missing from the
                                                                    graphs.</Tooltip>}>
                                                <IoIosHelpCircleOutline/></OverlayTrigger></Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={12}>
                                    <Tab.Content>
                                        <Tab.Pane eventKey="references">
                                            <ReferenceList/>
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="trends">
                                            <Trends/>
                                        </Tab.Pane>
                                    </Tab.Content>
                                </Col>
                            </Row>
                        </Tab.Container> : ''}
                </Col>
            </Row>
        </Container>
    );
}

const mapStateToProps = state => ({
    counters: getCounters(state)
});

export default connect(mapStateToProps, {})(SearchCloudTrends)