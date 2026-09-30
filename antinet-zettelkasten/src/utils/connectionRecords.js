const aliases={ZETTEL:"ZTL",NOTE:"ZTL",SOURCE:"SRC",ENTITY:"ENT",STRUCTURENOTE:"STR",OUTPUT:"OUT",FLEETINGNOTE:"FLT",PROJECT:"PRJ"};
export const normalizeConnectionRecordType=value=>{const type=String(value||"").replace(/[^a-z0-9]/gi,"").toUpperCase();return aliases[type]||type;};
export const resolveConnectionRecord=(index,type,value)=>{
 const id=typeof value==="string"?value:value?._id?.$oid||value?._id||value?.$oid||value?.id;
 const normalizedType=normalizeConnectionRecordType(type);
 const exact=index[normalizedType+":"+id];
 if(exact)return {record:exact,type:normalizedType};
 const matches=Object.entries(index).filter(([key,record])=>key.endsWith(":"+id)||[record.zettelId,record.sourceId,record.entityId,record.structureNoteId,record.outputId,record.fleetingNoteId,record.projectId].some(displayId=>typeof displayId==="string"&&displayId===id));
 if(matches.length===1)return {record:matches[0][1],type:matches[0][0].split(":")[0]};
 if(value&&typeof value==="object"&&(value.title||value.name||value.rawCapture))return {record:value,type:normalizedType};
 return null;
};
