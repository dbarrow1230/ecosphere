from pathlib import Path
Path('backend/services/companionLibrary.js').write_text('''import Seed from "../models/seeds/seedModel.js";
import Plant from "../models/plants/plantModel.js";

const id=value=>String(value?._id||value||"");
const normalize=value=>String(value||"").trim().toLowerCase();
const splitNames=value=>String(value||"").split(/[,;\\n]+/).map(value=>value.trim()).filter(Boolean);
const unique=rows=>[...new Map(rows.map(row=>[`${normalize(row.name)}:${row.relationship}`,row])).values()];

export function buildCompanionLibrary(seeds,plants){
 const seedMap=new Map(seeds.map(seed=>[id(seed),seed]));
 const seedCompanions=seed=>(seed?.plantingInformation?.companionPlants||[]).map(reference=>{
  const companion=seedMap.get(id(reference))||(reference&&typeof reference==="object"?reference:null);
  const name=companion?.plantName||companion?.name;
  return name?{name,relationship:"compatible",source:"Seed Catalog",notes:"",inherited:true}:null;
 }).filter(Boolean);
 const entries=seeds.map(seed=>({libraryKey:`seed:${id(seed)}`,libraryType:"seed",libraryId:id(seed),name:seed.plantName||seed.name||"Unnamed seed",companions:unique(seedCompanions(seed))}));
 for(const plant of plants){
  const own=[["compatible","compatible"],["incompatible","incompatible"]].flatMap(([field,relationship])=>splitNames(plant.careCard?.[field]).map(name=>({name,relationship,source:"Plant Catalog",notes:"",inherited:true})));
  const inherited=seedCompanions(seedMap.get(id(plant.seed)));
  entries.push({libraryKey:`plant:${id(plant)}`,libraryType:"plant",libraryId:id(plant),name:plant.name||"Unnamed plant",companions:unique([...inherited,...own])});
 }
 return entries.sort((a,b)=>a.name.localeCompare(b.name));
}

export async function loadCompanionLibrary(){
 const [seeds,plants]=await Promise.all([
  Seed.find({}).select("plantName name plantingInformation.companionPlants").lean(),
  Plant.find({}).select("name seed careCard.compatible careCard.incompatible").lean()
 ]);
 return buildCompanionLibrary(seeds,plants);
}

export function mergeLibraryCompanions(saved,library){
 const remaining=new Map(library.filter(item=>item.companions.length).map(item=>[item.libraryKey,item]));
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
''',encoding='utf-8')
p=Path('backend/models/planning/companionPlantingModel.js');s=p.read_text(encoding='utf-8').replace(' name:{type:String,trim:true,required:true},\n companions:', ' name:{type:String,trim:true,required:true},\n libraryType:{type:String,enum:["seed","plant",null],default:null},\n libraryId:{type:mongoose.Schema.Types.ObjectId,default:null},\n companions:');s=s.replace('validator:rows=>rows.length>0','validator:function(rows){return rows.length>0||!!this.libraryId;}');p.write_text(s,encoding='utf-8')
p=Path('backend/controllers/planning/companionPlantingController.js');s=p.read_text(encoding='utf-8');s='import mongoose from "mongoose";\nimport {loadCompanionLibrary,mergeLibraryCompanions} from "../../services/companionLibrary.js";\n'+s
s=s.replace(' const data={};',''' const data={};
 if(body.libraryType!==undefined||body.libraryId!==undefined){
  if(!["seed","plant"].includes(body.libraryType)||!mongoose.isValidObjectId(body.libraryId))throw new Error("Select an existing seed or plant from the library");
  data.libraryType=body.libraryType;data.libraryId=body.libraryId;
 }''',1)
s=s.replace('if(!Array.isArray(rows)||!rows.length)','if(!Array.isArray(rows)||(!rows.length&&!data.libraryId))')
s=s.replace('export async function list(req,res){\n try{const rows=await CompanionPlanting.find({}).sort({createdAt:-1});res.json(rows.map(presentCompanionPlanting));}', 'export async function library(req,res){\n try{res.json(await loadCompanionLibrary());}catch(error){res.status(500).json({message:error.message});}\n}\n\nexport async function list(req,res){\n try{const [rows,catalog]=await Promise.all([CompanionPlanting.find({}).sort({createdAt:-1}),loadCompanionLibrary()]);res.json(mergeLibraryCompanions(rows.map(presentCompanionPlanting),catalog));}')
a=s.index('export async function create');b=s.index('\nexport async function remove',a)
s=s[:a]+'''async function resolveCatalogData(body){
 const data=sanitizeCompanionPlanting(body);
 const catalog=await loadCompanionLibrary();
 if(data.libraryId){
  const entry=catalog.find(item=>item.libraryType===data.libraryType&&item.libraryId===String(data.libraryId));
  if(!entry)throw new Error("The selected plant or seed no longer exists in the library");
  data.name=entry.name;
  if(!entry.companions.length&&!data.companions?.length)throw new Error("Add at least one companion plant");
 }
 return {data,catalog};
}

export async function create(req,res){
 try{
  const {data,catalog}=await resolveCatalogData(req.body);
  if(data.libraryId&&await CompanionPlanting.exists({libraryType:data.libraryType,libraryId:data.libraryId}))return res.status(409).json({message:"This plant already has a companion list. Open its existing list to edit it."});
  const record=await CompanionPlanting.create(data);
  res.status(201).json(mergeLibraryCompanions([presentCompanionPlanting(record)],catalog).find(item=>String(item._id)===String(record._id)));
 }catch(error){res.status(400).json({message:error.message});}
}

export async function update(req,res){
 try{
  const record=await CompanionPlanting.findById(req.params.id);
  if(!record)return res.status(404).json({message:"Companion Relationship not found"});
  const {data,catalog}=await resolveCatalogData({...req.body,libraryType:req.body.libraryType??record.libraryType,libraryId:req.body.libraryId??record.libraryId});
  if(data.libraryId&&await CompanionPlanting.exists({libraryType:data.libraryType,libraryId:data.libraryId,_id:{$ne:record._id}}))return res.status(409).json({message:"This plant already has a companion list."});
  Object.assign(record,data);
  if(req.body.companions!==undefined){record.companion=undefined;record.relationship=undefined;record.source=undefined;}
  await record.save();
  res.json(mergeLibraryCompanions([presentCompanionPlanting(record)],catalog).find(item=>String(item._id)===String(record._id)));
 }catch(error){res.status(400).json({message:error.message});}
}
''' +s[b:]
# Don't force legacy unlinked updates to carry null link fields.
s=s.replace('if(body.libraryType!==undefined||body.libraryId!==undefined){','if(body.libraryType!=null||body.libraryId!=null){')
p.write_text(s,encoding='utf-8')
p=Path('backend/routes/planning/companionPlantingRoutes.js');s=p.read_text(encoding='utf-8').replace('{list,create,update,remove}','{list,library,create,update,remove}').replace('router.get("/",list);','router.get("/library",library);\nrouter.get("/",list);');p.write_text(s,encoding='utf-8')
