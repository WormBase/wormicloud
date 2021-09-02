import React from 'react';
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {getShowNumCuratedObjects} from "../redux/selectors/search";
import {connect} from "react-redux";

const ReferenceElement = (props) => {
    return (
        <Container fluid>
            <Row>
                <Col sm={1}>{props.element.index}</Col>
                <Col sm={props.showNumCuratedObjects ? 3 : 4}><a target="_blank" rel="noopener noreferrer" href={"https://wormbase.org/resources/paper/" + props.element.wb_id + "#0--10"}><p dangerouslySetInnerHTML={{__html: props.element.title}}/></a></Col>
                <Col sm={1}>{props.element.journal}</Col>
                <Col sm={1}>{props.element.year}</Col>
                <Col sm={1}>{props.element.paper_type}</Col>
                <Col sm={2}><a target="_blank" rel="noopener noreferrer" href={"https://wormbase.org/resources/paper/" + props.element.wb_id + "#0--10"}>{props.element.wb_id}</a></Col>
                <Col sm={2}><a target="_blank" rel="noopener noreferrer" href={"https://pubmed.ncbi.nlm.nih.gov/" + props.element.pmid}>PMID:{props.element.pmid}</a></Col>
                {props.showNumCuratedObjects
                    ?
                    <Col sm={1}><a target="_blank" rel="noopener noreferrer" href={"https://wormbase.org/resources/paper/" + props.element.wb_id + "#3--10"}>{props.element.num_curated_entities}</a></Col>
                    :
                    null
                }
            </Row>
        </Container>
    );
}

const mapStateToProps = state => ({
    showNumCuratedObjects: getShowNumCuratedObjects(state)
});

export default connect(mapStateToProps, {})(ReferenceElement)
