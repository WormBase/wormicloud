import React from 'react';
import {getCounters, getTrends} from "../redux/selectors";
import {connect} from "react-redux";
import {LineChart, CartesianGrid, XAxis, YAxis, Legend, Line, Tooltip, ResponsiveContainer} from 'recharts';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import FormCheck from "react-bootstrap/FormCheck";
import distinctColors from 'distinct-colors'

class Trends extends React.Component {

	constructor(props) {
		super(props);
		let startWords = props.counters.sort((a, b) => (a.value < b.value) ? 1 : -1).slice(
			0, Math.min(this.props.counters.length, 5)).map(c => c.text);
		this.state = {
			chartWords: new Set(startWords),
			filteredWords: startWords,
			count: 5,
			offset: 0,
			palette: distinctColors({count: 200}) // You may pass an optional config object
		}
	}


	render() {
		return (
			<Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
				<Row>
					<Col>
						&nbsp;
					</Col>
				</Row>
				<Row>
					<Col sm={10}>
						<ResponsiveContainer width="100%" height={400}>
							<LineChart data={this.props.trends}
									   margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Legend />
								{[...this.state.chartWords].map((c, idx) => {return <Line type="monotone" dataKey={c} strokeWidth="3" stroke={this.state.palette[idx]} />
								})}
							</LineChart>
						</ResponsiveContainer>
					</Col>
					<Col sm={2}>
						{this.props.counters.length > 0 ?
							<Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
								<Row>
									<Col sm={7}>
										<FormControl size="sm" placeholder="Search all words" aria-label="Filter" aria-describedby="basic-addon1" value={this.state.filterValue} onChange={event => {
											if (event.target.value === '') {
												this.setState({filterValue: '', filteredWords: [...this.state.chartWords], offset:0})
											} else {
												this.setState({filterValue: event.target.value, offset:0, filteredWords: this.props.counters.filter(c => c.text.startsWith(event.target.value)).map(c => c.text).sort()})
											}
										}}/>
									</Col>
									<Col sm={5}>
										{this.state.filteredWords.length !== [...this.state.chartWords].length ?<Button variant="outline-primary" size="xs" onClick={() => {this.setState({filterValue: '', filteredWords: [...this.state.chartWords], offset:0})}}>back</Button> : ''}
									</Col>
								</Row>
								<Row>
									<Col>
										&nbsp;
									</Col>
								</Row>
							</Container> : ''}
						<Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
							{this.state.filteredWords.slice(this.state.offset, this.state.offset + this.state.count).map(w => {
								return <Row>
									<Col>
										<FormCheck type="checkbox" inline checked={this.state.chartWords.has(w)}
												   onClick={() => {
													   let tempWords = this.state.chartWords;
													   if (tempWords.has(w)) {
														   tempWords.delete(w)
													   } else {
														   tempWords.add(w);
													   }
													   this.setState({chartWords: tempWords});
												   }} />
										{w}
									</Col>
								</Row>
							})}
						</Container>
						<div>
							<br/>
							<Button size="sm" variant="outline-primary" hidden={this.state.offset === 0} onClick={() => this.setState({offset: this.state.offset - this.state.count})}>
								prev
							</Button>
							<Button size="sm" variant="outline-primary" hidden={this.state.filteredWords.length <= this.state.offset + this.state.count} onClick={() => this.setState({offset: this.state.offset + this.state.count})}>
								next
							</Button>
						</div>
					</Col>
				</Row>
			</Container>
		);
	}
}

const mapStateToProps = state => ({
    trends: getTrends(state),
	counters: getCounters(state)
});

export default connect(mapStateToProps, {})(Trends)