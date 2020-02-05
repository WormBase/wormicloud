import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ReactWordcloud from "react-wordcloud";
import LoadingOverlay from "react-loading-overlay";
import Button from "react-bootstrap/Button";
import {Link} from "react-router-dom";
import {loadCuratedData, loadTextpressoData} from "../DataManager";
import {sources} from "../commons";

class Cloud extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            isLoading: false,
            words: []
        };
        this.loadData = this.loadData.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        if (this.props.match.params.gene1 !== undefined && this.props.match.params.gene2 !== undefined &&
            this.props.match.params.source !== undefined) {
            this.setState({isLoading: true});
            if (this.props.match.params.source === sources.WORMBASE) {
                loadCuratedData(this.props.match.params.gene1, this.props.match.params.gene2)
                    .then(result => this.setState({words: result, isLoading: false}))
                    .catch(error => {
                        this.setState({isLoading: false});
                        alert(error)
                    });
            } else if (this.props.match.params.source === sources.TPC) {
                loadTextpressoData(this.props.match.params.gene1, this.props.match.params.gene2)
                    .then(result => this.setState({words: result, isLoading: false}))
                    .catch(error => {
                        this.setState({isLoading: false});
                        alert(error)
                    });
            }
        }
    }

    render() {
        return(
            <Container fluid>
                <Row className="justify-content-md-center">
                    <Col sm={4}>
                        <LoadingOverlay
                            active={this.state.isLoading}
                            spinner
                            text='Loading data...'
                            styles={{
                                overlay: (base) => ({
                                    ...base,
                                    background: 'rgba(255,255,225,0.0)',
                                    color: 'rgba(0,0,0,1.0)'
                                })
                            }}>
                            <ReactWordcloud words={this.state.words}
                                            size={[500, 500]}
                                            options={{
                                                rotations: 2,
                                                rotationAngles: [-90, 0],
                                                fontSizes: [10, 100, 150, 200]
                                            }}/>
                        </LoadingOverlay>
                    </Col>
                </Row>
                <Row className="justify-content-md-center">
                    <Col sm={1}>
                        <Link to="/">
                            <Button>Back</Button>
                        </Link>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Cloud;