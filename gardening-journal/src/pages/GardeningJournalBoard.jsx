//pages/GardeningJournalBoard.jsx
import {useEffect,useState} from 'react';
import {Container,Row,Col,Card,Table,Badge,Button,Nav,Form} from 'react-bootstrap';
import {BarChart,Bar,LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid,Legend} from 'recharts';
import {Leaf,CalendarDays,Image,Search,NotebookTabs,Sun,CloudRain,Sprout,Droplets,Scissors,FlaskConical,CalendarCheck,Wheat} from 'lucide-react';
import {sortItems} from '../utils/sortItems.js';
import resolveUploadUrl from '../utils/resolveUploadUrl.js';
import dashboardHero from '../images/dashboard.png';
import '../styles/gardenJournalBoard.css';

const getObjectId=value=>{
	if(!value)return "";
	if(typeof value==="string")return value;
	if(typeof value==="object"){
		if(typeof value.$oid==="string")return value.$oid;
		if(typeof value._id==="string")return value._id;
		if(typeof value.id==="string")return value.id;
		if(typeof value._id?.$oid==="string")return value._id.$oid;
		if(typeof value.id?.$oid==="string")return value.id.$oid;
	}
	return "";
};

export default function GardeningJournalBoard({user}){
	const [dashboard,setDashboard]=useState(null);
	const [calendarTab,setCalendarTab]=useState('indoor');
	const [selectedMonth,setSelectedMonth]=useState('All');
	const [selectedYear,setSelectedYear]=useState('2026');

	useEffect(()=>{
		const userId=getObjectId(user);
		const params=new URLSearchParams();
		if(userId)params.set('userId',userId);
		if(selectedYear)params.set('year',selectedYear);
		const query=params.toString()?`?${params.toString()}`:'';

		fetch(`/api/boardjournal${query}`)
			.then(res=>res.json())
			.then(data=>{
				setDashboard(data);
				setSelectedYear(String(data.year||2026));
			})
			.catch(err=>console.error(err));
	},[user,selectedYear]);

	if(!dashboard) return <div className="garden-page py-4">Loading...</div>;

	const months=dashboard.months||['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	const years=dashboard.years?.length?dashboard.years:[2024,2025,2026,2027];
	const selectedMonthIndex=months.indexOf(selectedMonth);
	const activeMonths=selectedMonth==='All'?months:[selectedMonth];
	const progress=dashboard.progress?.length?dashboard.progress:[35,40,45,50,55,62,68,74,80,86,92,38];

	const harvestLineTokens=[
		'var(--primary)',
		'var(--accent)',
		'var(--success)',
		'var(--warning)',
		'var(--info)',
		'var(--secondary)',
		'var(--danger)',
		'var(--accent2)'
	];

	const seeds=dashboard.seeds||[];
	const plants=dashboard.plants||[];

	const sortedSeeds=sortItems(seeds,seed=>seed.name||seed.variety||'');
	const sortedPlants=sortItems(plants,plant=>plant.name||plant.type||'');

	const harvestItems=dashboard.harvestItems||[];

	const sortedHarvestItems=sortItems(harvestItems,item=>item.name||item.source||'');

	const chartData=months.map((month,index)=>{
		const row={month,progress:progress[index]||0};
		sortedHarvestItems.forEach(item=>{
			row[item.name]=item.monthly?.[index]||0;
		});
		return row;
	}).filter(row=>selectedMonth==='All'||row.month===selectedMonth);

	const gardenAreas=dashboard.gardenAreas||[];

	const sortedGardenAreas=sortItems(gardenAreas,area=>area.name||'').map(area=>({
		...area,
		photos:sortItems(area.photos||[],photo=>photo.bedName||photo.name||'')
	}));

	const calendars=dashboard.calendars||{};

	const activeCalendar=calendars[calendarTab]||[];

        const renderPlantImage=(image,name)=>{
                const imageUrl=resolveUploadUrl(image,'plant');
                return(
                <div
                        className={imageUrl?"plant-img":"plant-img plant-img-empty"}
                        style={imageUrl?{backgroundImage:`url("${imageUrl}")`}:{}}
                        role={imageUrl?"img":undefined}
                        aria-label={imageUrl?`${name} image`:undefined}
                >
                        {!imageUrl&&<span>No image</span>}
                </div>
                );
        };

	const iconMap={
		leaf:<Leaf className="cell-icon" size={16}/>,
		sun:<Sun className="cell-icon sun" size={16}/>,
		rain:<CloudRain className="cell-icon rain" size={16}/>
	};

	return(
		<Container fluid className="garden-page py-4">
			<Card className="board-card garden-hero-card mb-3" style={{backgroundImage:`url(${dashboardHero})`}}>
				<Card.Body>
					<Row className="align-items-end g-3">
						<Col lg={7}><h1>Garden Overview</h1>
							<p>Track seed starts, active plants, harvest windows, photos, and seasonal garden work.</p>
						</Col>
						<Col lg={5}>
							<div className="garden-filter-panel">
								<Row className="g-2">
									<Col sm={6}>
										<Form.Label><h5>Month</h5></Form.Label>
										<Form.Select value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)}>
											<option value="All">All Months</option>
											{months.map(month=><option key={month} value={month}>{month}</option>)}
										</Form.Select>
									</Col>
									<Col sm={6}>
										<Form.Label><h5>Year</h5></Form.Label>
										<Form.Select value={selectedYear} onChange={e=>setSelectedYear(e.target.value)}>
											{years.map(year=><option key={year} value={year}>{year}</option>)}
										</Form.Select>
									</Col>
								</Row>
							</div>
						</Col>
					</Row>
				</Card.Body>
			</Card>

			<Row className="g-3">
				<Col lg={5}>
					<Card className="board-card mb-3">
						<Card.Body>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h4 className="mb-0"><Leaf size={22}/> Garden Progress</h4>
								<Badge bg="success">{selectedYear}</Badge>
							</div>

							<div className="chart-box">
								<ResponsiveContainer width="100%" height={220}>
									<BarChart data={chartData}>
										<CartesianGrid strokeDasharray="3 3"/>
										<XAxis dataKey="month"/>
										<YAxis/>
										<Tooltip/>
										<Bar dataKey="progress" fill="var(--primary)"/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</Card.Body>
					</Card>

					<Card className="board-card mb-3">
						<Card.Body>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h4 className="mb-0"><Wheat size={22}/> Harvest By Plant</h4>
								<Badge bg="success">{sortedHarvestItems.length} tracked</Badge>
							</div>

							<div className="chart-box">
								<ResponsiveContainer width="100%" height={240}>
									<LineChart data={chartData}>
										<CartesianGrid strokeDasharray="3 3"/>
										<XAxis dataKey="month"/>
										<YAxis/>
										<Tooltip/>
										<Legend/>
										{sortedHarvestItems.map((item,index)=>(
											<Line
												key={item._id}
												type="monotone"
												dataKey={item.name}
												stroke={harvestLineTokens[index%harvestLineTokens.length]}
												dot={{fill:harvestLineTokens[index%harvestLineTokens.length],stroke:harvestLineTokens[index%harvestLineTokens.length]}}
												activeDot={{r:6,fill:harvestLineTokens[index%harvestLineTokens.length],stroke:harvestLineTokens[index%harvestLineTokens.length]}}
											/>
										))}
									</LineChart>
								</ResponsiveContainer>
							</div>

							<Row className="g-2 mt-3">
								{!sortedHarvestItems.length&&(
									<Col xs={12}><div className="journal-board-empty">No harvest records found for this board.</div></Col>
								)}
								{sortedHarvestItems.map((item,index)=>(
									<Col md={6} key={item._id}>
										<Card className="plant-card harvest-card" style={{borderColor:harvestLineTokens[index%harvestLineTokens.length]}}>
											<Card.Body>
												<div className="d-flex justify-content-between align-items-start mb-2">
													<h6>{item.name}</h6>
													<Badge bg="success">{item.status}</Badge>
												</div>
												<p>{item.source}</p>
												<small><CalendarCheck size={13}/> Window: {item.expectedStart} - {item.expectedEnd}</small>
												<small><Wheat size={13}/> Harvested: {selectedMonth==='All'?item.totalHarvested:`${item.monthly?.[selectedMonthIndex]||0}`}</small>
											</Card.Body>
										</Card>
									</Col>
								))}
							</Row>
						</Card.Body>
					</Card>

					<Card className="board-card mb-3">
						<Card.Body>
							<h5><Image size={20}/> Garden Photos</h5>

							{sortedGardenAreas.map(area=>(
								<div className="mb-4" key={area.name}>
									<h6 className="area-photo-title">{area.name}</h6>
									<Row className="g-3">
										{area.photos.map(photo=>(
											<Col md={3} sm={6} xs={6} key={photo._id}>
												<Card className="garden-photo-card">
													<div
														className="garden-photo-img"
                                                                                                                style={resolveUploadUrl(photo,'plant')?{backgroundImage:`url("${resolveUploadUrl(photo,'plant')}")`}:{}}
													></div>
													<Card.Body>
														<h6>{photo.bedName}</h6>
													</Card.Body>
												</Card>
											</Col>
										))}
									</Row>
								</div>
							))}
							{!sortedGardenAreas.length&&<div className="journal-board-empty">No garden areas or sections found.</div>}
						</Card.Body>
					</Card>
				</Col>

				<Col lg={7}>
					<Card className="board-card mb-3">
						<Card.Body>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h4 className="mb-0"><Sprout size={22}/> Seed Starts</h4>
								<Badge bg="success">{sortedSeeds.length} active</Badge>
							</div>

							<Row className="g-3">
								{!sortedSeeds.length&&(
									<Col xs={12}><div className="journal-board-empty">No seed records found.</div></Col>
								)}
								{sortedSeeds.map(seed=>(
									<Col xl={3} md={6} key={seed._id}>
										<Card className="plant-card seed-card">
											{renderPlantImage(seed.image,seed.name)}
											<Card.Body>
												<div className="d-flex justify-content-between align-items-start mb-2">
													<h6>{seed.name}</h6>
													<Badge bg="success">{seed.status}</Badge>
												</div>
												<p>{seed.variety}</p>
												{seed.started&&(
													<small><CalendarCheck size={13}/> Started: {seed.started}</small>
												)}
												<small><Sprout size={13}/> Germination: {seed.germination}</small>
												<small><Droplets size={13}/> Medium: {seed.medium}</small>
											</Card.Body>
										</Card>
									</Col>
								))}
							</Row>
						</Card.Body>
					</Card>

					<Card className="board-card mb-3">
						<Card.Body>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h4 className="mb-0"><Leaf size={22}/> Active Plants</h4>
								<Badge bg="success">{sortedPlants.length} growing</Badge>
							</div>

							<Row className="g-3">
								{!sortedPlants.length&&(
									<Col xs={12}><div className="journal-board-empty">No active plantings found.</div></Col>
								)}
								{sortedPlants.map(plant=>(
									<Col xl={3} md={6} key={plant._id}>
										<Card className="plant-card active-plant-card">
											{renderPlantImage(plant.image,plant.name)}
											<Card.Body>
												<div className="d-flex justify-content-between align-items-start mb-2">
													<h6>{plant.name}</h6>
													<Badge bg="secondary">{plant.stage}</Badge>
												</div>
												<p>{plant.type}</p>
												<small><FlaskConical size={13}/> Last fed: {plant.lastFed}</small>
												<small><Scissors size={13}/> Next: {plant.nextTask}</small>
											</Card.Body>
										</Card>
									</Col>
								))}
							</Row>
						</Card.Body>
					</Card>

					<Card className="board-card">
						<Card.Body>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<h4 className="mb-0"><CalendarDays size={22}/> Planting Calendar</h4>
								<Button size="sm" variant="outline-success"><Search size={15}/> Inspect</Button>
							</div>

							<Nav variant="tabs" activeKey={calendarTab} onSelect={key=>setCalendarTab(key)} className="garden-calendar-tabs mb-3">
								<Nav.Item><Nav.Link eventKey="indoor">Indoor</Nav.Link></Nav.Item>
								<Nav.Item><Nav.Link eventKey="outdoor">Outdoor</Nav.Link></Nav.Item>
								<Nav.Item><Nav.Link eventKey="hydroponic">Hydroponic</Nav.Link></Nav.Item>
								<Nav.Item><Nav.Link eventKey="aeroponic">Aeroponic</Nav.Link></Nav.Item>
								<Nav.Item><Nav.Link eventKey="aquaponic">Aquaponic</Nav.Link></Nav.Item>
							</Nav>

							<Table bordered responsive className="garden-table">
								<thead>
									<tr>
										<th><NotebookTabs size={16}/> Garden Work</th>
										{activeMonths.map(month=><th key={month}>{month}</th>)}
									</tr>
								</thead>
								<tbody>
									{!activeCalendar.length&&(
										<tr>
											<td colSpan={activeMonths.length+1}>No calendar records found.</td>
										</tr>
									)}
									{activeCalendar.map(row=>(
										<tr key={row.task}>
											<td>{row.task}</td>
											{activeMonths.map(month=>{
												const index=months.indexOf(month);
												return(
													<td key={month}>
														{(row.months?.[index]||[]).map((item,i)=>(
															<span className="calendar-pill" key={i}>{iconMap[item]||item}</span>
														))}
													</td>
												);
											})}
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
