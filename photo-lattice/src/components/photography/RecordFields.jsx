import {Form,Row,Col} from "react-bootstrap";
import {recordId} from "../../utils/photographyApi.js";

export default function RecordFields({fields,values,onChange,options={}}){
 return <Row className="g-3">{fields.map(field=>{
  const value=values[field.name];
  const common={id:`photo-field-${field.name}`,name:field.name,required:field.required,onChange:event=>onChange(field.name,field.type==="checkbox"?event.target.checked:field.multiple?Array.from(event.target.selectedOptions,option=>option.value):event.target.value)};
  const choices=field.options||options[field.name]||[];
  return <Col md={field.type==="textarea"?12:6} key={field.name}>
   <Form.Group controlId={common.id}>
    {field.type!=="checkbox"&&<Form.Label>{field.label}</Form.Label>}
    {field.type==="checkbox"?<Form.Check {...common} checked={!!value} label={field.label}/>:
     field.type==="select"?<Form.Select {...common} multiple={field.multiple} value={value??(field.multiple?[]:"")}>
      {!field.multiple&&<option value="">{field.required?"Select an option":"None"}</option>}
      {choices.map(option=>typeof option==="string"?<option key={option} value={option}>{option}</option>:<option key={recordId(option)} value={recordId(option)}>{option.name||option.title}</option>)}
     </Form.Select>:
     <Form.Control {...common} as={field.type==="textarea"?"textarea":"input"} type={field.type==="textarea"?undefined:field.type||"text"} rows={field.type==="textarea"?3:undefined} value={value??""} min={field.min} max={field.max} step={field.step} maxLength={field.maxLength|| (field.type==="textarea"?10000:undefined)}/>
    }
    {field.multiple&&<Form.Text>Select multiple items with Ctrl or Command.</Form.Text>}
   </Form.Group>
  </Col>;
 })}</Row>;
}
