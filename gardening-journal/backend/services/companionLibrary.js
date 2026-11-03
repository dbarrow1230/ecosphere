import Seed from "../models/seeds/seedModel.js";
import Plant from "../models/plants/plantModel.js";

const id=value=>String(value?._id||value||"");
const normalize=value=>String(value||"").trim().toLowerCase();
const splitNames=value=>String(value||"").split(/[,;\n]+/).map(value=>value.trim()).filter(Boolean);
const unique=rows=>[...new Map(rows.map(row=>[`${normalize(row.name)}:${row.relationship}`,row])).values()];

export function buildCompanionLibrary(seeds,plants){
 const seedMap=new Map(seeds.map(seed=>[id(seed),seed]));
 const seedCompanions=(seed,field="companionPlants")=>(seed?.plantingInformation?.[field]||[]).map(reference=>{
  const companion=seedMap.get(id(reference))||(reference&&typeof reference==="object"?reference:null);
  const name=companion?.plantName||companion?.name;
  return name?{name,sourceId:id(reference),relationship:"compatible",source:"Seed Catalog",notes:"",inherited:true}:null;
 }).filter(Boolean);
 const entries=seeds.map(seed=>({libraryKey:`seed:${id(seed)}`,libraryType:"seed",libraryId:id(seed),name:seed.plantName||seed.name||"Unnamed seed",sourceSeedId:id(seed),trapCrops:seedCompanions(seed,"trapCrops"),coverCrops:seedCompanions(seed,"coverCrops"),companions:unique(seedCompanions(seed))}));
 for(const plant of plants){
  const own=[["compatible","compatible"],["incompatible","incompatible"]].flatMap(([field,relationship])=>splitNames(plant.careCard?.[field]).map(name=>({name,relationship,source:"Plant Catalog",notes:"",inherited:true})));
  const inherited=seedCompanions(seedMap.get(id(plant.seed)));
  entries.push({libraryKey:`plant:${id(plant)}`,libraryType:"plant",libraryId:id(plant),name:plant.name||"Unnamed plant",sourceSeedId:id(plant.seed),trapCrops:seedCompanions(seedMap.get(id(plant.seed)),"trapCrops"),coverCrops:seedCompanions(seedMap.get(id(plant.seed)),"coverCrops"),companions:unique([...inherited,...own])});
 }
 return entries.sort((a,b)=>a.name.localeCompare(b.name));
}

export async function loadCompanionLibrary(){
 const [seeds,plants]=await Promise.all([
  Seed.find({}).select("plantName name plantingInformation.companionPlants plantingInformation.trapCrops plantingInformation.coverCrops").lean(),
  Plant.find({}).select("name seed careCard.compatible careCard.incompatible").lean()
 ]);
 return buildCompanionLibrary(seeds,plants);
}

export function mergeLibraryCompanions(saved,library){
 const remaining=new Map(library.map(item=>[item.libraryKey,item]));
 const rows=saved.map(record=>{
  let entry=library.find(item=>item.libraryType===record.libraryType&&item.libraryId===String(record.libraryId));
  if(!record.libraryId){
   const matches=library.filter(item=>normalize(item.name)===normalize(record.name));
   if(matches.length===1)entry=matches[0];
  }
  if(!entry)return record;
  remaining.delete(entry.libraryKey);
  return {...record,name:entry.name,libraryKey:entry.libraryKey,libraryType:entry.libraryType,libraryId:entry.libraryId,companions:unique([...entry.companions,...(record.companions||[])])};
 });
 for(const entry of remaining.values())rows.push({...entry,_id:null,notes:"",companions:entry.companions});
 return rows.sort((a,b)=>a.name.localeCompare(b.name));
}
