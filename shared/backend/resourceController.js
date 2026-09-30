// CRUD for simple standalone resources. Each app supplies its own model/connection.
export function resourceController(Model,{singular,plural}){
 const payload=body=>Object.fromEntries(Object.entries(body||{}).filter(([key])=>!['_id','__v','createdAt','updatedAt'].includes(key)&&!key.startsWith('$')&&!key.includes('.')&&Model.schema.path(key)));
 const failure=(res,error)=>res.status(error.name==='ValidationError'||error.name==='CastError'?400:error.code===11000?409:500).json({message:error.message});
 return {
  list:async(req,res)=>{try{return res.json({[plural]:await Model.find().sort({name:1}).lean()});}catch(error){return failure(res,error);}},
  get:async(req,res)=>{try{const row=await Model.findById(req.params.id).lean();return row?res.json({[singular]:row}):res.status(404).json({message:'Record not found.'});}catch(error){return failure(res,error);}},
  create:async(req,res)=>{try{const row=await Model.create(payload(req.body));return res.status(201).json({[singular]:row,message:'Record created.'});}catch(error){return failure(res,error);}},
  update:async(req,res)=>{try{const row=await Model.findByIdAndUpdate(req.params.id,{$set:payload(req.body)},{returnDocument:'after',runValidators:true});return row?res.json({[singular]:row,message:'Record updated.'}):res.status(404).json({message:'Record not found.'});}catch(error){return failure(res,error);}},
  remove:async(req,res)=>{try{const row=await Model.findByIdAndDelete(req.params.id);return row?res.json({message:'Record deleted.'}):res.status(404).json({message:'Record not found.'});}catch(error){return failure(res,error);}}
 };
}
