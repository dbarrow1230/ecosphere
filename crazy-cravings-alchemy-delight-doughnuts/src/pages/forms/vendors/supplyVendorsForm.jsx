// src/pages/forms/vendors/supplyVendorsForm.jsx
import {useEffect,useState} from 'react';
import {Form,Button,Row,Col,Alert,Modal} from 'react-bootstrap';

export default function SupplyVendorsForm({show,onHide,onSuccess,editId=null,initialData=null,mode='add'}){
	const [form,setForm]=useState({
		name:'',
		companyName:'',
		contactName:'',
		email:'',
		phone:'',
		website:'',
		address1:'',
		address2:'',
		city:'',
		state:'',
		postalCode:'',
		country:'',
		isInternational:false,
		description:'',
		isActive:true
	});
	const [states,setStates]=useState([]);
	const [countries,setCountries]=useState([]);
	const [loading,setLoading]=useState(false);
	const [message,setMessage]=useState('');
	const [error,setError]=useState('');

	useEffect(()=>{
		const loadOptions=async()=>{
			try{
				const [statesRes,countriesRes]=await Promise.all([
					fetch('/api/states'),
					fetch('/api/countries')
				]);
				const [statesData,countriesData]=await Promise.all([
					statesRes.json(),
					countriesRes.json()
				]);
				setStates(Array.isArray(statesData)?statesData:statesData?.data||[]);
				setCountries(Array.isArray(countriesData)?countriesData:countriesData?.data||[]);
			}catch(err){
				setStates([]);
				setCountries([]);
			}
		};
		if(show)loadOptions();
	},[show]);

	useEffect(()=>{
		if(show&&initialData){
			setForm({
				name:initialData.name||'',
				companyName:initialData.companyName||'',
				contactName:initialData.contactName||'',
				email:initialData.email||'',
				phone:initialData.phone||'',
				website:initialData.website||'',
				address1:initialData.address1||'',
				address2:initialData.address2||'',
				city:initialData.city||'',
				state:initialData.state?._id||initialData.state||'',
				postalCode:initialData.postalCode||'',
				country:initialData.country?._id||initialData.country||'',
				isInternational:!!initialData.isInternational,
				description:initialData.description||'',
				isActive:initialData.isActive!==undefined?initialData.isActive:true
			});
		}
		if(show&&!initialData){
			setForm({
				name:'',
				companyName:'',
				contactName:'',
				email:'',
				phone:'',
				website:'',
				address1:'',
				address2:'',
				city:'',
				state:'',
				postalCode:'',
				country:'',
				isInternational:false,
				description:'',
				isActive:true
			});
		}
		setMessage('');
		setError('');
	},[show,initialData]);

	const handleChange=e=>{
		const {name,value,type,checked}=e.target;
		setForm(prev=>({...prev,[name]:type==='checkbox'?checked:value}));
	};

	const handleSubmit=async e=>{
		e.preventDefault();
		setLoading(true);
		setMessage('');
		setError('');
		try{
			const payload={
				...form,
				state:form.state||null,
				country:form.country||null
			};
			const res=await fetch(editId?`/api/supply-vendors/${editId}`:'/api/supply-vendors',{
				method:editId?'PUT':'POST',
				headers:{'Content-Type':'application/json'},
				body:JSON.stringify(payload)
			});
			const data=await res.json();
			if(!res.ok)throw new Error(data?.message||'Failed to save vendor');
			if(onSuccess)onSuccess(data);
			if(onHide)onHide();
		}catch(err){
			setError(err.message||'Something went wrong');
		}finally{
			setLoading(false);
		}
	};

	return(
		<Modal show={show} onHide={onHide} size="lg" centered>
			<Modal.Header closeButton>
				<Modal.Title>{mode==='edit'?'Edit Supply Vendor':'Add Supply Vendor'}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleSubmit}>
					<Row>
						<Col md={6}>
							<Form.Group className="mb-3">
								<Form.Label>Vendor Name</Form.Label>
								<Form.Control type="text" name="name" value={form.name} onChange={handleChange} />
							</Form.Group>
						</Col>
						<Col md={6}>
							<Form.Group className="mb-3">
								<Form.Label>Company Name</Form.Label>
								<Form.Control type="text" name="companyName" value={form.companyName} onChange={handleChange} />
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Col md={6}>
							<Form.Group className="mb-3">
								<Form.Label>Contact Name</Form.Label>
								<Form.Control type="text" name="contactName" value={form.contactName} onChange={handleChange} />
							</Form.Group>
						</Col>
						<Col md={6}>
							<Form.Group className="mb-3">
								<Form.Label>Email</Form.Label>
								<Form.Control type="email" name="email" value={form.email} onChange={handleChange} />
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Col md={6}>
							<Form.Group className="mb-3">
								<Form.Label>Phone</Form.Label>
								<Form.Control type="text" name="phone" value={form.phone} onChange={handleChange} />
							</Form.Group>
						</Col>
						<Col md={6}>
							<Form.Group className="mb-3">
								<Form.Label>Website</Form.Label>
								<Form.Control type="text" name="website" value={form.website} onChange={handleChange} />
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Col md={6}>
							<Form.Group className="mb-3">
								<Form.Label>Address 1</Form.Label>
								<Form.Control type="text" name="address1" value={form.address1} onChange={handleChange} />
							</Form.Group>
						</Col>
						<Col md={6}>
							<Form.Group className="mb-3">
								<Form.Label>Address 2</Form.Label>
								<Form.Control type="text" name="address2" value={form.address2} onChange={handleChange} />
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Col md={4}>
							<Form.Group className="mb-3">
								<Form.Label>City</Form.Label>
								<Form.Control type="text" name="city" value={form.city} onChange={handleChange} />
							</Form.Group>
						</Col>
						<Col md={4}>
							<Form.Group className="mb-3">
								<Form.Label>State</Form.Label>
								<Form.Select name="state" value={form.state} onChange={handleChange}>
									<option value="">Select State</option>
									{states.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}
								</Form.Select>
							</Form.Group>
						</Col>
						<Col md={4}>
							<Form.Group className="mb-3">
								<Form.Label>Postal Code</Form.Label>
								<Form.Control type="text" name="postalCode" value={form.postalCode} onChange={handleChange} />
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Col md={6}>
							<Form.Group className="mb-3">
								<Form.Label>Country</Form.Label>
								<Form.Select name="country" value={form.country} onChange={handleChange}>
									<option value="">Select Country</option>
									{countries.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}
								</Form.Select>
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Col md={12}>
							<Form.Group className="mb-3">
								<Form.Label>Description</Form.Label>
								<Form.Control as="textarea" rows={4} name="description" value={form.description} onChange={handleChange} />
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Col md={3}>
							<Form.Group className="mb-3">
								<Form.Check type="checkbox" label="International" name="isInternational" checked={form.isInternational} onChange={handleChange} />
							</Form.Group>
						</Col>
						<Col md={3}>
							<Form.Group className="mb-3">
								<Form.Check type="checkbox" label="Active" name="isActive" checked={form.isActive} onChange={handleChange} />
							</Form.Group>
						</Col>
					</Row>

					{message?<Alert variant="success">{message}</Alert>:null}
					{error?<Alert variant="danger">{error}</Alert>:null}

					<div className="d-flex gap-2">
						<Button type="submit" disabled={loading}>
							{loading?'Saving...':mode==='edit'?'Update Vendor':'Save Vendor'}
						</Button>
						<Button type="button" variant="secondary" onClick={onHide}>Close</Button>
					</div>
				</Form>
			</Modal.Body>
		</Modal>
	);
}