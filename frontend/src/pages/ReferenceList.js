import React from "react";
import {connect} from "react-redux";
import {getReferences} from "../redux/selectors";
import ReferenceElement from "./ReferenceElement";
import withPaginatedList from "paginated-list";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import {downloadFile} from "../lib/file";
import FormGroup from "react-bootstrap/FormGroup";
import FormLabel from "react-bootstrap/FormLabel";
import FormControl from "react-bootstrap/FormControl";

class ReferenceList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            elemPerPage: 20,
            sortBy: ''
        }
    }
    render() {
        const PaginatedReferences = withPaginatedList(ReferenceElement, (offset) => {
            return new Promise(((resolve, reject ) => {
                let refs = this.props.references;
                if (this.state.sortBy !== '') {
                    refs = refs.slice().sort((a, b) => (a[this.state.sortBy] > b[this.state.sortBy]) ? 1 : -1);
                }
                if (refs.length > offset) {
                    resolve({elements: refs.slice(offset, offset + this.state.elemPerPage),
                        totNumElements: refs.length});
                } else {
                    resolve({elements: [], totNumElements: 0});
                }})
            )});
        return (
            <div>
                {this.props.references.length > 0 ?
                    <Container fluid>
                        <Row>
                            <Col sm={12}>
                                &nbsp;
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={2}>
                                <Button size="sm" variant="outline-primary" onClick={() => {
                                    downloadFile(this.props.references.map((r) => r.index + '\t' + r.title + '\t' +
                                        r.journal + '\t' + r.year + '\t' + r.wb_id + '\t' + r.pmid).join('\n'), "references", "text/plain", "csv").then(r => {})}}
                                >Download references</Button>
                            </Col>
                            <Col sm={2}>
                                <FormGroup controlId="exampleForm.ControlSelect1">
                                    <FormLabel>Sort By:</FormLabel>
                                    <FormControl as="select" onChange={(event) => this.setState({sortBy: event.target.value})}>
                                        <option value=''>Relevance</option>
                                        <option value='title'>Title</option>
                                        <option value='journal'>Journal</option>
                                        <option value='year'>Year</option>
                                        <option value='wb_id'>WBPaperID</option>
                                        <option value='pmid'>PMID</option>
                                    </FormControl>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                &nbsp;
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12} align="left">
                                <PaginatedReferences elemPerPage={this.state.elemPerPage} setNumElemPerPageCallback={(num) => this.setState({elemPerPage: num})} showNumElemPerPageSelector />
                            </Col>
                        </Row>
                    </Container> : ''}
                    <br/>
            </div>
        );
    }
}
const mapStateToProps = state => ({
    references: getReferences(state),
});

export default connect(mapStateToProps, {})(ReferenceList)