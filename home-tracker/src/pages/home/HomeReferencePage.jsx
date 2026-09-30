import {useCallback,useEffect,useMemo,useState} from "react";
import {Alert,Button,Card,Col,Container,Form,Modal,Row,Table} from "react-bootstrap";
import SortedSelect from "../../components/SortedSelect.jsx";
import {sortItems} from "../../utils/sortItems.js";
import "../../styles/HomeInventory.css";

const categoryTypes=[
 {value:"all",label:"All"},
 {value:"pantry",label:"Pantry"},
 {value:"fridge",label:"Fridge"},
 {value:"freezer",label:"Freezer"},
 {value:"household",label:"Household"}
];

const locationTypes=[
 {value:"pantry",label:"Pantry"},
 {value:"fridge",label:"Fridge"},
 {value:"freezer",label:"Freezer"},
 {value:"cabinet",label:"Cabinet"},
 {value:"closet",label:"Closet"},
 {value:"room",label:"Room"},
 {value:"garage",label:"Garage"},
 {value:"bathroom",label:"Bathroom"},
 {value:"laundry",label:"Laundry"},
 {value:"other",label:"Other"}
];

function HomeReferencePage({kind}){
 const isCategory=kind==="categories";
 const endpoint=isCategory?"/api/categories":"/api/home-locations";
 const responseKey=isCategory?"categories":"locations";
 const title=isCategory?"Categories":"Locations";
 const description=isCategory
  ?"Organize pantry, fridge, freezer, and household items into useful groups."
  :"Track where items live: pantry shelves, fridge, freezer, closets, cabinets, rooms, and storage areas.";
 const types=isCategory?categoryTypes:locationTypes;

 const blank={name:"",type:isCategory?"all":"other",description:"",isActive:true};

 const [records,setRecords]=useState([]);
 const [formData,setFormData]=useState(blank);
 const [editing,setEditing]=useState(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [alert,setAlert]=useState(null);

 const loadRecords=useCallback(async()=>{
  const res=await fetch(endpoint);
  const data=await res.json();
  setRecords(Array.isArray(data?.[responseKey])?data[responseKey]:[]);
 },[endpoint,responseKey]);

 useEffect(()=>{
  let ignore=false;
  const load=async()=>{
   try{
    setLoading(true);
    await loadRecords();
   }catch(error){
    console.error(`Failed to load ${kind}`,error);
    if(!ignore)setAlert({variant:"danger",message:`Failed to load ${title.toLowerCase()}.`});
   }finally{
    if(!ignore)setLoading(false);
   }
  };
  load();
  return()=>{ignore=true;};
 },[kind,loadRecords,title]);

 const sortedRecords=useMemo(()=>sortItems(records,item=>item.name),[records]);

 const reset=()=>{
  setFormData(blank);
  setEditing(null);
 };

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;
  setFormData(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const saveRecord=async e=>{
  e.preventDefault();
  try{
   setSaving(true);
   setAlert(null);

   const isEdit=Boolean(editing?._id);
   const url=isEdit?`${endpoint}/${editing._id}`:endpoint;
   const method=isEdit?"PUT":"POST";
   const res=await fetch(url,{
    method,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(formData)
   });
   const data=await res.json();

   if(!res.ok)throw new Error(data?.message||`Failed to save ${title.toLowerCase()}`);

   const saved=data[isCategory?"category":"location"];
   setRecords(prev=>isEdit?prev.map(item=>item._id===saved._id?saved:item):[saved,...prev]);
   reset();
   setAlert({variant:"success",message:`${title.slice(0,-1)} saved.`});
  }catch(error){
   setAlert({variant:"danger",message:error.message});
  }finally{
   setSaving(false);
  }
 };

 const editRecord=record=>{
  setEditing(record);
  setFormData({
   name:record.name||"",
   type:record.type||blank.type,
   description:record.description||"",
   isActive:record.isActive!==false
  });
 };

 const deleteRecord=async record=>{
  if(!window.confirm(`Delete ${record.name}?`))return;
  try{
   const res=await fetch(`${endpoint}/${record._id}`,{method:"DELETE"});
   const data=await res.json().catch(()=>({}));
   if(!res.ok)throw new Error(data?.message||`Failed to delete ${title.toLowerCase()}`);
   setRecords(prev=>prev.filter(item=>item._id!==record._id));
   if(editing?._id===record._id)reset();
   setAlert({variant:"success",message:`${title.slice(0,-1)} deleted.`});
  }catch(error){
   setAlert({variant:"danger",message:error.message});
  }
 };

 return(
  <section className="home-inventory">
   <Container fluid="lg">
    <header className="home-inventory-header">
     <div>
      <p className="home-inventory-kicker">Manage</p>
      <h1>{title}</h1>
      <p>{description}</p>
     </div>
     <Button type="button" onClick={()=>{
      reset();
      setEditing({isNew:true});
     }}>Add {title.slice(0,-1)}</Button>
    </header>

    {alert&&<Alert variant={alert.variant} dismissible onClose={()=>setAlert(null)}>{alert.message}</Alert>}

    <Row className="g-4">
     <Col lg={12}>
      <Card>
       <Card.Body>
        <Table hover responsive className="align-middle mb-0">
         <thead>
          <tr>
           <th>Name</th>
           <th>Type</th>
           <th>Description</th>
           <th>Status</th>
           <th></th>
          </tr>
         </thead>
         <tbody>
          {loading&&<tr><td colSpan="5" className="text-center text-muted py-4">Loading...</td></tr>}
          {!loading&&sortedRecords.length===0&&<tr><td colSpan="5" className="text-center text-muted py-4">No records found.</td></tr>}
          {!loading&&sortedRecords.map(record=>(
           <tr key={record._id}>
            <td><strong>{record.name}</strong></td>
            <td>{record.type}</td>
            <td>{record.description||"-"}</td>
            <td>{record.isActive===false?"Inactive":"Active"}</td>
            <td className="table-actions">
             <Button type="button" size="sm" variant="outline-primary" onClick={()=>editRecord(record)}>Edit</Button>
             <Button type="button" size="sm" variant="outline-danger" onClick={()=>deleteRecord(record)}>Delete</Button>
            </td>
           </tr>
          ))}
         </tbody>
        </Table>
       </Card.Body>
      </Card>
     </Col>
    </Row>

    <Modal show={Boolean(editing)} onHide={reset} centered backdrop="static">
     <Form onSubmit={saveRecord}>
      <Modal.Header closeButton>
       <Modal.Title>{editing?._id?`Edit ${title.slice(0,-1)}`:`Add ${title.slice(0,-1)}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
       <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control name="name" value={formData.name} onChange={handleChange} required/>
       </Form.Group>
       <Form.Group className="mb-3">
        <Form.Label>Type</Form.Label>
        <SortedSelect name="type" value={formData.type} onChange={handleChange} options={types} includePlaceholder={false}/>
       </Form.Group>
       <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange}/>
       </Form.Group>
       <Form.Check className="mb-3" name="isActive" checked={formData.isActive} onChange={handleChange} label="Active"/>
      </Modal.Body>
      <Modal.Footer>
       <Button type="button" variant="secondary" onClick={reset}>Cancel</Button>
       <Button type="submit" disabled={saving}>{saving?"Saving...":"Save"}</Button>
      </Modal.Footer>
     </Form>
    </Modal>
   </Container>
  </section>
 );
}

export default HomeReferencePage;
