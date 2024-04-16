import React, {useState} from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {OverlayTrigger, Tooltip} from "react-bootstrap";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Player } from 'video-react';
import videoTutorial from "../assets/videos/tutorial.mp4";
import {Link} from "react-router-dom";

const TitleBar = () => {

    const [showTutorial, setShowTutorial] = useState(false);

    return (
        <>
            <Container fluid>
                <Row>
                    <Col sm={5}>
                        <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
                            <Row>
                                <Col sm={12}>
                                    <Link to={{ pathname: "/"}} style={{ textDecoration: 'none', color: "#000000" }}><h1 style={{fontSize:'80px'}}>Wormicloud</h1></Link>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={12}>
                                    Explore <i>C. elegans</i> literature through word clouds.
                                    <OverlayTrigger placement="bottom"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={<Tooltip id="button-tooltip">Wormicloud performs fulltext
                                                        literature searches using Textpressocentral and pulls abstracts from
                                                        the matching papers to build word clouds that can unearth
                                                        interesting relationships between biological entities.</Tooltip>}>
                                        <Badge variant="secondary">How does it work?</Badge>
                                    </OverlayTrigger>&nbsp;
                                    <Badge variant="primary" onClick={()=>{setShowTutorial(true)}}>Video Tutorial</Badge>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={12}>
                                    <h6><i>Powered by <a href="https://alliancegenome.org/textpresso/wb/tpc">Textpressocentral</a></i></h6>
                                </Col>
                            </Row>
                        </Container>
                    </Col>
                    <Col sm={5} align="left">
                        <img src={process.env.PUBLIC_URL + '/wormicloud_logo.jpg'} className="logo"/>
                    </Col>
                    <Col sm={2} align="right">
                        <br/>
                        <a href="https://www.wormbase.org"><img src={process.env.PUBLIC_URL + '/logo_wormbase_gradient.svg'} className="wblogo"/></a><br/>
                        <a href="mailto:help@wormbase.org">Contact Us</a>
                        <br/>
                        <br/>
                        <Badge variant="primary">v{process.env.REACT_APP_RELEASE_VERSION}</Badge>
                        <br/>
                        <Link to={{ pathname: "/changelog"}}>Changelog</Link>
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
            </Container>
            <Modal size="lg" show={showTutorial} onHide={()=>{setShowTutorial(false)}}>
                <Modal.Header>
                    <Modal.Title>Wormicloud Tutorial</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Player width={720} height={500} playsInline fluid={false}
                            src={videoTutorial} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={()=>{setShowTutorial(false)}}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default TitleBar;