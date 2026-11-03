import {useState} from "react";
import {Button,Col,Form,Row} from "react-bootstrap";
import RichTextEditor from "../../components/RichTextEditor.jsx";
import RelationshipSelector from "../../components/RelationshipSelector.jsx";

function OutputForm({
 form,
 setForm,
 userId="",
 projects=[],
 outputTypes=[],
 onSubtypeCreated=()=>{},
 zettels=[],
 sources=[],
 entities=[],
 structures=[],
 editing=null,
 saving=false,
 onSubmit
}){
 const [showAddType,setShowAddType]=useState(false);
 const [newTypeName,setNewTypeName]=useState("");
 const [savingType,setSavingType]=useState(false);
 const [typeError,setTypeError]=useState("");
 const [showTypePicker,setShowTypePicker]=useState(false);

 const selectDocument=async()=>{
  const userInfo=JSON.parse(localStorage.getItem("userInfo")||sessionStorage.getItem("userInfo")||"null");
  const userId=userInfo?.user?._id||userInfo?.data?._id||userInfo?._id||userInfo?.id||"";
  const response=await fetch("/api/outputs/select-document",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   credentials:"include",
   body:JSON.stringify({userId})
  });
  const data=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(data?.message||"Unable to select document");
  if(data?.data?.documentPath)updateField("documentPath",data.data.documentPath);
 };

 // Helper: update one form field
 const updateField=(field,value)=>{
  setForm(current=>({...current,[field]:value}));
 };

 // Helper: add one relationship without displaying unrelated records as linked
 const addLinkedId=(field,value)=>{
  if(!value)return;

  setForm(current=>({
   ...current,
   [field]:[...new Set([...(current[field]||[]),value])]
  }));
 };

 const toCode=value=>String(value||"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,24);

 const createOutputType=async()=>{
  const name=newTypeName.trim();
  const code=toCode(name);
  if(!name||!code)return;
  setSavingType(true);
  setTypeError("");
  try{
   const response=await fetch("/api/record-subtypes",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({userId,recordType:"OUT",name,code,status:"active"})});
   const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Unable to add output type");
   onSubtypeCreated(data.data);
   setForm(current=>{
    const outputTypes=[...new Set([...(current.outputTypes||[]),current.outputType,data.data.code].filter(Boolean))];
    return {...current,outputTypes,outputType:outputTypes[0]||data.data.code};
   });
   setNewTypeName("");
   setShowAddType(false);
  }catch(error){
   setTypeError(error.message);
  }finally{
   setSavingType(false);
  }
 };

 const addOutputType=code=>{
  if(!code)return;
  setForm(current=>{
   const outputTypes=[...new Set([...(current.outputTypes||[]),current.outputType,code].filter(Boolean))];
   return {...current,outputTypes,outputType:outputTypes[0]||code};
  });
 };

 const selectedOutputTypes=[...new Set([...(form.outputTypes||[]),form.outputType].filter(Boolean))];
 const availableOutputTypes=outputTypes.filter(type=>!selectedOutputTypes.includes(type.code));

 // Helper: remove one linked relationship
 const removeLinkedId=(field,value)=>{
  setForm(current=>({
   ...current,
   [field]:(current[field]||[]).filter(id=>id!==value)
  }));
 };

 const linkSelector=(label,field,records,idField,titleField)=>{
  const linkedIds=form[field]||[];
  const linkedRecords=linkedIds.map(id=>records.find(record=>record._id===id)).filter(Boolean);
  const availableRecords=records.filter(record=>!linkedIds.includes(record._id));

  return(
   <Form.Group className="mb-3">
    <Form.Label>{label}</Form.Label>
    <div>
     {linkedRecords.length?(
      <div className="zettel-list-items mb-2">
       {linkedRecords.map(record=>(
        <div className="zettel-list-item" key={record._id}>
         <span>{record[idField]||record._id} - {record[titleField]||"Untitled"}</span>
         <Button type="button" size="sm" variant="outline-danger" onClick={()=>removeLinkedId(field,record._id)}>Remove</Button>
        </div>
       ))}
      </div>
     ):(
      <Form.Text className="d-block mb-2">No {label.toLowerCase()}.</Form.Text>
     )}

     <Form.Select value="" onChange={event=>addLinkedId(field,event.target.value)}>
      <option value="">Add {label.toLowerCase()}...</option>
      {availableRecords.map(record=>(
       <option key={record._id} value={record._id}>
        {record[idField]||record._id} - {record[titleField]||"Untitled"}
       </option>
      ))}
     </Form.Select>
    </div>
   </Form.Group>
  );
 };

 return(
  <Form className="output-form" onSubmit={onSubmit}>
   {editing?._id&&<div className="output-form-id"><span>Output ID</span><code>{editing.outputId||""}</code></div>}

   {!editing?._id&&(
    <Form.Group className="mb-3">
     <Form.Label>Subject Code</Form.Label>
     <Form.Control
      value={form.subjectCode}
      onChange={event=>updateField(
       "subjectCode",
       event.target.value.toUpperCase()
      )}
      placeholder="Optional ID segment"
     />
    </Form.Group>
   )}

   <Row className="output-form-primary-row">
    <Col xs={12} lg={6}>
     <Form.Group className="mb-3 output-field-row">
      <Form.Label>Title</Form.Label>
      <Form.Control
       required
       value={form.title}
       onChange={event=>updateField("title",event.target.value)}
      />
     </Form.Group>
    </Col>

   </Row>

   <Row>
    <Col xs={12} lg={6} className="output-project-field">
     <RelationshipSelector label="Projects" value={form.projectIds||[]} records={projects} idField="projectId" titleField="title" showEmpty={false} showId={false} addMore onChange={value=>updateField("projectIds",value)}/>
    </Col>
    <Col xs={12} lg={6}>
     <Form.Group className="mb-3 output-field-row">
      <Form.Label>Output Types</Form.Label>
      <div className="output-type-control">
       <div className="output-type-actions">
        {availableOutputTypes.length?<div className="relationship-add-control"><Button type="button" variant="outline-primary" onClick={()=>setShowTypePicker(current=>!current)}>Add More</Button>{showTypePicker&&<div className="relationship-checkbox-picker"><div className="relationship-checkbox-options">{availableOutputTypes.map(type=><Form.Check key={type._id} type="checkbox" id={`output-type-${type._id}`} label={type.name||type.code} onChange={event=>event.target.checked&&addOutputType(type.code)}/>)}</div><Button type="button" variant="outline-secondary" onClick={()=>setShowTypePicker(false)}>Done</Button></div>}</div>:null}
        <Button type="button" variant="outline-primary" onClick={()=>setShowAddType(current=>!current)}>Add New Type</Button>
       </div>
      </div>
      <div className="relationship-attached-values">
       {selectedOutputTypes.map(code=>{
        const type=outputTypes.find(item=>item.code===code);
        return <span key={code}>{type?.name||code}</span>;
       })}
      </div>
      {showAddType&&<div className="d-flex gap-2 mt-2"><Form.Control value={newTypeName} onChange={event=>setNewTypeName(event.target.value)} placeholder="Output type name"/><Button type="button" disabled={savingType||!newTypeName.trim()} onClick={createOutputType}>{savingType?"Saving...":"Save & Select"}</Button></div>}
      {typeError&&<Form.Text className="text-danger d-block">{typeError}</Form.Text>}
     </Form.Group>
    </Col>
   </Row>

   <Row>
    <Col xs={12} lg={6}>
     <Form.Group className="mb-3 output-document-picker output-field-row">
      <Form.Label>Final Document</Form.Label>
      <div className="d-flex gap-2">
       <Form.Control value={form.documentPath||""} readOnly placeholder="No document selected"/>
       <Button type="button" variant="outline-primary" onClick={()=>selectDocument().catch(error=>window.alert(error.message))}>Browse</Button>
       {form.documentPath&&<Button type="button" variant="outline-secondary" onClick={()=>updateField("documentPath","")}>Clear</Button>}
      </div>
     </Form.Group>
    </Col>
   </Row>

   <Form.Group className="mb-3">
    <Form.Label>Description</Form.Label>
    <RichTextEditor value={form.description} onChange={value=>updateField("description",value)} placeholder="Describe the finished work and its intended purpose." minHeight="7rem"/>
   </Form.Group>

   <Form.Group className="mb-3">
    <Form.Label>Draft / Content</Form.Label>
    <RichTextEditor value={form.body} onChange={value=>updateField("body",value)} placeholder="Draft the output with formatted text, headings, lists, quotes, and links." minHeight="20rem"/>
   </Form.Group>

   {linkSelector("Linked zettels","zettelIds",zettels,"zettelId","title")}
   {linkSelector("Linked sources","sourceIds",sources,"sourceId","title")}
   {linkSelector("Linked entities","entityIds",entities,"entityId","name")}
   {linkSelector("Structure notes","structureNoteIds",structures,"structureNoteId","title")}

   <Form.Group className="mb-3">
    <Form.Label>Tags</Form.Label>
    <Form.Control
     value={form.tags}
     onChange={event=>updateField("tags",event.target.value)}
     placeholder="Separate tags with commas"
    />
   </Form.Group>

   <Row>
    <Col xs={12} md={8}>
     <Form.Group className="mb-3">
      <Form.Label>Status</Form.Label>
      <Form.Select
       value={form.status}
       onChange={event=>updateField("status",event.target.value)}
      >
       <option value="draft">Draft</option>
       <option value="active">Active</option>
       <option value="published">Published</option>
       <option value="archived">Archived</option>
      </Form.Select>
     </Form.Group>
    </Col>

    <Col xs={12} md={4}>
     <Form.Group className="mb-3">
      <Form.Label>Favorite</Form.Label>
      <Form.Check
       type="switch"
       checked={form.isFavorite}
       onChange={event=>updateField(
        "isFavorite",
        event.target.checked
       )}
       label={form.isFavorite?"Yes":"No"}
      />
     </Form.Group>
    </Col>
   </Row>

   <div className="text-end">
    <Button type="submit" disabled={saving}>
     {saving
      ?"Saving..."
      :editing?._id
       ?"Save Changes"
       :"Save Output"}
    </Button>
   </div>
  </Form>
 );
}

export default OutputForm;
