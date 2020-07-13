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
import FormControl from "react-bootstrap/FormControl";

class ReferenceList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            elemPerPage: 20,
            sortBy: 'index',
            sortOrder: 1
        }
    }
    render() {
        const PaginatedReferences = withPaginatedList(ReferenceElement, (offset) => {
            return new Promise(((resolve, reject ) => {
                let refs = this.props.references.slice().sort((a, b) => (a[this.state.sortBy] > b[this.state.sortBy]) ? this.state.sortOrder : -this.state.sortOrder);
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
                                    downloadFile(this.props.references.map((r) => r.index + '\t' + r.authors + '\t' + r.title + '\t' +
                                        r.journal + '\t' + r.year + '\t' + r.wb_id + '\t' + r.pmid).join('\n'), "references", "text/plain", "csv").then(r => {})}}
                                >Download references</Button>
                            </Col>
                            <Col sm={3}>
                                <Container fluid>
                                    <Row>
                                        <Col sm={3} align="right">Sort By:</Col>
                                        <Col sm={9} align="left">
                                            <FormControl size="sm" as="select" inline onChange={(event) => this.setState({sortBy: event.target.value, sortOrder: 1})}>
                                                <option value='index'>Relevance</option>
                                                <option value='title'>Title</option>
                                                <option value='journal'>Journal</option>
                                                <option value='year'>Year</option>
                                                <option value='wb_id'>WBPaperID</option>
                                                <option value='pmid'>PMID</option>
                                            </FormControl>
                                        </Col>
                                    </Row>
                                </Container>
                            </Col>
                            <Col sm={2}>
                                <Button variant="outline-primary" size="sm" onClick={() => this.setState({sortOrder: -this.state.sortOrder})}>Reverse Order</Button>
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