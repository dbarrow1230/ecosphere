import GardenWish from "../../models/planning/gardenWishModel.js";

export function sanitizeGardenWish(body){
 const allowed=["name", "description", "quantity", "vendor", "unitCost", "warranty", "currency", "purchased"];
 const data=Object.fromEntries(allowed.filter(key=>body[key]!==undefined).map(key=>[key,body[key]]));
 if(data.quantity!==undefined){
  data.quantity=data.quantity===""?0:Number(data.quantity);
  if(data.quantity!==null&&(!Number.isFinite(data.quantity)||data.quantity<0))throw new Error("Quantity must be a nonnegative number");
 }
 if(data.unitCost!==undefined){
  data.unitCost=data.unitCost===""?0:Number(data.unitCost);
  if(data.unitCost!==null&&(!Number.isFinite(data.unitCost)||data.unitCost<0))throw new Error("Price per item must be a nonnegative number");
 }
 return data;
}

export async function list(req,res){
 try{res.json(await GardenWish.find({}).sort({createdAt:-1}));}
 catch(error){res.status(500).json({message:error.message});}
}

export async function create(req,res){
 try{res.status(201).json(await GardenWish.create(sanitizeGardenWish(req.body)));}
 catch(error){res.status(400).json({message:error.message});}
}

export async function update(req,res){
 try{
  const record=await GardenWish.findById(req.params.id);
  if(!record)return res.status(404).json({message:"Wish List Item not found"});
  Object.assign(record,sanitizeGardenWish(req.body));
  res.json(await record.save());
 }catch(error){res.status(400).json({message:error.message});}
}

export async function remove(req,res){
 try{
  const record=await GardenWish.findByIdAndDelete(req.params.id);
  if(!record)return res.status(404).json({message:"Wish List Item not found"});
  res.json({message:"Wish List Item deleted"});
 }catch(error){res.status(500).json({message:error.message});}
}
