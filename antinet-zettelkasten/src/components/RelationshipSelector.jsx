import {Form} from "react-bootstrap";
import {sortItems} from "../utils/sortItems.js";

function RelationshipSelector({label,value=[],records=[],idField,titleField,onChange,showEmpty=true,showId=false}){
 const linkedIds=Array.isArray(value)?value:[];
 const sortedRecords=sortItems(records,record=>record[titleField]||record[idField]);

 const toggle=(id,checked)=>{
  onChange(checked
   ?[...new Set([...linkedIds,id])]
   :linkedIds.filter(valueId=>valueId!==id));
 };

 return(
  <Form.Group className="mb-3 relationship-selector">
   <Form.Label>{label}</Form.Label>
   {sortedRecords.length?(
    <div className="relationship-checkbox-options" role="group" aria-label={label}>
     {sortedRecords.map(record=><Form.Check
      key={record._id}
      type="checkbox"
      id={`${label}-${record._id}`}
      label={`${showId?`${record[idField]||record._id} - `:""}${record[titleField]||"Untitled"}`}
      checked={linkedIds.includes(record._id)}
      onChange={event=>toggle(record._id,event.target.checked)}
     />)}
    </div>
   ):showEmpty?<Form.Text className="d-block">No {label.toLowerCase()} available.</Form.Text>:null}
  </Form.Group>
 );
}

export default RelationshipSelector;
