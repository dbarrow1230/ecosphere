import {Form} from "react-bootstrap";
import {sortItems} from "../utils/sortItems.js";

export default function SortedSelect({
 name,
 value,
 onChange,
 options=[],
 getValue=item=>item.value,
 getLabel=item=>item.label,
 placeholder="Select option",
 disabled=false,
 required=false,
 className="",
 sort=true,
 customSort
}){

 const sortedOptions=sort
  ?[...options].sort((a,b)=>{
   if(customSort)return customSort(a,b);
   return String(getLabel(a)||"").localeCompare(String(getLabel(b)||""),undefined,{sensitivity:"base"});
  })
  :options;

 return(
  <Form.Select name={name} value={value} onChange={onChange} disabled={disabled} required={required} className={className}>
   <option value="">{placeholder}</option>
   {sortedOptions.map(option=>(
    <option key={getValue(option)} value={getValue(option)}>{getLabel(option)}</option>
   ))}
  </Form.Select>
 );
}