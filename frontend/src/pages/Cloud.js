import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ReactWordcloud from "react-wordcloud";
import LoadingOverlay from "react-loading-overlay";
import Button from "react-bootstrap/Button";
import {Link} from "react-router-dom";

class Cloud extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            isLoading: false,
            words: []
        };
        this.loadDataFromAPI = this.loadDataFromAPI.bind(this);
    }

    componentDidMount() {
        this.loadDataFromAPI();
    }

    loadDataFromAPI() {
        if (this.props.match.params.gene1 !== undefined && this.props.match.params.gene2 !== undefined) {
            this.setState({isLoading: true});
            let payload = {
                gene1: this.props.match.params.gene1,
                gene2: this.props.match.params.gene2
            };
            fetch(process.env.REACT_APP_API_ENDPOINT + "/get_words_counter_from_wb_db", {
                method: 'POST',
                headers: {
                    'Accept': 'text/html',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            }).then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    alert("Error")
                }
            }).then(data => {
                if (data === undefined) {
                    alert("Empty response")
                }
                let arr = [];
                Object.keys(data["counters"]).forEach((k) => {
                    arr.push({"text": k, "value": parseInt(data["counters"][k])});
                });
                this.setState({
                    words: arr,
                    isLoading: false
                });
            }).catch((err) => {
                alert(err);
            });
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