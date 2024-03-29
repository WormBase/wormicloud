import React, {useState} from "react";
import {connect} from "react-redux";
import {getReferences} from "../redux/selectors/cloud";
import ReferenceElement from "../components/ReferenceElement";
import withPaginatedList from "paginated-list";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import {downloadFile} from "../lib/file";
import FormControl from "react-bootstrap/FormControl";
import {getShowNumCuratedObjects} from "../redux/selectors/search";

const ReferenceList = (props) => {
    const [elemPerPage, setElemPerPage] = useState(20);
    const [sortBy, setSortBy] = useState('index');
    const [sortOrder, setSortOrder] = useState(1);

    const PaginatedReferences = withPaginatedList(ReferenceElement, (offset) => {
        return new Promise(((resolve, reject ) => {
            let refs = props.references.slice().sort((a, b) => (a[sortBy] > b[sortBy]) ? sortOrder : -sortOrder);
            if (refs.length > offset) {
                resolve({elements: refs.slice(offset, offset + elemPerPage),
                    totNumElements: refs.length});
            } else {
                resolve({elements: [], totNumElements: 0});
            }})
        )}, props.showNumCuratedObjects
        ?
        [[1, 'Relevance'], [3, 'Title'], [1, 'Journal'], [1, 'Year'], [1, 'Paper type'], [2, 'WB ID'], [2, 'PMID'], [1, 'Num Curated Objects']]
        :
        [[1, 'Relevance'], [4, 'Title'], [1, 'Journal'], [1, 'Year'], [1, 'Paper type'], [2, 'WB ID'], [2, 'PMID']]);
        return (
            <div>
                {props.references.length > 0 ?
                    <Container fluid>
                        <Row>
                            <Col sm={12}>
                                &nbsp;
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={2}>
                                <Button size="sm" variant="outline-primary" onClick={() => {
                                    downloadFile(props.references.map((r) => '"' + r.index + '","' + r.authors + '","' + r.title + '","' +
                                        r.journal + '","' + r.year + '","' + r.paper_type + '","' + r.wb_id + '","' + r.pmid + '","' + r.num_curated_entities + '"').join('\n'), "references", "text/plain", "csv").then(r => {})}}
                                >Download references</Button>
                            </Col>
                            <Col sm={3}>
                                <Container fluid>
                                    <Row>
                                        <Col sm={3} align="right">Sort By:</Col>
                                        <Col sm={9} align="left">
                                            <FormControl size="sm" as="select" inline onChange={(event) => {setSortBy(event.target.value); setSortOrder(1)}}>
                                                <option value='index'>Relevance</option>
                                                <option value='title'>Title</option>
                                                <option value='journal'>Journal</option>
                                                <option value='year'>Year</option>
                                                <option value='paper_type'>Paper Type</option>
                                                <option value='wb_id'>WBPaperID</option>
                                                <option value='pmid'>PMID</option>
                                                {
                                                    props.showNumCuratedObjects ?
                                                        <option value='num_curated_entities'>Num Curated Objects</option>
                                                    : null
                                                }
                                            </FormControl>
                                        </Col>
                                    </Row>
                                </Container>
                            </Col>
                            <Col sm={2}>
                                <Button variant="outline-primary" size="sm" onClick={() => setSortOrder(-sortOrder)}>Reverse Order</Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                &nbsp;
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12} align="left">
                                <PaginatedReferences elemPerPage={elemPerPage} setNumElemPerPageCallback={(num) => setElemPerPage(num)} showNumElemPerPageSelector />
                            </Col>
                        </Row>
                    </Container> : ''}
                    <br/>
            </div>
        );
}

const mapStateToProps = state => ({
    references: getReferences(state),
    showNumCuratedObjects: getShowNumCuratedObjects(state)
});

export default connect(mapStateToProps, {})(ReferenceList)
