export default function RecordDetails({record,fields}){
 const format=(value,field)=>{
  if(value===null||value===undefined||value==="")return "—";
  if(field.type==="checkbox")return value?"Yes":"No";
  if(Array.isArray(value))return value.map(item=>typeof item==="object"?item.name||item.title||item._id:item).join(", ")||"—";
  if(typeof value==="object")return value.name||value.title||"—";
  if(field.type==="datetime-local")return new Date(value).toLocaleString();
  if(field.type==="date")return String(value).slice(0,10);
  return String(value);
 };
 return <dl className="row mb-0">{fields.map(field=><div className="col-md-6 mb-3" key={field.name}><dt>{field.label}</dt><dd className="mb-0" style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{format(record[field.name],field)}</dd></div>)}</dl>;
}
