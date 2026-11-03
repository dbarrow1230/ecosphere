// /backend/business/statusBusiness.js
import Status from "../models/statusModel.js";

export const getStatusById=async(statusId,options={})=>{
 if(!statusId) return null;
 const query=Status.findById(statusId);
 if(options.lean!==false) query.lean();
 return await query;
};

export const getStatusByTypeAndKey=async(type,key,options={})=>{
 if(!type||!key) return null;
 const query=Status.findOne({type,key,isActive:true});
 if(options.lean!==false) query.lean();
 return await query;
};

export const requireStatusByTypeAndKey=async(type,key,options={})=>{
 const status=await getStatusByTypeAndKey(type,key,options);
 if(!status) throw new Error(`Status not found for ${type}:${key}`);
 return status;
};

export const validateStatusRef=async(statusId,type)=>{
 if(!statusId) return null;
 const status=await Status.findOne({_id:statusId,type,isActive:true}).lean();
 if(!status) throw new Error(`Invalid ${type} status`);
 return status;
};

export const ensureStatusRefs=async(statusMap={})=>{
 const entries=Object.entries(statusMap).filter(([,value])=>value);
 if(!entries.length) return {};
 const ids=entries.map(([,value])=>value);
 const statuses=await Status.find({_id:{$in:ids},isActive:true}).lean();
 const byId=new Map(statuses.map((status)=>[String(status._id),status]));
 const result={};
 for(const [type,id] of entries){
  const status=byId.get(String(id));
  if(!status) throw new Error(`Invalid status ref for ${type}`);
  if(status.type!==type) throw new Error(`Status type mismatch for ${type}`);
  result[type]=status;
 }
 return result;
};

export const getStatusesByType=async(type,options={})=>{
 const query=Status.find({type,isActive:true}).sort({sortOrder:1,name:1});
 if(options.lean!==false) query.lean();
 return await query;
};

export default{
 getStatusById,
 getStatusByTypeAndKey,
 requireStatusByTypeAndKey,
 validateStatusRef,
 ensureStatusRefs,
 getStatusesByType
};