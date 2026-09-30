import {useEffect,useMemo,useState} from "react";
import {Container,Row,Col,Card,Form,InputGroup,Button,Badge,Alert} from "react-bootstrap";
import {CalendarDays,NotebookPen,Sprout,Droplets,Wrench,Leaf,Clock3,Flag} from "lucide-react";
import {sortItems} from "../../utils/sortItems.js";
import "../../styles/journalPage.css";

const entryTypes=[
	{value:"note",label:"Note"},
	{value:"maintenance",label:"Maintenance"},
	{value:"watering",label:"Watering"},
	{value:"feeding",label:"Feeding"},
	{value:"pruning",label:"Pruning / Trim"},
	{value:"hydro-refill",label:"Hydro Refill"},
	{value:"hydro-cleaning",label:"Hydro Cleaning"},
	{value:"observation",label:"Observation"},
	{value:"harvest",label:"Harvest"},
	{value:"transplant",label:"Transplant"},
	{value:"pest",label:"Pest"},
	{value:"disease",label:"Disease"},
	{value:"equipment",label:"Equipment"},
	{value:"other",label:"Other"}
];

const outcomes=[
	{value:"",label:"No outcome"},
	{value:"planned",label:"Planned"},
	{value:"completed",label:"Completed"},
	{value:"partial",label:"Partial"},
	{value:"needs-follow-up",label:"Needs Follow-up"},
	{value:"failed",label:"Failed"},
	{value:"resolved",label:"Resolved"}
];

const defaultEntryForm={
	entryDate:"",
	entryType:"maintenance",
	title:"",
	entry:"",
	maintenanceType:"",
	outcome:"completed",
	durationMinutes:"",
	followUpDate:"",
	planting:"",
	seed:"",
	plant:"",
	garden:"",
	gardenSection:"",
	hydroSystem:"",
	hydroDevice:"",
	hydroPodPosition:"",
	equipment:"",
	tags:""
};

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

const formatDateForInput=value=>{
	const date=value ? new Date(value) : new Date();
	if(Number.isNaN(date.getTime()))return "";
	return date.toISOString().slice(0,10);
};

const formatDate=value=>{
	if(!value)return "No date";
	const date=new Date(value);
	if(Number.isNaN(date.getTime()))return "No date";
	return date.toLocaleDateString();
};

const getSeedLabel=seed=>seed?.plantName||seed?.name||seed?.title||"Unnamed Seed";
const getPlantLabel=plant=>plant?.name||plant?.plantName||plant?.title||"Unnamed Plant";
const getGardenLabel=garden=>garden?.name||garden?.title||"Unnamed Garden";
const getSectionLabel=section=>section?.name||section?.title||"Unnamed Section";
const getEquipmentLabel=equipment=>[equipment?.name,equipment?.brand,equipment?.model].filter(Boolean).join(" • ")||"Unnamed Equipment";
const getHydroLabel=system=>system?.name||system?.model||"Unnamed Hydro Run";
const getPlantingLabel=planting=>planting?.instanceName||getSeedLabel(planting?.seed)||getPlantLabel(planting?.plant)||"Growing Instance";

const unwrapRows=value=>{
	if(Array.isArray(value))return value;
	if(Array.isArray(value?.data))return value.data;
	if(Array.isArray(value?.items))return value.items;
	if(Array.isArray(value?.results))return value.results;
	return [];
};

const loadRows=async url=>{
	const res=await fetch(url);
	const data=await res.json().catch(()=>[]);
	if(!res.ok)return [];
	return unwrapRows(data);
};

