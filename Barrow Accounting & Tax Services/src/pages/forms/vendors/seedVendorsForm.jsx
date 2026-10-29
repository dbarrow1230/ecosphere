//src/pages/forms/vendors/seedVendorFormjsx
import {useEffect,useState} from 'react';
import {Form,Button,Row,Col,Alert,Modal,Image} from 'react-bootstrap';

export default function SeedVendorForm({show,onHide,onSuccess,editId=null,initialData=null,mode='add'}){
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
		logo:'',
		isActive:true
	});
	const [states,setStates]=useState([]);
	const [countries,setCountries]=useState([]);
	const [logoFile,setLogoFile]=useState(null);
	const [logoPreview,setLogoPreview]=useState('');
	const [removeLogo,setRemoveLogo]=useState(false);
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
				logo:initialData.logo||'',
				isActive:initialData.isActive!==undefined?initialData.isActive:true
			});
			setLogoFile(null);
			setLogoPreview(initialData.logo?getLogoUrl(initialData.logo):'');
			setRemoveLogo(false);
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
				logo:'',
				isActive:true
			});
			setLogoFile(null);
			setLogoPreview('');
			setRemoveLogo(false);
		}
		setMessage('');
		setError('');
		const fileInput=document.getElementById('seedVendorLogo');
		if(fileInput)fileInput.value='';
	},[show,initialData]);

	useEffect(()=>{
		return()=>{
			if(logoPreview&&logoPreview.startsWith('blob:'))URL.revokeObjectURL(logoPreview);
		};
	},[logoPreview]);

	const getLogoUrl=value=>{
		if(!value)return '';
		if(value.startsWith('blob:'))return value;
		if(value.startsWith('http'))return value;
		if(value.startsWith('/'))return value;
		return `/logos/${value}`;
	};

	const handleChange=e=>{
		const {name,value,type,checked}=e.target;
		setForm(prev=>({...prev,[name]:type==='checkbox'?checked:value}));
	};

	const handleBrowseLogo=()=>{
		const fileInput=document.getElementById('seedVendorLogo');
		if(fileInput)fileInput.click();
	};

	const handleLogoChange=e=>{
		const file=e.target.files?.[0]||null;
		if(logoPreview&&logoPreview.startsWith('blob:'))URL.revokeObjectURL(logoPreview);
		if(file){
			const preview=URL.createObjectURL(file);
			setLogoFile(file);
			setLogoPreview(preview);
			setRemoveLogo(false);
		}else{
			setLogoFile(null);
			setLogoPreview(form.logo?getLogoUrl(form.logo):'');
		}
	};

	const handleRemoveLogo=()=>{
		if(logoPreview&&logoPreview.startsWith('blob:'))URL.revokeObjectURL(logoPreview);
		setLogoFile(null);
		setLogoPreview('');
		setRemoveLogo(true);
		setForm(prev=>({...prev,logo:''}));
		const fileInput=document.getElementById('seedVendorLogo');
		if(fileInput)fileInput.value='';
	};

	const resetFormState=()=>{
		if(logoPreview&&logoPreview.startsWith('blob:'))URL.revokeObjectURL(logoPreview);
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
			logo:'',
			isActive:true
		});
		setLogoFile(null);
		setLogoPreview('');
		setRemoveLogo(false);
		setMessage('');
		setError('');
		const fileInput=document.getElementById('seedVendorLogo');
		if(fileInput)fileInput.value='';
	};

	const uploadLogo=async()=>{
		if(!logoFile)return form.logo||'';

		const uploadPayload=new FormData();
		uploadPayload.append('file',logoFile);

		const uploadRes=await fetch('/api/upload/logos',{
			method:'POST',
			body:uploadPayload
		});
		const uploadData=await uploadRes.json();
		if(!uploadRes.ok)throw new Error(uploadData?.message||'Failed to upload logo');

		return uploadData?.filename||'';
	};

	const handleSubmit=async e=>{
		e.preventDefault();
		setLoading(true);
		setMessage('');
		setError('');
		try{
			const uploadedLogo=removeLogo?'':await uploadLogo();

			const payload={
				name:form.name||'',
				companyName:form.companyName||'',
				contactName:form.contactName||'',
				email:form.email||'',
				phone:form.phone||'',
				website:form.website||'',
				address1:form.address1||'',
				address2:form.address2||'',
				city:form.city||'',
				state:form.state||'',
				postalCode:form.postalCode||'',
				country:form.country||'',
				isInternational:!!form.isInternational,
				description:form.description||'',
				logo:uploadedLogo,
				isActive:!!form.isActive
			};

			const res=await fetch(editId?`/api/seed-vendors/${editId}`:'/api/seed-vendors',{
				method:editId?'PUT':'POST',
				headers:{'Content-Type':'application/json'},
				body:JSON.stringify(payload)
			});
			const data=await res.json();
			if(!res.ok)throw new Error(data?.message||'Failed to save vendor');
			if(onSuccess)onSuccess(data);
			resetFormState();
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
				<Modal.Title>{mode==='edit'?'Edit Seed Vendor':'Add Seed Vendor'}</Modal.Title>
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

						<Col md={6}>
							<Form.Group className="mb-3">
								<Form.Label>Logo</Form.Label>
								<input id="seedVendorLogo" type="file" accept="image/*" onChange={handleLogoChange} style={{display:'none'}} />
								<div className="d-flex gap-2 align-items-center flex-wrap">
									<Button type="button" variant="secondary" onClick={handleBrowseLogo}>Browse Image</Button>
									{logoPreview?<Button type="button" variant="danger" onClick={handleRemoveLogo}>Remove</Button>:null}
								</div>
							</Form.Group>

							{logoPreview?(
								<div className="mb-3">
									<Image src={logoPreview} thumbnail style={{width:'140px',height:'140px',objectFit:'cover'}} />
								</div>
							):null}
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