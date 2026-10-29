import Revision from "../models/revisionModel.js";

const firstValue=(record,fields)=>{
 for(const field of fields){
  const value=record?.[field];
  if(value!==undefined&&value!==null&&value!==""){
   return typeof value==="string"?value:JSON.stringify(value);
  }
 }
 return "";
};

const snapshotOf=record=>{
 const snapshot=typeof record?.toObject==="function"?record.toObject():{...record};
 delete snapshot.__v;
 return snapshot;
};

export const recordRevision=async({
 userId,
 parentModel,
 record,
 displayIdFields=[],
 titleFields=[],
 contentFields=[]
})=>{
 if(!userId||!record?._id)return null;

 const base={
  userId,
  parentModel,
  parentRecordId:record._id,
  parentDisplayId:firstValue(record,displayIdFields),
  title:firstValue(record,titleFields),
  content:firstValue(record,contentFields),
  summary:`Updated ${parentModel}`,
  changeNote:"Record updated",
  snapshot:snapshotOf(record)
 };

 for(let attempt=0;attempt<2;attempt+=1){
  const latest=await Revision.findOne({userId,parentModel,parentRecordId:record._id})
   .sort({version:-1})
   .select("version")
   .lean();

  try{
   return await Revision.create({...base,version:(latest?.version||0)+1});
  }catch(error){
   if(error.code!==11000||attempt===1)throw error;
  }
 }

 return null;
};
