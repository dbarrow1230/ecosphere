import {useState} from 'react';
import {Alert,Button,Form} from 'react-bootstrap';
import {parseWorkflowText,workflowTextPatch} from '../utils/workflowTextParser.js';

export default function WorkflowTextImport({form,setForm,recordKey,disabled=false,choices={}}){
 const [text,setText]=useState('');
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const apply=()=>{
  setError('');setMessage('');
  try{
   const records=parseWorkflowText(text);
   const matches=records.filter(record=>Object.hasOwn(record,recordKey));
   const record=matches.length?matches[0]:records.length===1?records[0]:null;
   if(matches.length>1)throw new Error('Paste one record for this workflow at a time.');
   if(!record)throw new Error('No matching workflow record found. Paste the record for this form.');
   const patch=workflowTextPatch(record,form);
   for(const [field,options] of Object.entries(choices)){
    if(!patch[field])continue;
    const selected=options.find(item=>[item.name,item.code,item._id].some(value=>String(value||'').toLowerCase()===String(patch[field]).toLowerCase()));
    if(!selected)throw new Error(`Select or create the ${field} value "${patch[field]}" in this workflow first.`);
    patch[field]=field==='entityType'?selected.code:String(selected._id);
   }
   if(!Object.keys(patch).length)throw new Error('No populated fields match this form.');
   setForm(current=>({...current,...patch}));
   setMessage(`Filled ${Object.keys(patch).length} fields. Review the form, then save. Blank pasted fields were skipped.`);
  }catch(err){setError(err.message);}
 };
 return <section className="workflow-text-import border rounded p-3 mb-3">
  <h3 className="h6">Paste and parse GPT text</h3>
  <Form.Group className="my-3"><Form.Label>Workflow text</Form.Label>
   <Form.Control as="textarea" rows={8} value={text} disabled={disabled} onChange={event=>setText(event.target.value)} placeholder={'title: Your title\nbody:\n<<<\nYour text\n>>>'}/>
   <Form.Text>Paste field: value text. Use &lt;&lt;&lt; and &gt;&gt;&gt; around multiline content. You can paste a full reply containing multiple workflows.</Form.Text>
  </Form.Group>
  <Button type="button" onClick={apply} disabled={disabled||!text.trim()}>Parse text into form</Button>
  {error&&<Alert variant="danger" className="mt-3 mb-0">{error}</Alert>}
  {message&&<Alert variant="success" className="mt-3 mb-0">{message}</Alert>}
 </section>;
}
