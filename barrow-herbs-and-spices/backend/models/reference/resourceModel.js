import mongoose from 'mongoose';
// Original collections are empty and have no validators. Preserve unknown
// fields and the actual existing indexes instead of imposing guessed types.
const indexes={vendors:[{email:1}],equipment_vendors:[{vendor_name:1}],equipment:[{equipment_id:1}],category:[{name:1}],types:[{name:1}]};
export function createResourceModel(connection,name,collection){
 const schema=new mongoose.Schema({}, {collection,strict:false,timestamps:false,autoCreate:false,autoIndex:false});
 for(const fields of indexes[collection]||[]){
  for(const field of Object.keys(fields))schema.add({[field]:mongoose.Schema.Types.Mixed});
  schema.index(fields,{unique:true});
 }
 return connection.models[name]||connection.model(name,schema);
}
