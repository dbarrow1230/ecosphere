import {Fragment,useEffect,useMemo,useState} from "react";
import {Alert,Badge,Button,Card,Col,Form,Row,Spinner,Table} from "react-bootstrap";

const getPathValue=(obj,path)=>String(path||"").split(".").reduce((acc,key)=>acc?.[key],obj);

const setPathValue=(obj,path,value)=>{
 const keys=String(path||"").split(".");
 const next={...obj};
 let current=next;
 keys.forEach((key,index)=>{
  if(index===keys.length-1){
   current[key]=value;
  }else{
   current[key]={...(current[key]||{})};
   current=current[key];
  }
 });
 return next;
};

const getId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value==="object")return value._id||value.id||"";
 return "";
};

const getLabelFromItem=(item,fields=[])=>{
 if(!item)return "";
 for(const field of fields){
  const value=getPathValue(item,field);
  if(value!==undefined&&value!==null&&value!=="")return String(value);
 }
 return item.name||item.title||item.code||item.orderNumber||item._id||"";
};

const normalizeArray=(data,key)=>{
 if(Array.isArray(data))return data;
 if(Array.isArray(data?.data))return data.data;
 if(key&&Array.isArray(data?.[key]))return data[key];
 return [];
};

const toDateInput=value=>{
 if(!value)return "";
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "";
 return date.toISOString().slice(0,10);
};

const formatValue=value=>{
 if(value===undefined||value===null||value==="")return "-";
 if(typeof value==="boolean")return value?"Yes":"No";
 if(typeof value==="object"){
  if(value.$numberDecimal!==undefined)return Number(value.$numberDecimal).toString();
  return getLabelFromItem(value,["name","orderNumber","code","batchNumber","sku"]);
 }
 return String(value);
};

