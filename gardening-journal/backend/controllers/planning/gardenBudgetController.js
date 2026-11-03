import GardenBudget from "../../models/planning/gardenBudgetModel.js";

export function sanitizeGardenBudget(body){
 const allowed=["name", "description", "year", "quantity", "unitCost", "allottedBudget", "currency"];
 const data=Object.fromEntries(allowed.filter(key=>body[key]!==undefined).map(key=>[key,body[key]]));
 if(data.year!==undefined){
  data.year=data.year===""?null:Number(data.year);
  if(data.year!==null&&(!Number.isFinite(data.year)||data.year<0))throw new Error("Budget year must be a nonnegative number");
 }
 if(data.quantity!==undefined){
  data.quantity=data.quantity===""?0:Number(data.quantity);
  if(data.quantity!==null&&(!Number.isFinite(data.quantity)||data.quantity<0))throw new Error("Quantity must be a nonnegative number");
 }
 if(data.unitCost!==undefined){
  data.unitCost=data.unitCost===""?0:Number(data.unitCost);
  if(data.unitCost!==null&&(!Number.isFinite(data.unitCost)||data.unitCost<0))throw new Error("Cost per item must be a nonnegative number");
 }
 if(data.allottedBudget!==undefined){
  data.allottedBudget=data.allottedBudget===""?0:Number(data.allottedBudget);
  if(data.allottedBudget!==null&&(!Number.isFinite(data.allottedBudget)||data.allottedBudget<0))throw new Error("Allotted budget must be a nonnegative number");
 }
 return data;
}

export async function list(req,res){
 try{res.json(await GardenBudget.find({}).sort({createdAt:-1}));}
 catch(error){res.status(500).json({message:error.message});}
}

export async function create(req,res){
 try{res.status(201).json(await GardenBudget.create(sanitizeGardenBudget(req.body)));}
 catch(error){res.status(400).json({message:error.message});}
}

export async function update(req,res){
 try{
  const record=await GardenBudget.findById(req.params.id);
  if(!record)return res.status(404).json({message:"Budget Item not found"});
  Object.assign(record,sanitizeGardenBudget(req.body));
  res.json(await record.save());
 }catch(error){res.status(400).json({message:error.message});}
}

export async function remove(req,res){
 try{
  const record=await GardenBudget.findByIdAndDelete(req.params.id);
  if(!record)return res.status(404).json({message:"Budget Item not found"});
  res.json({message:"Budget Item deleted"});
 }catch(error){res.status(500).json({message:error.message});}
}
