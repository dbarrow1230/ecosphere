import FileLookup from "../models/fileLookupModel.js";

const defaults=[
 ["type","Image","image"],["type","Document","document"],["type","Timesheet","timesheet"],["type","Proof","proof"],
 ["category","General","general"],["category","Production","production"],["category","Session","session"],["category","Hours","hours"]
];

export default async function initializeFileLookups(){
 await FileLookup.bulkWrite(defaults.map(([kind,name,value])=>({
  updateOne:{filter:{kind,value},update:{$setOnInsert:{kind,name,value,isActive:true}},upsert:true}
 })));
}