export default function ResourceCrudPage({
 title,
 subtitle,
 apiPath,
 arrayKey,
 initialForm,
 fields,
 columns,
 optionLoaders={},
 buildPayload,
 formFromItem,
 getRowTitle
}){
 const [items,setItems]=useState([]);
 const [form,setForm]=useState(initialForm);
 const [selected,setSelected]=useState(null);
 const [isEditing,setIsEditing]=useState(false);
 const [isAdding,setIsAdding]=useState(false);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [alert,setAlert]=useState({show:false,variant:"success",message:""});
 const [options,setOptions]=useState({});

 const loadData=async()=>{
  try{
   setLoading(true);
   const res=await fetch(apiPath);
   const data=await res.json().catch(()=>null);
   if(!res.ok)throw new Error(data?.message||`Failed to load ${title}.`);
   setItems(normalizeArray(data,arrayKey));
  }catch(error){
   setItems([]);
   setAlert({show:true,variant:"danger",message:error.message});
  }finally{
   setLoading(false);
  }
 };

 const loadOptions=async()=>{
  const entries=Object.entries(optionLoaders);
  if(!entries.length)return;
  const next={};
  await Promise.all(entries.map(async([key,loader])=>{
   try{
    const res=await fetch(loader.url);
    const data=await res.json().catch(()=>null);
    next[key]=normalizeArray(data,loader.arrayKey);
   }catch{
    next[key]=[];
   }
  }));
  setOptions(next);
 };

 useEffect(()=>{
  loadData();
  loadOptions();
 },[apiPath]);

 const metrics=useMemo(()=>({
  total:items.length,
  active:items.filter(item=>item.isActive!==false).length
 }),[items]);

 const resetForm=()=>{
  setForm(initialForm);
  setSelected(null);
  setIsEditing(false);
  setIsAdding(false);
 };

 const startAdd=()=>{
  setForm(initialForm);
  setSelected(null);
  setIsEditing(false);
  setIsAdding(true);
 };

 const startEdit=item=>{
  setSelected(item);
  setForm(formFromItem?formFromItem(item):fields.reduce((acc,field)=>{
   const value=getPathValue(item,field.name);
   return setPathValue(acc,field.name,field.type==="date"?toDateInput(value):field.type==="select"?getId(value):value??"");
  },initialForm));
  setIsEditing(true);
  setIsAdding(false);
 };

 const handleChange=(field,e)=>{
  const value=field.type==="checkbox"?e.target.checked:e.target.value;
  setForm(prev=>setPathValue(prev,field.name,value));
 };

 const handleSubmit=async e=>{
  e.preventDefault();
  try{
   setSaving(true);
   const payload=buildPayload?buildPayload(form):form;
   const url=isEditing&&selected?`${apiPath}/${selected._id}`:apiPath;
   const method=isEditing&&selected?"PUT":"POST";
   const res=await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const data=await res.json().catch(()=>null);
   if(!res.ok)throw new Error(data?.message||`Failed to save ${title}.`);
   const saved=data?.data||data?.item||data?.customer||data?.order||data?.supplier||data?.inventoryItem||data;
   if(isEditing&&selected){
    setItems(prev=>prev.map(item=>item._id===saved._id?saved:item));
    setSelected(saved);
    setIsEditing(false);
    setAlert({show:true,variant:"success",message:`${title} updated.`});
   }else{
    setItems(prev=>[saved,...prev]);
    resetForm();
    setAlert({show:true,variant:"success",message:`${title} created.`});
   }
  }catch(error){
   setAlert({show:true,variant:"danger",message:error.message});
  }finally{
   setSaving(false);
  }
 };

 const handleDelete=async item=>{
  if(!window.confirm(`Delete ${getRowTitle?getRowTitle(item):getLabelFromItem(item,["name","orderNumber"])}?`))return;
  try{
   const res=await fetch(`${apiPath}/${item._id}`,{method:"DELETE"});
   const data=await res.json().catch(()=>null);
   if(!res.ok)throw new Error(data?.message||`Failed to delete ${title}.`);
   setItems(prev=>prev.filter(row=>row._id!==item._id));
   if(selected?._id===item._id)resetForm();
   setAlert({show:true,variant:"success",message:`${title} deleted.`});
  }catch(error){
   setAlert({show:true,variant:"danger",message:error.message});
  }
 };

 const renderField=field=>{
  const value=getPathValue(form,field.name);
  if(field.type==="textarea"){
   return <Form.Control as="textarea" rows={field.rows||3} value={value||""} onChange={e=>handleChange(field,e)} required={field.required}/>;
  }
  if(field.type==="select"){
   const source=options[field.optionsKey]||[];
   return(
    <Form.Select value={value||""} onChange={e=>handleChange(field,e)} required={field.required}>
     <option value="">{field.placeholder||"Select"}</option>
     {source.map(option=>(
      <option key={getId(option)} value={getId(option)}>{getLabelFromItem(option,field.labelFields)}</option>
     ))}
    </Form.Select>
   );
  }
  if(field.type==="checkbox"){
   return <Form.Check type="switch" checked={!!value} onChange={e=>handleChange(field,e)} label={field.checkboxLabel||"Active"}/>;
  }
  return <Form.Control type={field.type||"text"} value={value??""} onChange={e=>handleChange(field,e)} required={field.required} min={field.min} step={field.step}/>;
 };

 return(
  <section className="py-4">
   <div className="container-fluid container-lg">
    <Row className="align-items-center mb-4 g-3">
     <Col md={8}>
      <h1 className="mb-1">{title}</h1>
      {subtitle&&<p className="text-muted mb-0">{subtitle}</p>}
     </Col>
     <Col md={4} className="d-flex justify-content-md-end gap-2">
      <Button type="button" onClick={startAdd}>Add {title.replace(/s$/i,"")}</Button>
      <Badge bg="secondary" className="d-flex align-items-center px-3">Total: {metrics.total}</Badge>
     </Col>
    </Row>

    {alert.show&&(
     <Alert variant={alert.variant} dismissible onClose={()=>setAlert(prev=>({...prev,show:false}))}>{alert.message}</Alert>
    )}

    <Row className="g-4">
     <Col lg={4}>
      <Card className="h-100">
       <Card.Body>
        {!isAdding&&!isEditing&&!selected&&(
         <div className="text-muted">Select a row to review or edit, or add a new record.</div>
        )}

        {(isAdding||isEditing)&&(
         <Form onSubmit={handleSubmit}>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="h4 mb-0">{isEditing?"Edit":"Add"} {title.replace(/s$/i,"")}</h2>
           <Button type="button" variant="outline-secondary" size="sm" onClick={resetForm}>Cancel</Button>
          </div>
          {fields.map(field=>(
           <Form.Group className="mb-3" key={field.name}>
            {field.type!=="checkbox"&&<Form.Label>{field.label}</Form.Label>}
            {renderField(field)}
           </Form.Group>
          ))}
          <div className="d-grid">
           <Button type="submit" disabled={saving}>{saving?"Saving...":isEditing?"Update":"Save"}</Button>
          </div>
         </Form>
        )}

        {selected&&!isEditing&&(
         <>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="h4 mb-0">Details</h2>
           <div className="d-flex gap-2">
            <Button type="button" variant="outline-secondary" size="sm" onClick={resetForm}>Close</Button>
            <Button type="button" variant="primary" size="sm" onClick={()=>startEdit(selected)}>Edit</Button>
           </div>
          </div>
          <dl className="row mb-0">
           {columns.map(column=>(
            <Fragment key={column.path}>
             <dt className="col-sm-5">{column.label}</dt>
             <dd className="col-sm-7">{column.render?column.render(selected):formatValue(getPathValue(selected,column.path))}</dd>
            </Fragment>
           ))}
          </dl>
         </>
        )}
       </Card.Body>
      </Card>
     </Col>

     <Col lg={8}>
      <Card>
       <Card.Body>
        {loading?(
         <div className="d-flex align-items-center gap-2"><Spinner animation="border" size="sm"/> Loading...</div>
        ):(
         <div className="table-responsive">
          <Table hover className="align-middle mb-0">
           <thead>
            <tr>
             {columns.map(column=><th key={column.path}>{column.label}</th>)}
             <th>Actions</th>
            </tr>
           </thead>
           <tbody>
            {items.length===0&&(
             <tr><td colSpan={columns.length+1} className="text-center text-muted py-4">No records found.</td></tr>
            )}
            {items.map(item=>(
             <tr key={item._id} className={selected?._id===item._id?"table-active":""}>
              {columns.map(column=>(
               <td key={column.path} onClick={()=>setSelected(item)} style={{cursor:"pointer"}}>{column.render?column.render(item):formatValue(getPathValue(item,column.path))}</td>
              ))}
              <td>
               <div className="d-flex gap-2 flex-wrap">
                <Button type="button" variant="outline-primary" size="sm" onClick={()=>startEdit(item)}>Edit</Button>
                <Button type="button" variant="outline-danger" size="sm" onClick={()=>handleDelete(item)}>Delete</Button>
               </div>
              </td>
             </tr>
            ))}
           </tbody>
          </Table>
         </div>
        )}
       </Card.Body>
      </Card>
     </Col>
    </Row>
   </div>
  </section>
 );
}

