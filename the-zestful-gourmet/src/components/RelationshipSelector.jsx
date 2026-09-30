import {useState} from "react";
import {Button,Form} from "react-bootstrap";

function RelationshipSelector({label,value=[],records=[],idField,titleField,onChange,showEmpty=true,addMore=false,showId=true}){
 const [showPicker,setShowPicker]=useState(false);
 const linkedIds=Array.isArray(value)?value:[];
 const linkedRecords=linkedIds.map(id=>records.find(record=>record._id===id)).filter(Boolean);
 const availableRecords=records.filter(record=>!linkedIds.includes(record._id));

 const add=valueToAdd=>{
  if(valueToAdd){
   onChange([...new Set([...linkedIds,valueToAdd])]);
  }
 };

 const remove=valueToRemove=>{
  onChange(linkedIds.filter(id=>id!==valueToRemove));
 };

 return(
  <Form.Group className={`mb-3${addMore?" relationship-selector-add-more":""}`}>
   <Form.Label>{label}</Form.Label>
   <div>
    {linkedRecords.length&&!addMore?(
     <div className="zettel-list-items mb-2">
      {linkedRecords.map(record=>(
       <div className="zettel-list-item" key={record._id}>
        <span>{record[idField]||record._id} - {record[titleField]||"Untitled"}</span>
        <Button type="button" size="sm" variant="outline-danger" onClick={()=>remove(record._id)}>Remove</Button>
       </div>
      ))}
     </div>
    ):showEmpty?(
     <Form.Text className="d-block mb-2">No {label.toLowerCase()}.</Form.Text>
    ):null}

    {addMore&&availableRecords.length?(
     <div className="relationship-add-control">
      <Button type="button" size="sm" variant="outline-primary" onClick={()=>setShowPicker(current=>!current)}>Add More</Button>
      {showPicker&&<div className="relationship-checkbox-picker">
       <div className="relationship-checkbox-options">
        {availableRecords.map(record=><Form.Check key={record._id} type="checkbox" id={`${label}-${record._id}`} label={`${showId?`${record[idField]||record._id} - `:""}${record[titleField]||"Untitled"}`} onChange={event=>event.target.checked&&add(record._id)}/>)}
       </div>
       <Button type="button" size="sm" variant="outline-secondary" onClick={()=>setShowPicker(false)}>Done</Button>
      </div>}
     </div>
    ):!addMore&&availableRecords.length?(
     <div className="d-flex gap-2">
      <Form.Select value="" onChange={event=>add(event.target.value)}>
       <option value="">Select {label.toLowerCase()}...</option>
       {availableRecords.map(record=><option key={record._id} value={record._id}>{record[idField]||record._id} - {record[titleField]||"Untitled"}</option>)}
      </Form.Select>
     </div>
    ):null}

   </div>
   {linkedRecords.length&&addMore?<div className="relationship-attached-values">
    {linkedRecords.map(record=><span key={record._id}>{showId?`${record[idField]||record._id} - `:""}{record[titleField]||"Untitled"}</span>)}
   </div>:null}
  </Form.Group>
 );
}

export default RelationshipSelector;