export default function JournalPage({user}){
	const [entryForm,setEntryForm]=useState({...defaultEntryForm,entryDate:formatDateForInput(new Date())});
	const [journalEntries,setJournalEntries]=useState([]);
	const [plantings,setPlantings]=useState([]);
	const [seedRecords,setSeedRecords]=useState([]);
	const [plantRecords,setPlantRecords]=useState([]);
	const [gardens,setGardens]=useState([]);
	const [gardenSections,setGardenSections]=useState([]);
	const [hydroSystems,setHydroSystems]=useState([]);
	const [equipmentRecords,setEquipmentRecords]=useState([]);
	const [saving,setSaving]=useState(false);
	const [loading,setLoading]=useState(true);
	const [error,setError]=useState("");
	const [success,setSuccess]=useState("");

	useEffect(()=>{
		let ignore=false;

		const loadJournalData=async()=>{
			try{
				setLoading(true);

				const [entriesData,plantingsData,seedsData,plantsData,gardensData,sectionsData,hydroData,equipmentData]=await Promise.all([
					loadRows("/api/journal-entries"),
					loadRows("/api/plantings"),
					loadRows("/api/seeds"),
					loadRows("/api/plants"),
					loadRows("/api/gardens"),
					loadRows("/api/garden-sections"),
					loadRows("/api/hydro-systems"),
					loadRows("/api/equipment")
				]);

				if(ignore)return;

				setJournalEntries(entriesData);
				setPlantings(plantingsData);
				setSeedRecords(seedsData);
				setPlantRecords(plantsData);
				setGardens(gardensData);
				setGardenSections(sectionsData);
				setHydroSystems(hydroData);
				setEquipmentRecords(equipmentData);
			}catch(err){
				if(!ignore)setError(err.message||"Failed to load journal data");
			}finally{
				if(!ignore)setLoading(false);
			}
		};

		loadJournalData();

		return()=>{
			ignore=true;
		};
	},[]);

	const selectedHydroSystem=useMemo(()=>{
		return hydroSystems.find(system=>getObjectId(system)===entryForm.hydroSystem)||null;
	},[hydroSystems,entryForm.hydroSystem]);

	const hydroDevices=useMemo(()=>{
		return selectedHydroSystem?.devices||[];
	},[selectedHydroSystem]);

	const selectedHydroDevice=useMemo(()=>{
		return hydroDevices.find(device=>getObjectId(device)===entryForm.hydroDevice)||null;
	},[hydroDevices,entryForm.hydroDevice]);

	const sortedEntries=useMemo(()=>{
		return [...journalEntries].sort((a,b)=>new Date(b.entryDate||b.createdAt||0)-new Date(a.entryDate||a.createdAt||0));
	},[journalEntries]);

	const handleEntryChange=e=>{
		const {name,value}=e.target;

		setEntryForm(prev=>{
			const next={...prev,[name]:value};

			if(name==="hydroSystem"){
				next.hydroDevice="";
				next.hydroPodPosition="";
			}

			if(name==="hydroDevice"){
				next.hydroPodPosition="";
			}

			return next;
		});
	};

	const handleEntrySubmit=async e=>{
		e.preventDefault();

		try{
			setSaving(true);
			setError("");
			setSuccess("");

			const payload={
				...entryForm,
				durationMinutes:entryForm.durationMinutes==="" ? 0 : Number(entryForm.durationMinutes),
				hydroPodPosition:entryForm.hydroPodPosition==="" ? null : Number(entryForm.hydroPodPosition),
				followUpDate:entryForm.followUpDate||null,
				tags:entryForm.tags.split(",").map(item=>item.trim()).filter(Boolean),
				createdBy:getObjectId(user)
			};

			const res=await fetch("/api/journal-entries",{
				method:"POST",
				headers:{"Content-Type":"application/json"},
				body:JSON.stringify(payload)
			});

			const data=await res.json().catch(()=>({}));
			if(!res.ok)throw new Error(data.message||"Failed to save journal entry");

			setJournalEntries(prev=>[data,...prev]);
			setEntryForm({...defaultEntryForm,entryDate:formatDateForInput(new Date())});
			setSuccess("Journal entry saved.");
		}catch(err){
			setError(err.message||"Failed to save journal entry");
		}finally{
			setSaving(false);
		}
	};

	const renderLinkedTargets=entry=>{
		const targets=[
			entry.planting&&`Instance: ${getPlantingLabel(entry.planting)}`,
			entry.seed&&`Seed: ${getSeedLabel(entry.seed)}`,
			entry.plant&&`Plant: ${getPlantLabel(entry.plant)}`,
			entry.hydroSystem&&`Hydro: ${getHydroLabel(entry.hydroSystem)}`,
			entry.hydroPodPosition&&`Pod ${entry.hydroPodPosition}`,
			entry.equipment&&`Equipment: ${getEquipmentLabel(entry.equipment)}`,
			entry.garden&&`Garden: ${getGardenLabel(entry.garden)}`,
			entry.gardenSection&&`Section: ${getSectionLabel(entry.gardenSection)}`
		].filter(Boolean);

		return targets.length ? targets.join(" • ") : "General journal entry";
	};

	return(
		<Container fluid className="journal-page py-4">
			<Card className="journal-hero">
				<Card.Body>
					<div>
						<p className="journal-kicker">Garden Journal</p>
						<h1>Log Daily Work, Maintenance & Growing Notes</h1>
						<p>Record what happened and connect it to the exact seed, plant, growing instance, hydro run, pod, equipment, garden, or section.</p>
					</div>

					<div className="journal-hero-count">
						<strong>{journalEntries.length}</strong>
						<span>entries</span>
					</div>
				</Card.Body>
			</Card>

			{error&&<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>}
			{success&&<Alert variant="success" dismissible onClose={()=>setSuccess("")}>{success}</Alert>}

			<Row className="g-4">
				<Col xl={8}>
					<Card className="journal-card">
						<Card.Header>
							<NotebookPen size={20}/>
							<span>New Journal Entry</span>
						</Card.Header>

						<Card.Body>
							<Form onSubmit={handleEntrySubmit}>
								<Row className="g-3">
									<Col md={3}>
										<InputGroup>
											<InputGroup.Text>Date</InputGroup.Text>
											<Form.Control type="date" name="entryDate" value={entryForm.entryDate} onChange={handleEntryChange}/>
										</InputGroup>
									</Col>

									<Col md={3}>
										<InputGroup>
											<InputGroup.Text>Type</InputGroup.Text>
											<Form.Select name="entryType" value={entryForm.entryType} onChange={handleEntryChange}>
												{entryTypes.map(type=><option key={type.value} value={type.value}>{type.label}</option>)}
											</Form.Select>
										</InputGroup>
									</Col>

									<Col md={3}>
										<InputGroup>
											<InputGroup.Text>Outcome</InputGroup.Text>
											<Form.Select name="outcome" value={entryForm.outcome} onChange={handleEntryChange}>
												{outcomes.map(outcome=><option key={outcome.value} value={outcome.value}>{outcome.label}</option>)}
											</Form.Select>
										</InputGroup>
									</Col>

									<Col md={3}>
										<InputGroup>
											<InputGroup.Text>Minutes</InputGroup.Text>
											<Form.Control type="number" min="0" name="durationMinutes" value={entryForm.durationMinutes} onChange={handleEntryChange}/>
										</InputGroup>
									</Col>

									<Col md={6}>
										<InputGroup>
											<InputGroup.Text>Title</InputGroup.Text>
											<Form.Control name="title" value={entryForm.title} onChange={handleEntryChange} placeholder="Trimmed dead leaves, refilled iDoo, checked thyme pod"/>
										</InputGroup>
									</Col>

									<Col md={3}>
										<InputGroup>
											<InputGroup.Text>Maintenance</InputGroup.Text>
											<Form.Control name="maintenanceType" value={entryForm.maintenanceType} onChange={handleEntryChange} placeholder="Trim, refill, pH check"/>
										</InputGroup>
									</Col>

									<Col md={3}>
										<InputGroup>
											<InputGroup.Text>Follow-up</InputGroup.Text>
											<Form.Control type="date" name="followUpDate" value={entryForm.followUpDate} onChange={handleEntryChange}/>
										</InputGroup>
									</Col>

									<Col md={4}>
										<InputGroup>
											<InputGroup.Text>Instance</InputGroup.Text>
											<Form.Select name="planting" value={entryForm.planting} onChange={handleEntryChange}>
												<option value="">Select growing instance</option>
												{sortItems(plantings,getPlantingLabel).map(item=><option key={getObjectId(item)} value={getObjectId(item)}>{getPlantingLabel(item)}</option>)}
											</Form.Select>
										</InputGroup>
									</Col>

									<Col md={4}>
										<InputGroup>
											<InputGroup.Text>Seed</InputGroup.Text>
											<Form.Select name="seed" value={entryForm.seed} onChange={handleEntryChange}>
												<option value="">Select seed record</option>
												{sortItems(seedRecords,getSeedLabel).map(item=><option key={getObjectId(item)} value={getObjectId(item)}>{getSeedLabel(item)}</option>)}
											</Form.Select>
										</InputGroup>
									</Col>

									<Col md={4}>
										<InputGroup>
											<InputGroup.Text>Plant</InputGroup.Text>
											<Form.Select name="plant" value={entryForm.plant} onChange={handleEntryChange}>
												<option value="">Select plant record</option>
												{sortItems(plantRecords,getPlantLabel).map(item=><option key={getObjectId(item)} value={getObjectId(item)}>{getPlantLabel(item)}</option>)}
											</Form.Select>
										</InputGroup>
									</Col>

									<Col md={3}>
										<InputGroup>
											<InputGroup.Text>Garden</InputGroup.Text>
											<Form.Select name="garden" value={entryForm.garden} onChange={handleEntryChange}>
												<option value="">Select garden</option>
												{sortItems(gardens,getGardenLabel).map(item=><option key={getObjectId(item)} value={getObjectId(item)}>{getGardenLabel(item)}</option>)}
											</Form.Select>
										</InputGroup>
									</Col>

									<Col md={3}>
										<InputGroup>
											<InputGroup.Text>Section</InputGroup.Text>
											<Form.Select name="gardenSection" value={entryForm.gardenSection} onChange={handleEntryChange}>
												<option value="">Select section</option>
												{sortItems(gardenSections,getSectionLabel).map(item=><option key={getObjectId(item)} value={getObjectId(item)}>{getSectionLabel(item)}</option>)}
											</Form.Select>
										</InputGroup>
									</Col>

									<Col md={3}>
										<InputGroup>
											<InputGroup.Text>Hydro</InputGroup.Text>
											<Form.Select name="hydroSystem" value={entryForm.hydroSystem} onChange={handleEntryChange}>
												<option value="">Select hydro run</option>
												{sortItems(hydroSystems,getHydroLabel).map(item=><option key={getObjectId(item)} value={getObjectId(item)}>{getHydroLabel(item)}</option>)}
											</Form.Select>
										</InputGroup>
									</Col>

									<Col md={3}>
										<InputGroup>
											<InputGroup.Text>Equipment</InputGroup.Text>
											<Form.Select name="equipment" value={entryForm.equipment} onChange={handleEntryChange}>
												<option value="">Select equipment</option>
												{sortItems(equipmentRecords,getEquipmentLabel).map(item=><option key={getObjectId(item)} value={getObjectId(item)}>{getEquipmentLabel(item)}</option>)}
											</Form.Select>
										</InputGroup>
									</Col>

									{selectedHydroSystem&&(
										<>
											<Col md={4}>
												<InputGroup>
													<InputGroup.Text>Device</InputGroup.Text>
													<Form.Select name="hydroDevice" value={entryForm.hydroDevice} onChange={handleEntryChange}>
														<option value="">Select device</option>
														{hydroDevices.map(device=><option key={getObjectId(device)} value={getObjectId(device)}>{device.name||device.model||"Hydro Device"}</option>)}
													</Form.Select>
												</InputGroup>
											</Col>

											<Col md={2}>
												<InputGroup>
													<InputGroup.Text>Pod</InputGroup.Text>
													<Form.Select name="hydroPodPosition" value={entryForm.hydroPodPosition} onChange={handleEntryChange}>
														<option value="">Any</option>
														{(selectedHydroDevice?.pods||[]).map(pod=><option key={pod.position} value={pod.position}>{pod.position}</option>)}
													</Form.Select>
												</InputGroup>
											</Col>
										</>
									)}

									<Col md={6}>
										<InputGroup>
											<InputGroup.Text>Tags</InputGroup.Text>
											<Form.Control name="tags" value={entryForm.tags} onChange={handleEntryChange} placeholder="hydro, refill, thyme, maintenance"/>
										</InputGroup>
									</Col>

									<Col xs={12}>
										<Form.Control as="textarea" rows={5} name="entry" value={entryForm.entry} onChange={handleEntryChange} placeholder="What did you do, what changed, and what should you check next?"/>
									</Col>

									<Col xs={12} className="d-flex justify-content-end">
										<Button type="submit" disabled={saving}>
											{saving ? "Saving..." : "Save Journal Entry"}
										</Button>
									</Col>
								</Row>
							</Form>
						</Card.Body>
					</Card>
				</Col>

				<Col xl={4}>
					<Card className="journal-card journal-list-card">
						<Card.Header>
							<CalendarDays size={20}/>
							<span>Recent Entries</span>
						</Card.Header>

						<Card.Body>
							{loading&&<div className="journal-empty">Loading journal entries...</div>}

							{!loading&&!sortedEntries.length&&(
								<div className="journal-empty">No journal entries yet.</div>
							)}

							{!loading&&sortedEntries.map(entry=>(
								<article className="journal-entry-item" key={getObjectId(entry)||entry.title||entry.createdAt}>
									<div className="journal-entry-head">
										<h3>{entry.title||"Untitled entry"}</h3>
										<Badge bg={entry.outcome==="needs-follow-up" ? "warning" : "success"}>{entry.outcome||entry.entryType||"entry"}</Badge>
									</div>

									<div className="journal-entry-meta">
										<span><CalendarDays size={14}/>{formatDate(entry.entryDate||entry.createdAt)}</span>
										{entry.entryType&&<span><Flag size={14}/>{entry.entryType}</span>}
										{!!entry.durationMinutes&&<span><Clock3 size={14}/>{entry.durationMinutes} min</span>}
									</div>

									<p>{entry.entry||"No notes added."}</p>
									<div className="journal-entry-targets">{renderLinkedTargets(entry)}</div>

									{entry.followUpDate&&(
										<div className="journal-follow-up">Follow up: {formatDate(entry.followUpDate)}</div>
									)}
								</article>
							))}
						</Card.Body>
					</Card>

					<Card className="journal-card journal-reference-card">
						<Card.Header>
							<Leaf size={20}/>
							<span>Journal Covers</span>
						</Card.Header>

						<Card.Body>
							<div><Sprout size={16}/> Seed starts and seed records</div>
							<div><Leaf size={16}/> Plant records and growing instances</div>
							<div><Droplets size={16}/> Hydro runs, devices, pods, refills, and cleanings</div>
							<div><Wrench size={16}/> Equipment maintenance and vendor-linked devices</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
}
