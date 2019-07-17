import React from 'react';
import LoadingOverlay from 'react-loading-overlay';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ReactWordcloud from 'react-wordcloud';

class InteractionWordCloud extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            isLoading: false,
            target: undefined,
            bait: undefined,
            words: []
        };
        this.loadDataFromAPI = this.loadDataFromAPI.bind(this);
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.bait !== this.props.bait || prevProps.target !== this.props.target) {
            this.loadDataFromAPI();
        }
    }

    loadDataFromAPI() {
        if (this.props.bait !== undefined && this.props.target !== undefined) {
            this.setState({isLoading: true});
            let payload = {
                bait: this.props.bait,
                target: this.props.target
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
                <Row>
                    <Col>
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
                                                rotationAngles: [0, 90],
                                                fontSizes: [10, 100, 150, 200]
                                            }}/>
                        </LoadingOverlay>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default InteractionWordCloud;