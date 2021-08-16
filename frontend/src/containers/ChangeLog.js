import React from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import clusteringImg from "../assets/images/changelog/clustering.jpg"
import coloredCloudImg from "../assets/images/changelog/colored_cloud.jpg"


const ChangeLog = () => {
    return (
        <Container fluid>
            <Row>
                <Col>
                    <h5>Version 2.0</h5>
                    <ul>
                        <li><strong>Release date:</strong> September 2021</li>
                        <li><strong>New Features:</strong></li>
                        <ul>
                            <li><u>Group similar words by color</u> (advanced options): builds a similarity graph of words through a
                                &nbsp;<a href="https://github.com/ncbi-nlp/BioSentVec" target="_blank">pre-trained word embedding model</a>
                                &nbsp;where each node is a word and edges connecting pairs of words are weighted by their similarity.
                                A minimum similarity value can be specified to avoid a fully connected graph. A standard network clustering is then
                                applied to the network to identify groups of similar words. The words in the word cloud are colored
                                according to their membership to the clusters. An additional option allows the user to show only the most important
                                words in each cluster (based on their counters) and hide the others. The new button "download clustering info" generates
                                a file with the list of words in each cluster. In order to keep the word graph small and the computation of edges fast,
                                only the top 500 words in terms of counter are clustered. The remaining words are not clustered and appear under the
                                'not clustered' label in the clustering info file. <br/><br/>
                                <img src={clusteringImg} style={{width: '300px'}}/> <img src={coloredCloudImg} style={{width: '500px'}}/>
                            </li>
                            <li><u>Show number of curated objects per paper</u> (advanced options): uses WormBase API to retrieve the number of objects
                                already curated for each paper returned by searches and display the count in the reference list. This option is disabled
                                by default since it may slow down searches. It can be enabled through the 'advanced options' menu.
                            </li>
                        </ul>
                    </ul>
                </Col>
            </Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row>
                <Col>
                    <h5>Version 1.0</h5>
                    <ul>
                        <li><strong>Release date:</strong> January 2021</li>
                        <li><strong>Main Features:</strong></li>
                        <ul>
                            <li>Search the <i>C. elegans</i> literature and display summaries of scientific articles through word clouds</li>
                            <li>View details of the articles through the reference widget</li>
                            <li>Analyze word trends over time</li>
                        </ul>
                    </ul>
                </Col>
            </Row>
            <Row><Col>&nbsp;</Col></Row>
            <Row>
                <Col>
                    <h5>References</h5>
                    <ul>
                        <li>
                            Valerio Arnaboldi, Jaehyoung Cho, Paul W Sternberg, Wormicloud: a new text summarization tool based on word clouds to explore the C. elegans literature, Database, Volume 2021, 2021, baab015 <a target="_blank" href="https://doi.org/10.1093/database/baab015">https://doi.org/10.1093/database/baab015</a>
                        </li>
                    </ul>
                </Col>
            </Row>
        </Container>
    );
}

export default ChangeLog;
