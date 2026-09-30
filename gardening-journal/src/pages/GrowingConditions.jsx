//pages/GrowingConditions.jsx
import {useEffect,useState} from 'react';
import {Container,Row,Col,Card,Badge,Table,Spinner,Button} from 'react-bootstrap';
import {Map,CloudSun,Snowflake,CalendarDays,RefreshCw} from 'lucide-react';
import '../styles/gardenJournalBoard.css';

export default function GrowingConditions(){
	const [data,setData]=useState(null);
	const [loading,setLoading]=useState(false);

	const loadData=()=>{
		setLoading(true);
		fetch('/api/growing-conditions')
			.then(res=>res.json())
			.then(d=>setData(d))
			.catch(err=>console.error(err))
			.finally(()=>setLoading(false));
	};

	const runUpdate=()=>{
		setLoading(true);
		fetch('/api/growing-conditions/update',{method:'POST'})
			.then(()=>loadData())
			.catch(err=>console.error(err));
	};

	useEffect(()=>{loadData();},[]);

	if(!data)return <div className="garden-page py-4"><Spinner/></div>;

	const {weather,frost,calendar,months}=data;

	return(
		<Container fluid className="garden-page py-4">

			<Row className="g-3 mb-3">
				<Col>
					<div className="d-flex justify-content-end">
						<Button size="sm" variant="outline-success" onClick={runUpdate} disabled={loading}>
							<RefreshCw size={15}/> {loading?'Updating...':'Refresh Data'}
						</Button>
					</div>
				</Col>
			</Row>

			<Row className="g-3 mb-3">

				<Col lg={4}>
					<Card className="board-card">
						<Card.Body>
							<div className="d-flex justify-content-between align-items-center mb-2">
								<h5 className="mb-0"><CloudSun size={18}/> Current Weather</h5>
								<Badge bg="success">{weather?.date}</Badge>
							</div>
							<p>Temp: {weather?.tempMin}° / {weather?.tempMax}°</p>
							<p>Precip: {weather?.precip}</p>
							<p>Conditions: {weather?.conditions}</p>
						</Card.Body>
					</Card>
				</Col>

				<Col lg={4}>
					<Card className="board-card">
						<Card.Body>
							<div className="d-flex justify-content-between align-items-center mb-2">
								<h5 className="mb-0"><Snowflake size={18}/> Frost Status</h5>
								<Badge bg={frost?.isFrost?'danger':'success'}>
									{frost?.isFrost?'Frost':'Safe'}
								</Badge>
							</div>
							<p>Last Frost: {frost?.lastFrost}</p>
							<p>First Frost: {frost?.firstFrost}</p>
							<p>Days Since Last Frost: {frost?.daysSince}</p>
						</Card.Body>
					</Card>
				</Col>

				<Col lg={4}>
					<Card className="board-card">
						<Card.Body>
							<div className="d-flex justify-content-between align-items-center mb-2">
								<h5 className="mb-0"><Map size={18}/> Map</h5>
								<Badge bg="secondary">{data?.zip}</Badge>
							</div>
							<div style={{height:'180px',background:'var(--gradientSoft)',border:'4px solid var(--borderStrong)'}}></div>
						</Card.Body>
					</Card>
				</Col>

			</Row>

			<Row>
				<Col>
					<Card className="board-card">
						<Card.Body>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h4 className="mb-0"><CalendarDays size={20}/> Planting Calendar</h4>
								<Badge bg="success">{data?.year}</Badge>
							</div>

							<Table bordered responsive className="garden-table">
								<thead>
									<tr>
										<th>Task</th>
										{months.map(m=><th key={m}>{m}</th>)}
									</tr>
								</thead>
								<tbody>
									{calendar.map(row=>(
										<tr key={row.task}>
											<td>{row.task}</td>
											{row.months.map((cell,i)=>(
												<td key={i}>
													{cell.map((item,index)=>(
														<span key={index} className="calendar-pill">{item}</span>
													))}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</Table>

						</Card.Body>
					</Card>
				</Col>
			</Row>

		</Container>
	);
}