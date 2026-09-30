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
			<Modal.Title>{mode==='edit'?`Edit Supply Vendor: ${form.name}`:'Add Supply Vendor'}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleSubmit}>
					<Row>
						<Col md={6}>
							<Form.Group as={Row} className="mb-3 align-items-center">
								<Form.Label column sm={5} className="text-nowrap">Vendor Name</Form.Label>
								<Col sm={7}>
									<Form.Control type="text" name="name" value={form.name} onChange={handleChange} />
								</Col>
							</Form.Group>
						</Col>
						<Col md={6}>
							<Form.Group as={Row} className="mb-3 align-items-center">
								<Form.Label column sm={5} className="text-nowrap">Company Name</Form.Label>
								<Col sm={7}>
									<Form.Control type="text" name="companyName" value={form.companyName} onChange={handleChange} />
								</Col>
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Col md={6}>
							<Form.Group as={Row} className="mb-3 align-items-center">
								<Form.Label column sm={5} className="text-nowrap">Contact Name</Form.Label>
								<Col sm={7}>
									<Form.Control type="text" name="contactName" value={form.contactName} onChange={handleChange} />
								</Col>
							</Form.Group>
						</Col>
						<Col md={6}>
							<Form.Group as={Row} className="mb-3 align-items-center">
								<Form.Label column sm={5} className="text-nowrap">Email</Form.Label>
								<Col sm={7}>
									<Form.Control type="email" name="email" value={form.email} onChange={handleChange} />
								</Col>
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Col md={6}>
							<Form.Group as={Row} className="mb-3 align-items-center">
								<Form.Label column sm={5} className="text-nowrap">Phone</Form.Label>
								<Col sm={7}>
									<Form.Control type="text" name="phone" value={form.phone} onChange={handleChange} />
								</Col>
							</Form.Group>
						</Col>
						<Col md={6}>
							<Form.Group as={Row} className="mb-3 align-items-center">
								<Form.Label column sm={5} className="text-nowrap">Website</Form.Label>
								<Col sm={7}>
									<Form.Control type="text" name="website" value={form.website} onChange={handleChange} />
								</Col>
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Col md={6}>
							<Form.Group as={Row} className="mb-3 align-items-center">
								<Form.Label column sm={5} className="text-nowrap">Address 1</Form.Label>
								<Col sm={7}>
									<Form.Control type="text" name="address1" value={form.address1} onChange={handleChange} />
								</Col>
							</Form.Group>
						</Col>
						<Col md={6}>
							<Form.Group as={Row} className="mb-3 align-items-center">
								<Form.Label column sm={5} className="text-nowrap">Address 2</Form.Label>
								<Col sm={7}>
									<Form.Control type="text" name="address2" value={form.address2} onChange={handleChange} />
								</Col>
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Col md={4}>
							<Form.Group as={Row} className="mb-3 align-items-center">
								<Form.Label column sm={5} className="text-nowrap">City</Form.Label>
								<Col sm={7}>
									<Form.Control type="text" name="city" value={form.city} onChange={handleChange} />
								</Col>
							</Form.Group>
						</Col>
						<Col md={4}>
							<Form.Group as={Row} className="mb-3 align-items-center">
								<Form.Label column sm={4} className="text-nowrap">State</Form.Label>
								<Col sm={8}>
									<Form.Select name="state" value={form.state} onChange={handleChange}>
										<option value="">Select State</option>
										{states.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}
									</Form.Select>
								</Col>
							</Form.Group>
						</Col>
						<Col md={4}>
							<Form.Group as={Row} className="mb-3 align-items-center">
								<Form.Label column sm={6} className="text-nowrap">Postal Code</Form.Label>
								<Col sm={6}>
									<Form.Control type="text" name="postalCode" value={form.postalCode} onChange={handleChange} />
								</Col>
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Col md={6}>
							<Form.Group as={Row} className="mb-3 align-items-center">
								<Form.Label column sm={5} className="text-nowrap">Country</Form.Label>
								<Col sm={7}>
									<Form.Select name="country" value={form.country} onChange={handleChange}>
										<option value="">Select Country</option>
										{countries.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}
									</Form.Select>
								</Col>
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Col md={12}>
							<Form.Group as={Row} className="mb-3">
								<Form.Label column sm={2} className="text-nowrap">Description</Form.Label>
								<Col sm={10}>
									<Form.Control as="textarea" rows={4} name="description" value={form.description} onChange={handleChange} />
								</Col>
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