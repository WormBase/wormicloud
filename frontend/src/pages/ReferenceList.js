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

class ReferenceList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            elemPerPage: 5
        }
    }
    render() {
        const PaginatedReferences = withPaginatedList(ReferenceElement, (offset) => {
            return new Promise(((resolve, reject ) => {
                if (this.props.references.length > offset) {
                    resolve({elements: this.props.references.slice(offset, offset + this.state.elemPerPage),
                        totNumElements: this.props.references.length});
                } else {
                    resolve({elements: [], totNumElements: 0});
                }})
            )});
        return (
            <div>
                {this.props.references.length > 0 ?
                    <Container fluid>
                        <Row>
                            <Col>
                                <h5>List of references</h5>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                sorted by relevance and limited to 200 results
                            </Col>
                            <Col>
                                <Button variant="light" onClick={() => {
                                    downloadFile(this.props.references.map((r) => r.index + '\t' + r.title + '\t' +
                                        r.journal + '\t' + r.year).join('\n'), "references", "text/plain", "txt").then(r => {})}}
                                >Download references</Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12} align="left">
                                <PaginatedReferences elemPerPage={this.state.elemPerPage} setNumElemPerPageCallback={(num) => this.setState({elemPerPage: num})} showNumElemPerPageSelector />
                            </Col>
                        </Row>
                    </Container> : ''}
            </div>
        );
    }
}
const mapStateToProps = state => ({
    references: getReferences(state),
});

export default connect(mapStateToProps, {})(ReferenceList)