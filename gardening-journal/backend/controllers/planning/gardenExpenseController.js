import GardenExpense from "../../models/planning/gardenExpenseModel.js";

export function sanitizeGardenExpense(body){
 const allowed=["name", "purchaseDate", "vendor", "warranty", "quantity", "unitCost", "savedAmount", "currency", "notes"];
 const data=Object.fromEntries(allowed.filter(key=>body[key]!==undefined).map(key=>[key,body[key]]));
 if(data.purchaseDate==="")data.purchaseDate=null;
 if(data.quantity!==undefined){
  data.quantity=data.quantity===""?0:Number(data.quantity);
  if(data.quantity!==null&&(!Number.isFinite(data.quantity)||data.quantity<0))throw new Error("Quantity must be a nonnegative number");
 }
 if(data.unitCost!==undefined){
  data.unitCost=data.unitCost===""?0:Number(data.unitCost);
  if(data.unitCost!==null&&(!Number.isFinite(data.unitCost)||data.unitCost<0))throw new Error("Price per item must be a nonnegative number");
 }
 if(data.savedAmount!==undefined){
  data.savedAmount=data.savedAmount===""?0:Number(data.savedAmount);
  if(data.savedAmount!==null&&(!Number.isFinite(data.savedAmount)||data.savedAmount<0))throw new Error("Amount saved must be a nonnegative number");
 }
 return data;
}

export async function list(req,res){
 try{res.json(await GardenExpense.find({}).sort({createdAt:-1}));}
 catch(error){res.status(500).json({message:error.message});}
}

export async function create(req,res){
 try{res.status(201).json(await GardenExpense.create(sanitizeGardenExpense(req.body)));}
 catch(error){res.status(400).json({message:error.message});}
}

export async function update(req,res){
 try{
  const record=await GardenExpense.findById(req.params.id);
  if(!record)return res.status(404).json({message:"Expense not found"});
  Object.assign(record,sanitizeGardenExpense(req.body));
  res.json(await record.save());
 }catch(error){res.status(400).json({message:error.message});}
}

export async function remove(req,res){
 try{
  const record=await GardenExpense.findByIdAndDelete(req.params.id);
  if(!record)return res.status(404).json({message:"Expense not found"});
  res.json({message:"Expense deleted"});
 }catch(error){res.status(500).json({message:error.message});}
}
