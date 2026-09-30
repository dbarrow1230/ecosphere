/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import {useEffect,useMemo,useState} from "react";
import {Alert,Badge,Button,Card,Col,Form,Modal,Row,Table} from "react-bootstrap";
import {Edit3,Eye,Plus,RefreshCw,Trash2} from "lucide-react";
import "../../styles/domainCrudPage.css";

const emptyRecord={};

const getId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value==="object")return value._id||value.id||value.value||"";
 return "";
};

const getText=value=>{
 if(value===undefined||value===null||value==="")return "-";
 if(typeof value==="boolean")return value?"Yes":"No";
 if(typeof value==="number")return String(value);
 if(typeof value==="string")return value;
 if(Array.isArray(value))return value.map(item=>getText(item)).filter(item=>item&&item!=="-").join(", ")||"-";
 if(typeof value==="object")return value.name||value.title||value.label||value.code||value.type||value.category||value.description||getId(value)||"-";
 return String(value);
};

const normalizeRows=data=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.data))return data.data;
 if(Array.isArray(data?.items))return data.items;
 if(Array.isArray(data?.rows))return data.rows;
 return [];
};

const toDateInputValue=value=>{
 if(!value)return "";
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "";
 return date.toISOString().slice(0,10);
};

const getDefaultValue=field=>{
 if(field.defaultValue!==undefined)return field.defaultValue;
 if(field.type==="number")return "";
 if(field.type==="checkbox")return false;
 if(field.type==="tags")return "";
 return "";
};

