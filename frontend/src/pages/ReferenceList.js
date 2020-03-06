import React from 'react';
import Container from "react-bootstrap/Container";
import {connect} from "react-redux";
import {getReferences} from "../redux/selectors";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

class ReferenceList extends React.Component {
    render() {
        return(
            <Container fluid>
                <Row>
                    <Col>
                        <h5>List of References matching the specified query</h5>
                    </Col>
                </Row>
                {this.props.references.map((reference, idx) =>
                    <Row>
                        <Col>
                            <a href={"https://wormbase.org/resources/paper/" + reference}>{reference}</a>
                        </Col>
                    </Row>
                )}
            </Container>
        );
    }
}


const mapStateToProps = state => ({
    references: getReferences(state),
});

export default connect(mapStateToProps, {})(ReferenceList);