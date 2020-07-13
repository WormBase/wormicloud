import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Cloud from "./Cloud";
import ReferenceList from "./ReferenceList";
import Tab from "react-bootstrap/Tab";
import {connect} from "react-redux";
import {getCounters} from "../redux/selectors";
import Trends from "./Trends";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import {Tooltip} from "react-bootstrap";
import Badge from "react-bootstrap/Badge";
import {IoIosHelpCircleOutline} from "react-icons/io";
import Nav from "react-bootstrap/Nav";


class Main extends React.Component {

    render() {
        const helpTooltip = <Tooltip id="button-tooltip">Wormicloud performs fulltext literature searches using Textpressocentral and pulls abstracts from the matching papers to build word clouds that can unearth interesting relationships between biological entities.</Tooltip>;
        const trendsTooltip = <Tooltip id="button-tooltip">Note that the trends are obtained on abstracts only, whereas keywords are matched on fulltext in searches and therefore some of the latter may be missing from the graphs.</Tooltip>;
        const referencesTooltip = <Tooltip id="button-tooltip">References matched by the textpresso search and limited to 200 results are displayed here, sorted by a relevance score assigned by textpresso with respect to the keywords provided.</Tooltip>;
        return(
            <Container fluid>
                <Row>
                    <Col sm={4}>
                        <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
                            <Row>
                                <Col sm={12}>
                                    <h1 style={{fontSize:'80px'}}>Wormicloud</h1>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={12}>
                                    Explore <i>C. elegans</i> literature through word clouds. <OverlayTrigger placement="bottom"
                                                                                                              delay={{ show: 250, hide: 400 }}
                                                                                                              overlay={helpTooltip}>
                                    <Badge variant="secondary">How does it work?</Badge>
                                </OverlayTrigger>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={12}>
                                    <h6><i>Powered by <a href="https://www.textpressocentral.org/tpc">Textpressocentral</a></i></h6>
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                    <Col sm={6} align="left">
                        <img src={process.env.PUBLIC_URL + '/wormicloud_logo.jpg'} className="logo"/>
                    </Col>
                    <Col sm={2} align="right">
                        <br/>
                        <a href="https://www.wormbase.org"><img src={process.env.PUBLIC_URL + '/logo_wormbase_gradient.svg'} className="wblogo"/></a><br/>
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
                            <Tab.Container defaultActiveKey="references">
                                <Row>
                                    <Col>
                                        <Nav variant="tabs" defaultActiveKey="references">
                                            <Nav.Item>
                                                <Nav.Link eventKey="references">References <OverlayTrigger placement="bottom"
                                                                                       delay={{ show: 250, hide: 400 }}
                                                                                       overlay={referencesTooltip}>
                                                    <IoIosHelpCircleOutline/></OverlayTrigger></Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="trends">Word Trends <OverlayTrigger placement="bottom"
                                                                                       delay={{ show: 250, hide: 400 }}
                                                                                       overlay={trendsTooltip}>
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
}

const mapStateToProps = state => ({
    counters: getCounters(state)
});

export default connect(mapStateToProps, {})(Main)