export default function ResourceCrudPage({title,kicker,description,endpoint,fields=[],columns=[],optionLoaders={},emptyText="No records found.",onOpen=null,openLabel="Open"}){
 const [rows,setRows]=useState([]);
 const [options,setOptions]=useState({});
 const [loading,setLoading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [editing,setEditing]=useState(null);
 const [formData,setFormData]=useState(emptyRecord);

 const initialFormData=useMemo(()=>fields.reduce((acc,field)=>{
  acc[field.name]=getDefaultValue(field);
  return acc;
 },{}),[fields]);

 const loadRows=async()=>{
  setLoading(true);
  setError("");

  try{
   const res=await fetch(endpoint,{headers:{"Content-Type":"application/json"}});
   const data=await res.json().catch(()=>[]);

   if(!res.ok)throw new Error(data.message||`Failed to load ${title}.`);

   setRows(normalizeRows(data));
  }catch(err){
   setError(err.message||`Failed to load ${title}.`);
  }finally{
   setLoading(false);
  }
 };

 const loadOptions=async()=>{
  const entries=Object.entries(optionLoaders||{});
  if(!entries.length)return;

  const nextOptions={};

  await Promise.all(entries.map(async([key,path])=>{
   try{
    const res=await fetch(path,{headers:{"Content-Type":"application/json"}});
    const data=await res.json().catch(()=>[]);
    nextOptions[key]=res.ok?normalizeRows(data):[];
   }catch{
    nextOptions[key]=[];
   }
  }));

  setOptions(nextOptions);
 };

 // The page must load its current records when the route opens.
 useEffect(()=>{
  loadRows();
  loadOptions();
 },[endpoint]);

 const openAdd=()=>{
  setEditing(null);
  setFormData(initialFormData);
  setError("");
  setNotice("");
  setShowForm(true);
 };

 const openEdit=row=>{
  setEditing(row);
  setFormData(fields.reduce((acc,field)=>{
   const value=field.getValue?field.getValue(row):row?.[field.name];

   if(field.type==="date")acc[field.name]=toDateInputValue(value);
   else if(field.type==="select")acc[field.name]=getId(value);
   else if(field.type==="tags")acc[field.name]=Array.isArray(value)?value.join(", "):String(value||"");
   else if(field.type==="checkbox")acc[field.name]=!!value;
   else acc[field.name]=value??getDefaultValue(field);

   return acc;
  },{}));
  setError("");
  setNotice("");
  setShowForm(true);
 };

 const updateField=(name,value)=>{
  setFormData(prev=>({...prev,[name]:value}));
 };

 const buildPayload=()=>fields.reduce((acc,field)=>{
  const value=formData[field.name];

  if(field.type==="number")acc[field.name]=value===""?0:Number(value);
  else if(field.type==="tags")acc[field.name]=String(value||"").split(",").map(item=>item.trim()).filter(Boolean);
  else if(field.type==="select")acc[field.name]=value||null;
  else if(field.type==="checkbox")acc[field.name]=!!value;
  else acc[field.name]=value;

  return acc;
 },{});

 const saveRecord=async event=>{
  event.preventDefault();
  setSaving(true);
  setError("");
  setNotice("");

  try{
   const id=getId(editing);
   const res=await fetch(id?`${endpoint}/${id}`:endpoint,{
    method:id?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(buildPayload())
   });
   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||`Failed to save ${title}.`);

   setNotice(`${title} saved.`);
   setShowForm(false);
   await loadRows();
  }catch(err){
   setError(err.message||`Failed to save ${title}.`);
  }finally{
   setSaving(false);
  }
 };

 const deleteRecord=async row=>{
  const id=getId(row);
  if(!id)return;

  setError("");
  setNotice("");

  try{
   const res=await fetch(`${endpoint}/${id}`,{method:"DELETE"});
   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||`Failed to delete ${title}.`);

   setNotice(`${title} deleted.`);
   await loadRows();
  }catch(err){
   setError(err.message||`Failed to delete ${title}.`);
  }
 };

 const renderField=field=>{
  const value=formData[field.name];

  if(field.type==="textarea"){
   return <Form.Control as="textarea" rows={field.rows||3} value={value||""} onChange={event=>updateField(field.name,event.target.value)}/>;
  }

  if(field.type==="select"){
   const fieldOptions=options[field.optionsKey]||field.options||[];
   return(
    <Form.Select value={value||""} onChange={event=>updateField(field.name,event.target.value)} required={field.required}>
     <option value="">Select {field.label}</option>
     {fieldOptions.map(option=>(
      <option key={getId(option)} value={getId(option)}>{getText(option)}</option>
     ))}
    </Form.Select>
   );
  }

  if(field.type==="checkbox"){
   return <Form.Check type="switch" checked={!!value} onChange={event=>updateField(field.name,event.target.checked)} label={field.checkLabel||"Active"}/>;
  }

  if(field.type==="tags"){
   return(
    <>
     <Form.Control value={value||""} onChange={event=>updateField(field.name,event.target.value)} placeholder={field.placeholder||"Enter comma-separated values"}/>
     {field.helpText&&<Form.Text className="text-muted">{field.helpText}</Form.Text>}
    </>
   );
  }

  return(
   <Form.Control
    type={field.type||"text"}
    value={value||""}
    onChange={event=>updateField(field.name,event.target.value)}
    required={field.required}
    placeholder={field.placeholder}
   />
  );
 };

 return(
  <section className="domain-crud-page">
   <header className="domain-crud-hero">
    <div>
     <p className="domain-crud-kicker">{kicker}</p>
     <h1>{title}</h1>
     <p>{description}</p>
    </div>
    <div className="domain-crud-actions">
     <Button type="button" variant="outline-primary" onClick={loadRows} disabled={loading}>
      <RefreshCw size={16}/> Refresh
     </Button>
     <Button type="button" variant="primary" onClick={openAdd}>
      <Plus size={18}/> Add {title.replace(/s$/i,"")}
     </Button>
    </div>
   </header>

   {error&&<Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>}
   {notice&&<Alert variant="success" dismissible onClose={()=>setNotice("")}>{notice}</Alert>}

   <Card className="domain-crud-card">
    <Card.Body>
     <div className="domain-crud-table-wrap">
      <Table responsive hover className="domain-crud-table align-middle">
       <thead>
        <tr>
         {columns.map(column=><th key={column.key}>{column.label}</th>)}
         <th className="text-end">Actions</th>
        </tr>
       </thead>
       <tbody>
        {rows.length?rows.map(row=>(
         <tr key={getId(row)}>
          {columns.map(column=>(
           <td key={column.key}>
            {column.badge?<Badge bg={column.badgeVariant||"success"}>{getText(row[column.key])}</Badge>:getText(row[column.key])}
           </td>
          ))}
          <td className="text-end domain-crud-row-actions">
           {onOpen&&<Button type="button" size="sm" variant="primary" onClick={()=>onOpen(row)}><Eye size={15}/> {openLabel}</Button>}
           <Button type="button" size="sm" variant="outline-primary" onClick={()=>openEdit(row)}><Edit3 size={15}/> Edit</Button>
           <Button type="button" size="sm" variant="outline-danger" onClick={()=>deleteRecord(row)}><Trash2 size={15}/> Delete</Button>
          </td>
         </tr>
        )):(
         <tr>
          <td colSpan={columns.length+1} className="domain-crud-empty">{loading?"Loading...":emptyText}</td>
         </tr>
        )}
       </tbody>
      </Table>
     </div>
    </Card.Body>
   </Card>

   <Modal show={showForm} onHide={()=>setShowForm(false)} centered size="lg" backdrop="static">
    <Form onSubmit={saveRecord}>
     <Modal.Header closeButton>
      <Modal.Title>{editing?"Edit":"Add"} {title.replace(/s$/i,"")}</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      <Row className="g-3">
       {fields.map(field=>(
        <Col md={field.md||6} key={field.name}>
         <Form.Group>
          <Form.Label>{field.label}</Form.Label>
          {renderField(field)}
         </Form.Group>
        </Col>
       ))}
      </Row>
     </Modal.Body>
     <Modal.Footer>
      <Button type="button" variant="outline-secondary" onClick={()=>setShowForm(false)}>Cancel</Button>
      <Button type="submit" variant="primary" disabled={saving}>{saving?"Saving...":"Save"}</Button>
     </Modal.Footer>
    </Form>
   </Modal>
  </section>
 );
}
