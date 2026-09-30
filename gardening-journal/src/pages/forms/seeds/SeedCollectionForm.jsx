import {useEffect,useState} from "react";
import {Alert,Button,Col,Form,Row} from "react-bootstrap";
import {Plus, Save} from "lucide-react";

const emptyForm={
	seed:"",
	dateCollected:"",
	seedCount:"",
	amountUnit:"seeds",
	sourceType:"harvested",
	sourceName:"",
	vendor:"",
	labelColor:"#0f7d4f",
	notes:"",
	status:"collected",
	user:""
};

const statuses=["collected","stored","planted","archived"];
const sourceTypes=[
	{value:"harvested",label:"Harvested from my garden"},
	{value:"store_item",label:"Saved from store item"},
	{value:"gifted",label:"Given to me"},
	{value:"purchased",label:"Purchased seed"},
	{value:"traded",label:"Seed trade"},
	{value:"saved",label:"Saved from plant"},
	{value:"other",label:"Other"}
];

const amountUnits=["seeds","packet","pods","fruit","grams","ounces","tablespoons","teaspoons","other"];

const readJsonResponse=async res=>{
	try{
		return await res.json();
	}catch{
		return {};
	}
};

function SeedCollectionForm({mode="add",initialCollection=null,seeds=[],vendors=[],selectedSeedId="",user=null,onSaved,onCancel,onAddSeed}){
	const [form,setForm]=useState(emptyForm);
	const [saving,setSaving]=useState(false);
	const [message,setMessage]=useState(null);

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

	const getDateInputValue=value=>{
		if(!value)return "";
		const date=new Date(value);
		if(Number.isNaN(date.getTime()))return "";
		return date.toISOString().slice(0,10);
	};

	const notesToText=value=>{
		if(Array.isArray(value))return value.join("\n");
		return value||"";
	};

	const getVendorName=vendor=>{
		return vendor?.name||vendor?.companyName||"Unnamed vendor";
	};

	const colorPickerValue=/^#[0-9a-f]{6}$/i.test(form.labelColor) ? form.labelColor : "#0f7d4f";

	useEffect(()=>{
		setMessage(null);

		if(mode==="edit"&&initialCollection){
			setForm({
				seed:getId(initialCollection.seed),
				dateCollected:getDateInputValue(initialCollection.dateCollected),
				seedCount:initialCollection.seedCount ?? "",
				amountUnit:initialCollection.amountUnit||"seeds",
				sourceType:initialCollection.sourceType||"harvested",
				sourceName:initialCollection.sourceName||"",
				vendor:getId(initialCollection.vendor),
				labelColor:initialCollection.labelColor||"#0f7d4f",
				notes:notesToText(initialCollection.notes),
				status:initialCollection.status||"collected",
				user:getId(initialCollection.user)||getId(user)
			});
			return;
		}

		setForm({
			...emptyForm,
			user:getId(user)
		});
	},[mode,initialCollection,user]);

	useEffect(()=>{
		if(!selectedSeedId)return;
		setForm(prev=>({...prev,seed:selectedSeedId}));
	},[selectedSeedId]);

	const handleChange=e=>{
		const {name,value}=e.target;
		setForm(prev=>({...prev,[name]:value}));
	};

	const handleSubmit=async e=>{
		e.preventDefault();
		setSaving(true);
		setMessage(null);

		try{
			const isEdit=mode==="edit"&&initialCollection?._id;
			const payload={
				...form,
				seedCount:form.seedCount==="" ? null : Number(form.seedCount),
				vendor:form.vendor||null,
				notes:form.notes.split(/\r?\n/).map(note=>note.trim()).filter(Boolean),
				user:form.user||getId(user)
			};

			if(!payload.user){
				setMessage({variant:"danger",text:"Logged in user id is required to save this collection record."});
				return;
			}

			const res=await fetch(isEdit ? `/api/seed-collections/${initialCollection._id}` : "/api/seed-collections",{
				method:isEdit ? "PUT" : "POST",
				headers:{"Content-Type":"application/json"},
				body:JSON.stringify(payload)
			});
			const data=await readJsonResponse(res);

			if(!res.ok){
				setMessage({variant:"danger",text:data.message||"Failed to save seed collection record."});
				return;
			}

			setMessage({variant:"success",text:`Seed collection record ${isEdit ? "updated" : "created"} successfully.`});

			if(onSaved){
				setTimeout(()=>onSaved(data),500);
				return;
			}

			setForm({...emptyForm,user:getId(user)});
		}catch(error){
			setMessage({variant:"danger",text:error.message||"Server error while saving seed collection record."});
		}finally{
			setSaving(false);
		}
	};

	return(
		<Form onSubmit={handleSubmit}>
			{message&&(
				<Alert variant={message.variant} dismissible onClose={()=>setMessage(null)}>
					{message.text}
				</Alert>
			)}

			<Row className="g-3">
				<Col xs={12}>
					<Form.Group>
						<div className="d-flex align-items-center justify-content-between gap-2 mb-1">
							<Form.Label className="mb-0">Seed</Form.Label>
							{onAddSeed&&(
								<Button
									type="button"
									variant="outline-success"
									size="sm"
									className="d-inline-flex align-items-center gap-1"
									onClick={onAddSeed}
									disabled={saving}
								>
									<Plus size={15}/>
									Add Seed
								</Button>
							)}
						</div>
						<Form.Select name="seed" value={form.seed} onChange={handleChange} required>
							<option value="">Select seed</option>
							{seeds.map(seed=>(
								<option key={seed._id} value={seed._id}>
									{seed.plantName||"Unnamed Seed"}
								</option>
							))}
						</Form.Select>
					</Form.Group>
				</Col>

				<Col md={6}>
					<Form.Group>
						<Form.Label>Date Collected</Form.Label>
						<Form.Control type="date" name="dateCollected" value={form.dateCollected} onChange={handleChange}/>
					</Form.Group>
				</Col>

				<Col md={6}>
					<Form.Group>
						<Form.Label>Amount</Form.Label>
						<Form.Control type="number" min="0" name="seedCount" value={form.seedCount} onChange={handleChange}/>
					</Form.Group>
				</Col>

				<Col md={6}>
					<Form.Group>
						<Form.Label>Amount Unit</Form.Label>
						<Form.Select name="amountUnit" value={form.amountUnit} onChange={handleChange}>
							{amountUnits.map(unit=>(
								<option key={unit} value={unit}>
									{unit.charAt(0).toUpperCase()+unit.slice(1)}
								</option>
							))}
						</Form.Select>
					</Form.Group>
				</Col>

				<Col md={6}>
					<Form.Group>
						<Form.Label>Source</Form.Label>
						<Form.Select name="sourceType" value={form.sourceType} onChange={handleChange}>
							{sourceTypes.map(type=>(
								<option key={type.value} value={type.value}>
									{type.label}
								</option>
							))}
						</Form.Select>
					</Form.Group>
				</Col>

				<Col md={6}>
					<Form.Group>
						<Form.Label>Vendor</Form.Label>
						<Form.Select name="vendor" value={form.vendor} onChange={handleChange}>
							<option value="">No vendor</option>
							{vendors.map(vendor=>(
								<option key={getId(vendor)} value={getId(vendor)}>
									{getVendorName(vendor)}
								</option>
							))}
						</Form.Select>
					</Form.Group>
				</Col>

				<Col md={6}>
					<Form.Group>
						<Form.Label>Source Name</Form.Label>
						<Form.Control
							type="text"
							name="sourceName"
							value={form.sourceName}
							onChange={handleChange}
							placeholder="Store pepper, neighbor, plant name, trade source..."
						/>
					</Form.Group>
				</Col>

				<Col md={6}>
					<Form.Group>
						<Form.Label>Label Color</Form.Label>
						<div className="seed-collection-color-control">
							<Form.Control type="color" name="labelColor" value={colorPickerValue} onChange={handleChange} title="Choose label color"/>
							<Form.Control type="text" name="labelColor" value={form.labelColor} onChange={handleChange}/>
						</div>
					</Form.Group>
				</Col>

				<Col md={6}>
					<Form.Group>
						<Form.Label>Status</Form.Label>
						<Form.Select name="status" value={form.status} onChange={handleChange}>
							{statuses.map(status=>(
								<option key={status} value={status}>
									{status.charAt(0).toUpperCase()+status.slice(1)}
								</option>
							))}
						</Form.Select>
					</Form.Group>
				</Col>

				<Col xs={12}>
					<Form.Group>
						<Form.Label>Notes</Form.Label>
						<Form.Control as="textarea" rows={5} name="notes" value={form.notes} onChange={handleChange} placeholder="One note per line"/>
					</Form.Group>
				</Col>
			</Row>

			<div className="d-flex justify-content-end gap-2 mt-4">
				{onCancel&&(
					<Button type="button" variant="outline-secondary" onClick={onCancel} disabled={saving}>
						Cancel
					</Button>
				)}
				<Button type="submit" variant="success" className="d-inline-flex align-items-center gap-2" disabled={saving}>
					<Save size={18}/>
					{saving ? "Saving..." : mode==="edit" ? "Update Collection" : "Save Collection"}
				</Button>
			</div>
		</Form>
	);
}

export default SeedCollectionForm;
