import React, {useState} from 'react';
import {getCounters, getTrends} from "../redux/selectors/cloud";
import {connect} from "react-redux";
import {LineChart, CartesianGrid, XAxis, YAxis, Legend, Line, Tooltip, ResponsiveContainer} from 'recharts';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import FormCheck from "react-bootstrap/FormCheck";
import distinctColors from 'distinct-colors'

const Trends = (props) => {

	let startWords = props.counters.sort((a, b) => (a.value < b.value) ? 1 : -1).slice(
		0, Math.min(props.counters.length, 5)).map(c => c.text);
	const [chartWords, setChartWords] = useState(new Set(startWords));
	const [filterValue, setFilterValue] = useState('');
	const [filteredWords, setFilteredWords] = useState(startWords);
	const count = 5;
	const palette = distinctColors({count: 200});
	const [offset, setOffset] = useState(0);

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
						<LineChart data={props.trends}
								   margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip />
							<Legend />
							{[...chartWords].map((c, idx) => {return <Line type="monotone" dataKey={c} strokeWidth="3" stroke={palette[idx]} />
							})}
						</LineChart>
					</ResponsiveContainer>
				</Col>
				<Col sm={2}>
					{props.counters.length > 0 ?
						<Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
							<Row>
								<Col sm={7}>
									<FormControl size="sm" placeholder="Search all words" aria-label="Filter" aria-describedby="basic-addon1" value={filterValue} onChange={event => {
										if (event.target.value === '') {
											setFilterValue('');
											setFilteredWords([...chartWords]);
											setOffset(0);
										} else {
											setFilterValue(event.target.value);
											setOffset(0);
											setFilteredWords(props.counters.filter(c => c.text.startsWith(event.target.value)).map(c => c.text).sort());
										}
									}}/>
								</Col>
								<Col sm={5}>
									{filteredWords.length !== [...chartWords].length ?<Button variant="outline-primary" size="xs" onClick={() => {
										setFilterValue('');
										setFilteredWords([...chartWords]);
										setOffset(0)}}>back</Button> : ''}
								</Col>
							</Row>
							<Row>
								<Col>
									&nbsp;
								</Col>
							</Row>
						</Container> : ''}
					<Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
						{filteredWords.slice(offset, offset + count).map(w => {
							return <Row>
								<Col>
									<FormCheck type="checkbox" inline checked={chartWords.has(w)}
											   onClick={() => {
												   let tempWords = new Set(chartWords);
												   if (tempWords.has(w)) {
													   tempWords.delete(w)
												   } else {
													   tempWords.add(w);
												   }
												   setChartWords(tempWords);
											   }} />
									{w}
								</Col>
							</Row>
						})}
					</Container>
					<div>
						<br/>
						<Button size="sm" variant="outline-primary" hidden={offset === 0} onClick={() => setOffset(offset - count)}>
							prev
						</Button>
						<Button size="sm" variant="outline-primary" hidden={filteredWords.length <= offset + count} onClick={() => setOffset(offset + count)}>
							next
						</Button>
					</div>
				</Col>
			</Row>
		</Container>
	);
}

const mapStateToProps = state => ({
    trends: getTrends(state),
	counters: getCounters(state)
});

export default connect(mapStateToProps, {})(Trends)