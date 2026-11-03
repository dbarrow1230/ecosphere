import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {config} from '@dotenvx/dotenvx';
import mongoose from 'mongoose';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
config({path:[path.resolve(root,'../config/.env.mongo'),path.join(root,'backend/.env')],quiet:true});
await mongoose.connect(process.env.MONGO_URI);
const base=process.env.GARDEN_AUDIT_URL||'http://127.0.0.1:5186';
const response=await fetch(base+'/api/journal-entries');
if(!response.ok)throw new Error(`Journal API returned ${response.status}`);
const records=await response.json();
const entries=new Map(records.map(record=>[String(record._id),record]));
const failures=[];let checked=0,capitalized=0;
const list=value=>Array.isArray(value)?value:value==null?[]:[value];
try{
 for await(const source of mongoose.connection.collection('plant_journals').find({})){
  checked++;if('Notes' in source)capitalized++;
  const current=entries.get(String(source._id));
  const issues=[];
  if(!current){failures.push({id:String(source._id),issues:['Entry missing from live API']});continue;}
  const displayed=[current.entry,...list(current.notes).map(note=>note.note)].filter(Boolean).join('\n');
  const originalTexts=[source.Notes,source.stage_progress,...list(source.actionsTaken),...list(source.fertilizer_notes),...list(source.notes).map(note=>typeof note==='string'?note:note?.note),source.nutrients??source.Nutrients].filter(value=>typeof value==='string'&&value.trim());
  for(const value of originalTexts)if(!displayed.includes(value.trim()))issues.push('Original text omitted');
  const originalDate=source.journal_date??source.JournalDate;
  if(originalDate&&new Date(current.entryDate).toISOString().slice(0,10)!==new Date(originalDate).toISOString().slice(0,10))issues.push('Original journal date omitted or changed');
  for(const photo of source.photos||[])if(photo.file_path&&!current.images?.includes(photo.file_path))issues.push('Original image reference omitted');
  for(const [label,value] of [['pH',source.phLevel],['Height',source.growth_height?.inches],['Height',source.growth_height?.cm],['Temperature',source.weather?.temperature?.fahrenheit],['Temperature',source.weather?.temperature?.celsius],['Humidity',source.weather?.humidity],['Rain',source.weather?.rain]])if(value!=null&&!String(current.entry).includes(`${label}:`) )issues.push(`${label} omitted`);
  if(issues.length)failures.push({id:String(source._id),issues:[...new Set(issues)]});
 }
 const report={checkedAt:new Date().toISOString(),originalRecordsChecked:checked,capitalizedFormatRecordsChecked:capitalized,liveEntryCount:records.length,failures,limitations:['Verifies saved text, original dates, measured-value labels and image references against the live API.','Image references do not prove image files exist.','Unresolvable source relationships are not guessed.']};
 fs.mkdirSync(path.join(root,'docs/audits'),{recursive:true});
 fs.writeFileSync(path.join(root,'docs/audits/journal-content-audit.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));if(failures.length)process.exitCode=1;
}finally{await mongoose.disconnect();}
