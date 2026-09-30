//src/pages/vendors/seedVendor.jsx
import {useEffect,useState} from 'react';
import {Container,Row,Col,Card,ListGroup,Button,Spinner,Alert,Image,Badge} from 'react-bootstrap';
import SortedList from '../../components/SortedList.jsx';
import SeedVendorForm from '../forms/vendors/seedVendorsForm.jsx';
import '../../styles/vendors.css';

export default function SeedVendorsPage(){
	const [items,setItems]=useState([]);
	const [loading,setLoading]=useState(true);
	const [error,setError]=useState('');
	const [showForm,setShowForm]=useState(false);
	const [selectedItem,setSelectedItem]=useState(null);
	const [mode,setMode]=useState('add');

	const loadItems=async()=>{
		setLoading(true);
		setError('');
		try{
			const res=await fetch('/api/seed-vendors');
			const data=await res.json();
			if(!res.ok)throw new Error(data?.message||'Failed to load vendors');
			const list=Array.isArray(data)?data:data?.data||[];
			setItems(list);
			setSelectedItem(prev=>prev?list.find(item=>item._id===prev._id)||list[0]||null:list[0]||null);
		}catch(err){
			setItems([]);
			setSelectedItem(null);
			setError(err.message||'Something went wrong');
		}finally{
			setLoading(false);
		}
	};

	useEffect(()=>{
		loadItems();
	},[]);

	const handleAdd=()=>{
		setMode('add');
		setSelectedItem(null);
		setShowForm(true);
	};

	const handleEdit=item=>{
		setMode('edit');
		setSelectedItem(item);
		setShowForm(true);
	};

	const handleCloseForm=()=>{
		setShowForm(false);
	};

	const handleSuccess=()=>{
		handleCloseForm();
		loadItems();
	};

	const handleDelete=async item=>{
		if(!item?._id)return;
		if(!window.confirm(`Delete ${item.name||item.companyName||'this vendor'}?`))return;

		setError('');
		try{
			const res=await fetch(`/api/seed-vendors/${item._id}`,{method:'DELETE'});
			const data=await res.json();
			if(!res.ok)throw new Error(data?.message||'Failed to delete vendor');
			await loadItems();
		}catch(err){
			setError(err.message||'Something went wrong');
		}
	};

	const formatContactName=value=>Array.isArray(value)?value.join(', '):value||'';

	const getLogoUrl=value=>{
		if(!value)return '';
		if(value.startsWith('http'))return value;
		if(value.startsWith('/'))return value;
		return `/logos/${value}`;
	};

	const getWebsiteUrl=value=>{
		if(!value)return '';
		if(value.startsWith('http://')||value.startsWith('https://'))return value;
		return `https://${value}`;
	};

	const Field=({label,value})=>(
		<div><span className="vendor-label">{label}:</span> <span className="vendor-field">{value||'Not listed'}</span></div>
	);

	const LinkField=({label,value,type})=>(
		<div>
			<span className="vendor-label">{label}:</span>{' '}
			<span className="vendor-field">
				{value?(
					<a href={type==='email'?`mailto:${value}`:getWebsiteUrl(value)} target={type==='email'?undefined:'_blank'} rel={type==='email'?undefined:'noreferrer'}>
						{value}
					</a>
				):'Not listed'}
			</span>
		</div>
	);

	return(
		<Container fluid className="py-4">
			<Row className="mb-3">
				<Col><h1 className="mb-0">Seed Vendors</h1></Col>
				<Col xs="auto">
					<Button onClick={handleAdd}>Add Vendor</Button>
				</Col>
			</Row>

			{error?<Alert variant="danger">{error}</Alert>:null}

			{loading?(
				<div className="text-center py-5">
					<Spinner animation="border" />
				</div>
			):(
				<Row className="g-4">
					<Col lg={3}>
						<Card>
							<Card.Header className="fw-bold">Vendor List</Card.Header>
							<SortedList
								as={ListGroup}
								variant="flush"
								className="vendor-list-scroll"
								items={items}
								getKey={item=>item._id}
								getLabel={item=>item.name||item.companyName||item.email||''}
								wrapItems={false}
								renderItem={item=>(
									<ListGroup.Item
										action
										active={selectedItem?._id===item._id}
										onClick={()=>setSelectedItem(item)}
									>
										<strong>{item.name||item.companyName||'Unnamed Vendor'}</strong>
										<div className="small text-muted">{item.companyName||item.email||''}</div>
									</ListGroup.Item>
								)}
							>
								<ListGroup.Item>No vendors found</ListGroup.Item>
							</SortedList>
						</Card>
					</Col>

					<Col lg={9}>
						{selectedItem?(
							<Card>
								<Card.Header className="d-flex justify-content-between align-items-center">
									<h3 className="mb-0">Vendor: {selectedItem.name||selectedItem.companyName||'Vendor Details'}</h3>
									<div className="d-flex gap-2">
										<Button size="sm" onClick={()=>handleEdit(selectedItem)}>Edit</Button>
										<Button size="sm" variant="danger" onClick={()=>handleDelete(selectedItem)}>Delete</Button>
									</div>
								</Card.Header>
								<Card.Body>
									<Row>
										<Col md={8}>
											<Row>
												<Col md={6} className="mb-3"><Field label="Name" value={selectedItem.name} /></Col>
												<Col md={6} className="mb-3"><Field label="Company Name" value={selectedItem.companyName} /></Col>
											</Row>
											<Row>
												<Col md={6} className="mb-3"><Field label="Contact Name" value={formatContactName(selectedItem.contactName)} /></Col>
												<Col md={6} className="mb-3"><LinkField label="Email" value={selectedItem.email} type="email" /></Col>
											</Row>
											<Row>
												<Col md={6} className="mb-3"><Field label="Phone" value={selectedItem.phone} /></Col>
												<Col md={6} className="mb-3"><Field label="Fax" value={selectedItem.fax} /></Col>
											</Row>
											<Row>
												<Col md={6} className="mb-3"><LinkField label="Website" value={selectedItem.website} type="website" /></Col>
												<Col md={6} className="mb-3">
													<span className="vendor-label">Status:</span>{' '}
													<Badge bg={selectedItem.isActive?'success':'secondary'}>{selectedItem.isActive?'Active':'Inactive'}</Badge>
												</Col>
											</Row>
											<Row>
												<Col md={6} className="mb-3"><Field label="Address 1" value={selectedItem.address1} /></Col>
												<Col md={6} className="mb-3"><Field label="Address 2" value={selectedItem.address2} /></Col>
											</Row>
											<Row>
												<Col md={4} className="mb-3"><Field label="City" value={selectedItem.city} /></Col>
												<Col md={4} className="mb-3"><Field label="State" value={selectedItem.state?.name||selectedItem.state} /></Col>
												<Col md={4} className="mb-3"><Field label="Postal Code" value={selectedItem.postalCode} /></Col>
											</Row>
											<Row>
												<Col md={6} className="mb-3"><Field label="Country" value={selectedItem.country?.name||selectedItem.country} /></Col>
												<Col md={6} className="mb-3"><Field label="International" value={selectedItem.isInternational?'Yes':'No'} /></Col>
											</Row>
										</Col>

										<Col md={4} className="mb-3">
											
											{selectedItem.logo?<Image src={getLogoUrl(selectedItem.logo)} thumbnail className="vendor-logo-img" />:<div className="vendor-field">No logo available</div>}
										</Col>
									</Row>

									<Row>
										<Col md={12} className="mb-3"><Field label="Description" value={selectedItem.description} /></Col>
									</Row>
								</Card.Body>
							</Card>
						):(
							<Card body>Select a vendor.</Card>
						)}
					</Col>
				</Row>
			)}

			<SeedVendorForm
				show={showForm}
				onHide={handleCloseForm}
				onSuccess={handleSuccess}
				editId={mode==='edit'?selectedItem?._id:null}
				initialData={mode==='edit'?selectedItem:null}
				mode={mode}
			/>
		</Container>
	);
}
