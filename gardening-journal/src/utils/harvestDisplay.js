export const harvestYear=value=>String(value||'').slice(0,4);
export function shiftHarvestDate(value,period,offset){
 const [year,month,day]=value.split('-').map(Number);
 if(period==='day')return new Date(Date.UTC(year,month-1,day+offset)).toISOString().slice(0,10);
 const target=new Date(Date.UTC(year+(period==='year'?offset:0),month-1+(period==='month'?offset:0),1));
 const lastDay=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();
 target.setUTCDate(Math.min(day,lastDay));
 return target.toISOString().slice(0,10);
}
export function selectHarvests(records,{year=String(new Date().getFullYear()),period='year',date='',garden='',search=''}={},label=()=> ''){
 const needle=search.trim().toLowerCase();
 return records.filter(record=>{
  const recordedDate=String(record.harvestDate||'').slice(0,10);
  const matchesDate=period==='all'||year==='all'||(period==='day'?recordedDate===date:period==='month'?recordedDate.slice(0,7)===date.slice(0,7):harvestYear(record.harvestDate)===year);
  return matchesDate&&(!garden||(garden==='unassigned'?!record.planting?.garden:String(record.planting?.garden?._id||record.planting?.garden||'')===garden))&&(!needle||[label(record),record.planting?.sourceName,record.planting?.seed?.plantName,record.planting?.plant?.name,record.quality?.name,record.harvestDate,...(record.notes||[]).map(note=>note.note)].join(' ').toLowerCase().includes(needle));
 }).sort((a,b)=>new Date(b.harvestDate||0)-new Date(a.harvestDate||0));
}
export function harvestQuantityLabel(record){
 const weight=record.harvestAmount;
 const parts=['lb','oz','g'].filter(unit=>Number(weight?.[unit])).map(unit=>`${Number(weight[unit])} ${unit}`);
 if(parts.length)return parts.join(' / ');
 return record.harvestQuantity!=null?`${record.harvestQuantity} ${record.quantityUnit||''}`.trim():'Not listed';
}
export function harvestValueLabel(record){
 if(record.storeUnitValue!=null&&record.harvestQuantity!=null)return `${(record.harvestQuantity*record.storeUnitValue).toFixed(2)} ${record.currency||''}`.trim();
 if(record.pricingSnapshot?.totalValue!=null)return `${Number(record.pricingSnapshot.totalValue).toFixed(2)} ${record.currency||''}`.trim();
 return 'Not recorded';
}
export function harvestNotes(formNote,record,user){
 const notes=(record?.notes||[]).map(note=>({...note}));
 if(notes.length){notes[0]={...notes[0],note:formNote};return notes;}
 return formNote?[{note:formNote,createdBy:user||null}]:[];
}
