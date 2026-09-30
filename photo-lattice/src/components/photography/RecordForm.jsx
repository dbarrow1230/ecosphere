import {useState} from "react";
import {Alert,Button,Form} from "react-bootstrap";
import RecordFields from "./RecordFields.jsx";
import {localDateTime,recordId} from "../../utils/photographyApi.js";

export default function RecordForm({fields,initialData={},onSave,onCancel,options={},renderBeforeFields,disabled=false}){
 const [values,setValues]=useState(()=>Object.fromEntries(fields.map(field=>{
  let value=initialData[field.name]??field.default??(field.multiple?[]:field.type==="checkbox"?false:"");
  if(field.type==="datetime-local")value=localDateTime(value);
  if(field.type==="date")value=value?String(value).slice(0,10):"";
  if(field.type==="select"&&!field.options)value=field.multiple?value.map(recordId):recordId(value);
  return [field.name,value];
 })));
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const submit=async event=>{
  event.preventDefault();
  if(!event.currentTarget.checkValidity()){event.currentTarget.reportValidity();return;}
  setSaving(true);setError("");
  try{
   const payload={...values};
   for(const field of fields){
    if(["date","datetime-local"].includes(field.type))payload[field.name]=values[field.name]?new Date(values[field.name]).toISOString():null;
    if(field.type==="number")payload[field.name]=values[field.name]===""?null:Number(values[field.name]);
    if(field.type==="select"&&!field.options&&!field.multiple)payload[field.name]=values[field.name]||null;
   }
   await onSave(payload);
  }catch(error){setError(error.message);}finally{setSaving(false);}
 };
 return <Form onSubmit={submit}>
  {error&&<Alert variant="danger">{error}</Alert>}
  <fieldset disabled={saving||disabled}>
   {renderBeforeFields?.({values,onChange:(name,value)=>setValues(current=>({...current,[name]:value}))})}
   <RecordFields fields={fields} values={values} options={options} onChange={(name,value)=>setValues(current=>({...current,[name]:value}))}/>
   <div className="d-flex justify-content-end gap-2 mt-4"><Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button><Button type="submit">{saving?"Saving…":"Save"}</Button></div>
  </fieldset>
 </Form>;
}
