export async function resolvePublicBusiness(AppKey,Business,appKey){
 const assignment=await AppKey.findOne({appKey,isActive:true}).populate("businessRef");
 if(assignment)return assignment.businessRef?.isActive===false?null:assignment.businessRef;
 const escaped=appKey.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/[-\s]+/g,"\\s*");
 return Business.findOne({isActive:{$ne:false},$or:[{code:appKey},{code:appKey.replaceAll('-','')},{legalName:{$regex:`^${escaped}$`,$options:'i'}}]});
}
