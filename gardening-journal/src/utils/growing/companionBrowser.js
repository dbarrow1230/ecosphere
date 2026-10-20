const keyFor=row=>row.libraryKey||(row.libraryType&&row.libraryId?`${row.libraryType}:${row.libraryId}`:row._id?`saved:${row._id}`:"");
const sortByName=(a,b)=>a.name.localeCompare(b.name);

export function buildCompanionBrowserEntries(catalog,records){
 const entries=new Map(catalog.map(item=>[keyFor(item),{...item,_id:null,notes:"",browserKey:keyFor(item)}]));
 for(const record of records){
  const key=keyFor(record);
  if(!key)continue;
  entries.set(key,{...entries.get(key),...record,browserKey:key});
 }
 return [...entries.values()].sort(sortByName);
}

export function compatibleCompanions(record){
 return (record?.companions||[]).filter(row=>row.relationship!=="incompatible");
}
