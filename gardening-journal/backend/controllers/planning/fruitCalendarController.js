import FruitCalendar from "../../models/planning/fruitCalendarModel.js";

export function sanitizeFruitCalendar(body){
 const allowed=["name", "variety", "location", "sowMonths", "plantMonths", "harvestMonths", "notes"];
 const data=Object.fromEntries(allowed.filter(key=>body[key]!==undefined).map(key=>[key,body[key]]));
 if(data.sowMonths!==undefined){
  if(!Array.isArray(data.sowMonths))throw new Error("Sow months must be an array");
  data.sowMonths=[...new Set(data.sowMonths.map(Number))].sort((a,b)=>a-b);
  if(data.sowMonths.some(value=>!Number.isInteger(value)||value<1||value>12))throw new Error("Months must be whole numbers from 1 to 12");
 }
 if(data.plantMonths!==undefined){
  if(!Array.isArray(data.plantMonths))throw new Error("Plant / transplant months must be an array");
  data.plantMonths=[...new Set(data.plantMonths.map(Number))].sort((a,b)=>a-b);
  if(data.plantMonths.some(value=>!Number.isInteger(value)||value<1||value>12))throw new Error("Months must be whole numbers from 1 to 12");
 }
 if(data.harvestMonths!==undefined){
  if(!Array.isArray(data.harvestMonths))throw new Error("Harvest months must be an array");
  data.harvestMonths=[...new Set(data.harvestMonths.map(Number))].sort((a,b)=>a-b);
  if(data.harvestMonths.some(value=>!Number.isInteger(value)||value<1||value>12))throw new Error("Months must be whole numbers from 1 to 12");
 }
 return data;
}

export async function list(req,res){
 try{res.json(await FruitCalendar.find({}).sort({createdAt:-1}));}
 catch(error){res.status(500).json({message:error.message});}
}

export async function create(req,res){
 try{res.status(201).json(await FruitCalendar.create(sanitizeFruitCalendar(req.body)));}
 catch(error){res.status(400).json({message:error.message});}
}

export async function update(req,res){
 try{
  const record=await FruitCalendar.findById(req.params.id);
  if(!record)return res.status(404).json({message:"Fruit Schedule not found"});
  Object.assign(record,sanitizeFruitCalendar(req.body));
  res.json(await record.save());
 }catch(error){res.status(400).json({message:error.message});}
}

export async function remove(req,res){
 try{
  const record=await FruitCalendar.findByIdAndDelete(req.params.id);
  if(!record)return res.status(404).json({message:"Fruit Schedule not found"});
  res.json({message:"Fruit Schedule deleted"});
 }catch(error){res.status(500).json({message:error.message});}
}
