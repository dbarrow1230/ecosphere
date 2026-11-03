const listFields=new Set(['projectIds','sourceIds','entityIds','relatedSourceIds','linkedZettelIds','linkedOutputIds','linkedSources','linkedZettels','linkedOutputs','needsResearchQuestions','researchedQuestions']);
const extraFields=new Set(['needsResearchQuestions','researchedQuestions','questionAnswers','subjectCode','idSubtype']);

// Blocks protect literal colons and field-like lines inside long text.
export function parseWorkflowText(text){
 const records=[];
 let record={},key='',lines=[],block=false;
 const flush=()=>{if(key)record[key]=lines.join('\n').trim();lines=[];};
 for(const line of String(text).replace(/\r\n?/g,'\n').split('\n')){
  if(line.trim()==='<<<'){block=true;continue;}
  if(line.trim()==='>>>'){block=false;continue;}
  if(block){lines.push(line);continue;}
  if(/^\s*```/.test(line))continue;
  // Chat copies sometimes join the next record to the previous status line.
  const parts=line.split(/\s+(?=userId\s*:)/);
  for(const part of parts){
   const match=part.match(/^\s*([a-zA-Z][a-zA-Z0-9]*)\s*:\s*(.*)$/);
   if(match&&!(key==='questionAnswers'&&['question','answer'].includes(match[1]))){
    flush();
    if(match[1]==='userId'&&Object.keys(record).length){records.push(record);record={};}
    key=match[1];lines=[match[2]];
   }else if(key)lines.push(part);
  }
 }
 if(block)throw new Error('Close the multiline block with >>> before importing.');
 flush();if(Object.keys(record).length)records.push(record);
 return records;
}

export function workflowTextPatch(record,form){
 const patch={};
 for(const [key,value] of Object.entries(record)){
  if(key==='userId'||!value.trim()||(!Object.hasOwn(form,key)&&!extraFields.has(key)))continue;
  if(key==='questionAnswers'){
   const pairs=[...value.matchAll(/(?:^|\n)question:\s*([^]*?)(?:\n)answer:\s*([^]*?)(?=\nquestion:|$)/g)];
   if(!pairs.length)throw new Error('Use question: followed by answer: for each question answer.');
   patch[key]=pairs.map(([,question,answer])=>({question:question.trim(),answer:answer.trim()}));
  }else if(key==='typeData'){
   try{patch[key]=JSON.parse(value);}catch{throw new Error('typeData must contain a JSON object.');}
   if(!patch[key]||Array.isArray(patch[key])||typeof patch[key]!=='object')throw new Error('typeData must contain a JSON object.');
  }else if(typeof form[key]==='boolean'){
   if(!/^(true|false)$/i.test(value))throw new Error(`${key} must be true or false.`);
   patch[key]=value.toLowerCase()==='true';
  }else if(listFields.has(key)||Array.isArray(form[key]))patch[key]=value.split(/\n|,/).map(item=>item.trim()).filter(Boolean);
  else patch[key]=value;
 }
 return patch;
}
