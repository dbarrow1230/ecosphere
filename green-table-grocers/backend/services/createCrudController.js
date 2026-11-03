export const createCrudController=Model=>({
 list:async(req,res,next)=>{try{res.json(await Model.find({}).sort({name:1}));}catch(error){next(error);}},
 create:async(req,res,next)=>{try{res.status(201).json(await Model.create(req.body));}catch(error){next(error);}},
 update:async(req,res,next)=>{try{const record=await Model.findByIdAndUpdate(req.params.id,req.body,{returnDocument:"after",runValidators:true});if(!record)return res.status(404).json({message:"Record not found"});res.json(record);}catch(error){next(error);}},
 remove:async(req,res,next)=>{try{const record=await Model.findByIdAndDelete(req.params.id);if(!record)return res.status(404).json({message:"Record not found"});res.json({success:true});}catch(error){next(error);}}
});
