import {useEffect,useMemo,useState} from "react";
import {Badge,Button,Card,Col,Container,ListGroup,Modal,Row,Spinner,Table} from "react-bootstrap";
import {Archive, Eye, Pencil, Plus, Trash2} from "lucide-react";
import SortedList from "../../components/SortedList.jsx";
import SeedCollectionForm from "../forms/seeds/SeedCollectionForm.jsx";
import SeedFormPage from "../forms/seeds/SeedFormPage.jsx";
import "./seedCollections.css";

const readJsonResponse=async res=>{
	try{
		return await res.json();
	}catch{
		return {};
	}
};

function SeedCollectionsPage({user}){
	const [collections,setCollections]=useState([]);
	const [seeds,setSeeds]=useState([]);
	const [vendors,setVendors]=useState([]);
	const [selectedSeedId,setSelectedSeedId]=useState("");
	const [detailCollection,setDetailCollection]=useState(null);
	const [loading,setLoading]=useState(true);
	const [error,setError]=useState("");
	const [showForm,setShowForm]=useState(false);
	const [formMode,setFormMode]=useState("add");
	const [editingCollection,setEditingCollection]=useState(null);
	const [showSeedForm,setShowSeedForm]=useState(false);
	const [createdSeedId,setCreatedSeedId]=useState("");
	const [deleteCollection,setDeleteCollection]=useState(null);
	const [deleting,setDeleting]=useState(false);

	const getId=value=>{
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

	const userId=getId(user);

	const seedGroups=useMemo(()=>{
		const groups=new Map();

		collections.forEach(collection=>{
			const seedId=getId(collection.seed);
			if(!seedId)return;

			const seed=seeds.find(item=>getId(item)===seedId)||collection.seed||{};
			const existing=groups.get(seedId)||{
				seedId,
				seed,
				collections:[],
				totalCount:0,
				latestDate:null,
				labelColor:collection.labelColor||"#0f7d4f"
			};

			existing.collections.push(collection);
			existing.totalCount+=Number(collection.seedCount||0);

			const collectedDate=collection.dateCollected ? new Date(collection.dateCollected) : null;
			if(collectedDate&&!Number.isNaN(collectedDate.getTime())){
				if(!existing.latestDate||collectedDate>existing.latestDate)existing.latestDate=collectedDate;
			}

			groups.set(seedId,existing);
		});

		return [...groups.values()].sort((a,b)=>(a.seed?.plantName||"").localeCompare(b.seed?.plantName||""));
	},[collections,seeds]);

	const selectedSeedGroup=useMemo(()=>{
		return seedGroups.find(group=>group.seedId===selectedSeedId)||seedGroups[0]||null;
	},[seedGroups,selectedSeedId]);

	const selectedSeed=selectedSeedGroup?.seed||null;
	const selectedSeedCollections=selectedSeedGroup?.collections||[];

	const getSeedName=collectionOrSeed=>{
		if(collectionOrSeed?.seed)return collectionOrSeed.seed?.plantName||"Unnamed seed";
		return collectionOrSeed?.plantName||"Unnamed seed";
	};

	const sourceLabels={
		harvested:"Harvested",
		store_item:"Store item",
		gifted:"Gifted",
		purchased:"Purchased",
		traded:"Traded",
		saved:"Saved",
		other:"Other"
	};

	const getSourceLabel=collection=>{
		return sourceLabels[collection?.sourceType]||"Harvested";
	};

	const getVendorName=value=>{
		if(!value)return "";
		if(typeof value==="string")return "";
		return value.name||value.companyName||"";
	};

	const getAmountText=collection=>{
		if(collection?.seedCount===null||collection?.seedCount===undefined)return "Not counted";
		return `${collection.seedCount} ${collection.amountUnit||"seeds"}`;
	};

	const formatDate=value=>{
		if(!value)return "Not recorded";
		const date=new Date(value);
		if(Number.isNaN(date.getTime()))return "Not recorded";
		return date.toLocaleDateString();
	};

	const fetchData=async()=>{
		try{
			setLoading(true);
			setError("");

			const collectionUrl=userId ? `/api/seed-collections/user/${userId}` : "/api/seed-collections";
			const [collectionRes,seedRes,vendorRes]=await Promise.all([
				fetch(collectionUrl),
				fetch("/api/seeds"),
				fetch("/api/seed-vendors")
			]);
			const [collectionData,seedData,vendorData]=await Promise.all([
				readJsonResponse(collectionRes),
				readJsonResponse(seedRes),
				readJsonResponse(vendorRes)
			]);

			if(!collectionRes.ok)throw new Error(collectionData.message||"Failed to load seed collections");
			if(!seedRes.ok)throw new Error(seedData.message||"Failed to load seeds");
			if(!vendorRes.ok)throw new Error(vendorData.message||"Failed to load seed vendors");

			const rows=Array.isArray(collectionData) ? collectionData : [];
			setCollections(rows);
			setSeeds(Array.isArray(seedData) ? seedData : []);
			setVendors(Array.isArray(vendorData) ? vendorData : []);
			setSelectedSeedId(prev=>{
				if(prev&&rows.some(item=>getId(item.seed)===prev))return prev;
				return getId(rows[0]?.seed);
			});
		}catch(err){
			setError(err.message||"Unable to load seed collections");
		}finally{
			setLoading(false);
		}
	};

	useEffect(()=>{
		fetchData();
	},[userId]);

	const openAddForm=()=>{
		setFormMode("add");
		setEditingCollection(null);
		setCreatedSeedId(selectedSeedGroup?.seedId||"");
		setDetailCollection(null);
		setShowForm(true);
	};

	const openEditForm=collection=>{
		setFormMode("edit");
		setEditingCollection(collection);
		setCreatedSeedId("");
		setDetailCollection(null);
		setShowForm(true);
	};

	const closeForm=()=>{
		setShowForm(false);
		setFormMode("add");
		setEditingCollection(null);
		setCreatedSeedId("");
	};

	const handleSeedSaved=savedSeed=>{
		if(savedSeed?._id){
			setSeeds(prev=>{
				const exists=prev.some(seed=>seed._id===savedSeed._id);
				if(exists)return prev.map(seed=>seed._id===savedSeed._id ? savedSeed : seed);
				return [savedSeed,...prev];
			});
			setCreatedSeedId(savedSeed._id);
		}

		setShowSeedForm(false);
	};

	const handleSaved=savedCollection=>{
		setCollections(prev=>{
			const exists=prev.some(item=>item._id===savedCollection._id);
			if(exists)return prev.map(item=>item._id===savedCollection._id ? savedCollection : item);
			return [savedCollection,...prev];
		});
		setSelectedSeedId(getId(savedCollection.seed));
		setDetailCollection(null);
		closeForm();
	};

	const handleDelete=async()=>{
		if(!deleteCollection?._id)return;

		try{
			setDeleting(true);
			const res=await fetch(`/api/seed-collections/${deleteCollection._id}`,{method:"DELETE"});
			const data=await readJsonResponse(res);

			if(!res.ok)throw new Error(data.message||"Failed to delete seed collection record");

			setCollections(prev=>{
				const next=prev.filter(item=>item._id!==deleteCollection._id);
				setSelectedSeedId(current=>next.some(item=>getId(item.seed)===current) ? current : getId(next[0]?.seed));
				return next;
			});
			setDeleteCollection(null);
			setDetailCollection(null);
		}catch(err){
			setError(err.message||"Unable to delete seed collection record");
		}finally{
			setDeleting(false);
		}
	};

	const renderCollectionDetailModal=()=>{
		const collection=detailCollection;
		const modalSeed=collection ? seeds.find(seed=>getId(seed)===getId(collection.seed))||collection.seed||{} : {};

		return(
			<Modal show={!!collection} onHide={()=>setDetailCollection(null)} size="xl" centered scrollable>
				<Modal.Header closeButton>
					<Modal.Title>{collection ? `${getSeedName(collection)} Collection Entry` : "Collection Entry"}</Modal.Title>
				</Modal.Header>
				{collection&&(
					<Modal.Body>
						<div className="seed-collection-detail seed-collection-modal-detail">
							<div className="seed-collection-detail-header">
								<div>
									<p>{getSourceLabel(collection)} • {collection.status}</p>
									<h2>{getSeedName(collection)}</h2>
								</div>
								<div className="d-flex gap-2">
									<Button type="button" variant="outline-success" size="sm" className="d-inline-flex align-items-center gap-1" onClick={()=>openEditForm(collection)}>
										<Pencil size={15}/>
										Edit
									</Button>
									<Button type="button" variant="outline-danger" size="sm" className="d-inline-flex align-items-center gap-1" onClick={()=>setDeleteCollection(collection)}>
										<Trash2 size={15}/>
										Delete
									</Button>
								</div>
							</div>

							<Row className="g-3">
								<Col md={4}>
									<div className="seed-collection-stat">
										<span>Date Collected</span>
										<strong>{formatDate(collection.dateCollected)}</strong>
									</div>
								</Col>
								<Col md={4}>
									<div className="seed-collection-stat">
										<span>Amount</span>
										<strong>{getAmountText(collection)}</strong>
									</div>
								</Col>
								<Col md={4}>
									<div className="seed-collection-stat seed-collection-color-stat" style={{borderLeftColor:collection.labelColor||"#0f7d4f"}}>
										<span>Status</span>
										<strong>{collection.status}</strong>
									</div>
								</Col>
								<Col md={6}>
									<Card className="seed-collection-info-card">
										<Card.Header><Archive size={16}/> Seed Details</Card.Header>
										<Card.Body>
											<dl>
												<dt>Seed</dt>
												<dd>{modalSeed?.plantName||"Unnamed seed"}</dd>
												<dt>Lot Number</dt>
												<dd>{modalSeed?.lotNumber||"Not listed"}</dd>
												<dt>Packed For</dt>
												<dd>{modalSeed?.packedFor||"Not listed"}</dd>
											</dl>
										</Card.Body>
									</Card>
								</Col>
								<Col md={6}>
									<Card className="seed-collection-info-card">
										<Card.Header>Collection Source</Card.Header>
										<Card.Body>
											<dl>
												<dt>Source Type</dt>
												<dd>{getSourceLabel(collection)}</dd>
												<dt>Vendor</dt>
												<dd>{getVendorName(collection.vendor)||"Not listed"}</dd>
												<dt>Source Name</dt>
												<dd>{collection.sourceName||"Not listed"}</dd>
											</dl>
										</Card.Body>
									</Card>
								</Col>
								<Col md={12}>
									<Card className="seed-collection-info-card">
										<Card.Header>Notes</Card.Header>
										<Card.Body>
											{collection.notes?.length?(
												<ul>
													{collection.notes.map((note,index)=>(
														<li key={`${note}-${index}`}>{note}</li>
													))}
												</ul>
											):(
												<p className="text-muted mb-0">No notes recorded.</p>
											)}
										</Card.Body>
									</Card>
								</Col>
							</Row>
						</div>
					</Modal.Body>
				)}
			</Modal>
		);
	};

	if(loading){
		return(
			<Container className="py-4">
				<Card body className="text-center">
					<Spinner animation="border" className="me-2"/>
					Loading seed collection...
				</Card>
			</Container>
		);
	}

	if(error){
		return(
			<Container className="py-4">
				<Card body className="text-danger">{error}</Card>
			</Container>
		);
	}

	return(
		<Container fluid className="py-4 seed-collections-page">
			<Row className="g-4">
				<Col xs={12}>
					<div className="seed-collections-header">
						<div>
							<p>Seed Inventory</p>
							<h1>Seed Collection</h1>
						</div>
						<Button type="button" variant="success" className="d-inline-flex align-items-center gap-2" onClick={openAddForm}>
							<Plus size={18}/>
							Add Collection
						</Button>
					</div>
				</Col>

				<Col lg={4} xl={3}>
					<Card className="seed-collection-list-card">
						<Card.Header className="fw-bold">Seeds With Collections</Card.Header>
						<SortedList
							as={ListGroup}
							variant="flush"
							items={seedGroups}
							getKey={group=>group.seedId}
							getLabel={group=>getSeedName(group.seed)}
							wrapItems={false}
							renderItem={group=>(
								<ListGroup.Item action active={selectedSeedGroup?.seedId===group.seedId} onClick={()=>setSelectedSeedId(group.seedId)}>
									<div className="seed-collection-list-row">
										<span className="seed-collection-color-dot" style={{backgroundColor:group.labelColor||"#0f7d4f"}}/>
										<div>
											<div className="d-flex justify-content-between gap-2">
												<strong>{getSeedName(group.seed)}</strong>
												<Badge bg="success">{group.collections.length}</Badge>
											</div>
											<div className="small text-muted">{group.totalCount||"Not counted"} seeds • Latest {formatDate(group.latestDate)}</div>
										</div>
									</div>
								</ListGroup.Item>
							)}
						>
							{seedGroups.length===0&&<ListGroup.Item>No seed collections found.</ListGroup.Item>}
						</SortedList>
					</Card>
				</Col>

				<Col lg={8} xl={9}>
					{!selectedSeedGroup?(
						<Card body>No seed selected.</Card>
					):(
						<div className="seed-collection-detail">
							<div className="seed-collection-detail-header">
								<div>
									<p>Collection Entries</p>
									<h2>{getSeedName(selectedSeed)}</h2>
								</div>
								<div className="seed-collection-summary">
									<Badge bg="success">{selectedSeedCollections.length} entries</Badge>
									<Badge bg="secondary">{selectedSeedGroup.totalCount||"Not counted"} seeds</Badge>
								</div>
							</div>

							<Table responsive className="seed-collection-table">
								<thead>
									<tr>
										<th>Date</th>
										<th>Amount</th>
										<th>Source</th>
										<th>Vendor / Source Name</th>
										<th>Status</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{selectedSeedCollections.map(collection=>(
										<tr key={collection._id}>
											<td>{formatDate(collection.dateCollected)}</td>
											<td>{getAmountText(collection)}</td>
											<td>{getSourceLabel(collection)}</td>
											<td>{getVendorName(collection.vendor)||collection.sourceName||"Not listed"}</td>
											<td><Badge bg="success">{collection.status}</Badge></td>
											<td>
												<div className="seed-collection-table-actions">
													<Button type="button" variant="outline-primary" size="sm" className="d-inline-flex align-items-center gap-1" onClick={()=>setDetailCollection(collection)}>
														<Eye size={15}/>
														View
													</Button>
													<Button type="button" variant="outline-success" size="sm" className="d-inline-flex align-items-center gap-1" onClick={()=>openEditForm(collection)}>
														<Pencil size={15}/>
														Edit
													</Button>
													<Button type="button" variant="outline-danger" size="sm" className="d-inline-flex align-items-center gap-1" onClick={()=>setDeleteCollection(collection)}>
														<Trash2 size={15}/>
														Delete
													</Button>
												</div>
											</td>
										</tr>
									))}
									{selectedSeedCollections.length===0&&(
										<tr>
											<td colSpan={6}>No collection entries found for this seed.</td>
										</tr>
									)}
								</tbody>
							</Table>
						</div>
					)}
				</Col>
			</Row>

			{renderCollectionDetailModal()}

			<Modal show={showForm} onHide={closeForm} centered backdrop="static">
				<Modal.Header closeButton>
					<Modal.Title>{formMode==="edit" ? "Edit Seed Collection" : "Add Seed Collection"}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<SeedCollectionForm
						mode={formMode}
						initialCollection={editingCollection}
						seeds={seeds}
						vendors={vendors}
						selectedSeedId={createdSeedId}
						user={user}
						onSaved={handleSaved}
						onCancel={closeForm}
						onAddSeed={()=>setShowSeedForm(true)}
					/>
				</Modal.Body>
			</Modal>

			<Modal show={showSeedForm} onHide={()=>setShowSeedForm(false)} size="xl" fullscreen="lg-down" scrollable className="seed-form-modal">
				<Modal.Header closeButton>
					<Modal.Title>Add Seed</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<SeedFormPage
						mode="add"
						embedded
						user={user}
						onSaved={handleSeedSaved}
						onCancel={()=>setShowSeedForm(false)}
					/>
				</Modal.Body>
			</Modal>

			<Modal show={!!deleteCollection} onHide={()=>setDeleteCollection(null)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Delete Collection Record</Modal.Title>
				</Modal.Header>
				<Modal.Body>Delete this seed collection record?</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={()=>setDeleteCollection(null)}>Cancel</Button>
					<Button variant="danger" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	);
}

export default SeedCollectionsPage;
