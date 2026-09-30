import {useEffect,useMemo,useState} from "react";
import {Alert,Badge,Button,Card,Col,Container,Form,Row,Table} from "react-bootstrap";

const getRows=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.data))return data.data;
 if(Array.isArray(data?.items))return data.items;
 if(Array.isArray(data?.rows))return data.rows;
 return [];
};

const getId=row=>{
 if(!row)return "";
 if(typeof row._id==="string")return row._id;
 if(typeof row.id==="string")return row.id;
 if(typeof row._id?.$oid==="string")return row._id.$oid;
 if(typeof row.id?.$oid==="string")return row.id.$oid;
 return "";
};

const getErrorMessage=async response=>{
 const data=await response.json().catch(()=>null);
 return data?.message||data?.error||"Request failed";
};

function ReferenceDataPage({title,singular,endpoint,description,codeField=false,readOnly=false}){
 const emptyForm=useMemo(()=>({name:"",code:"",description:"",isActive:true}),[]);
 const [rows,setRows]=useState([]);
 const [form,setForm]=useState(emptyForm);
 const [selected,setSelected]=useState(null);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");

 const loadRows=async()=>{
  setLoading(true);
  setError("");

  try{
   const res=await fetch(endpoint,{headers:{"Content-Type":"application/json"}});

   if(!res.ok)throw new Error(await getErrorMessage(res));

   const data=await res.json();
   setRows(getRows(data));
  }catch(err){
   setRows([]);
   setError(err.message);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  // eslint-disable-next-line react-hooks/set-state-in-effect
  loadRows();
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[endpoint]);

 const resetForm=()=>{
  setSelected(null);
  setForm(emptyForm);
 };

 const handleEdit=row=>{
  setSelected(row);
  setForm({
   name:row?.name||"",
   code:row?.code||"",
   description:row?.description||"",
   isActive:row?.isActive!==false
  });
  setError("");
  setMessage("");
 };

 const handleChange=event=>{
  const {name,value,type,checked}=event.target;
  setForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const handleSubmit=async event=>{
  event.preventDefault();
  if(readOnly)return;

  setSaving(true);
  setError("");
  setMessage("");

  try{
   const id=getId(selected);
   const payload={
    name:form.name,
    description:form.description,
    isActive:form.isActive
   };

   if(codeField)payload.code=form.code;

   const res=await fetch(id?`${endpoint}/${id}`:endpoint,{
    method:id?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   if(!res.ok)throw new Error(await getErrorMessage(res));

   setMessage(`${singular} ${id?"updated":"created"} successfully.`);
   resetForm();
   await loadRows();
  }catch(err){
   setError(err.message);
  }finally{
   setSaving(false);
  }
 };

 const handleDelete=async row=>{
  if(readOnly)return;
  const id=getId(row);
  if(!id)return;
  if(!window.confirm(`Delete ${row?.name||singular}?`))return;

  setError("");
  setMessage("");

  try{
   const res=await fetch(`${endpoint}/${id}`,{method:"DELETE"});

   if(!res.ok)throw new Error(await getErrorMessage(res));

   setMessage(`${singular} deleted successfully.`);
   if(getId(selected)===id)resetForm();
   await loadRows();
  }catch(err){
   setError(err.message);
  }
 };

 return(
  <section className="py-4">
   <Container fluid="lg">
    <Row className="g-4">
     <Col lg={4}>
      <Card className="border-0 shadow-sm">
       <Card.Body className="p-4">
        <p className="text-uppercase fw-bold small text-success mb-2">Reference Data</p>
        <h1 className="h3 mb-2">{title}</h1>
        {description?<p className="text-muted">{description}</p>:null}

        {readOnly?(
         <Alert variant="info" className="mb-0">This view is wired for listing records only.</Alert>
        ):(
         <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="referenceName">
           <Form.Label>Name</Form.Label>
           <Form.Control name="name" value={form.name} onChange={handleChange} required/>
          </Form.Group>

          {codeField?(
           <Form.Group className="mb-3" controlId="referenceCode">
            <Form.Label>Code</Form.Label>
            <Form.Control name="code" value={form.code} onChange={handleChange}/>
           </Form.Group>
          ):null}

          <Form.Group className="mb-3" controlId="referenceDescription">
           <Form.Label>Description</Form.Label>
           <Form.Control as="textarea" rows={4} name="description" value={form.description} onChange={handleChange}/>
          </Form.Group>

          <Form.Check
           className="mb-3"
           id="referenceIsActive"
           name="isActive"
           checked={form.isActive}
           onChange={handleChange}
           label="Active"
          />

          <div className="d-flex gap-2">
           <Button type="submit" disabled={saving}>{saving?"Saving...":selected?"Update":"Create"}</Button>
           {selected?<Button type="button" variant="outline-secondary" onClick={resetForm}>Cancel</Button>:null}
          </div>
         </Form>
        )}
       </Card.Body>
      </Card>
     </Col>

     <Col lg={8}>
      <Card className="border-0 shadow-sm">
       <Card.Body className="p-4">
        {error?<Alert variant="danger">{error}</Alert>:null}
        {message?<Alert variant="success">{message}</Alert>:null}

        <div className="table-responsive">
         <Table hover className="align-middle mb-0">
          <thead>
           <tr>
            <th>Name</th>
            {codeField?<th>Code</th>:null}
            <th>Description</th>
            <th>Status</th>
            {!readOnly?<th className="text-end">Actions</th>:null}
           </tr>
          </thead>
          <tbody>
           {loading?(
            <tr><td colSpan={codeField?5:4} className="text-center text-muted py-4">Loading...</td></tr>
           ):null}

           {!loading&&rows.length===0?(
            <tr><td colSpan={codeField?5:4} className="text-center text-muted py-4">No records found.</td></tr>
           ):null}

           {!loading&&rows.map(row=>(
            <tr key={getId(row)||row.name}>
             <td>{row.name||row.title||"-"}</td>
             {codeField?<td>{row.code||"-"}</td>:null}
             <td>{row.description||row.generalDescription||row.menuDescription||"-"}</td>
             <td><Badge bg={row.isActive===false?"secondary":"success"}>{row.isActive===false?"Inactive":"Active"}</Badge></td>
             {!readOnly?(
              <td className="text-end">
               <Button size="sm" variant="outline-primary" className="me-2" onClick={()=>handleEdit(row)}>Edit</Button>
               <Button size="sm" variant="outline-danger" onClick={()=>handleDelete(row)}>Delete</Button>
              </td>
             ):null}
            </tr>
           ))}
          </tbody>
         </Table>
        </div>
       </Card.Body>
      </Card>
     </Col>
    </Row>
   </Container>
  </section>
 );
}

export default ReferenceDataPage;
