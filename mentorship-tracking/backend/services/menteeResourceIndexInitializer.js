import MenteeResource from "../models/resources/menteeResourceModel.js";

export const initializeMenteeResourceIndexes=async()=>{
 const indexes=await MenteeResource.collection.indexes();
 const oldIndex=indexes.find(index=>index.unique&&index.key?.mentee===1&&index.key?.resource===1&&!Object.hasOwn(index.key,"resourceLink"));
 if(oldIndex)await MenteeResource.collection.dropIndex(oldIndex.name);
 await MenteeResource.collection.createIndex(
  {mentee:1,resource:1,resourceLink:1},
  {unique:true,name:"mentee_1_resource_1_resourceLink_1"}
 );
};

export default initializeMenteeResourceIndexes;
