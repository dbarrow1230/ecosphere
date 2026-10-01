import path from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import dotenvx from "@dotenvx/dotenvx";
import mongoose from "mongoose";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const env={};
const loaded=dotenvx.config({path:path.join(root,"poetry-garden/backend/.env"),quiet:true,processEnv:env});
if(loaded.error){console.error(JSON.stringify({status:"environment-failed",code:loaded.error.code}));process.exit(1);}
let client;
try{
 client=await mongoose.mongo.MongoClient.connect(env.MONGO_URI,{serverSelectionTimeoutMS:5000});
 const db=client.db();await db.command({ping:1});
 const available=new Set((await db.listCollections({}, {nameOnly:true}).toArray()).map(item=>item.name));
 const report=[];
 for(const filename of ["AuthorModel.js","GenreModel.js","PoetryForm.js","PoetryCategory.js","PoetryMeter.js","PoetryRhymeScheme.js"]){
  const Model=(await import(pathToFileURL(path.join(root,"poetry-garden/backend/models",filename)).href)).default;
  const collection=Model.collection.collectionName;
  if(!available.has(collection)){report.push({collection,exists:false});continue;}
  const count=await db.collection(collection).countDocuments();
  const indexes=await db.collection(collection).listIndexes().toArray();
  const uniqueChecks=[];
  for(const [keys,options]of Model.schema.indexes()){
   if(!options.unique)continue;
   const id=Object.fromEntries(Object.keys(keys).map(key=>[key,"$"+key]));
   const pipeline=[];
   if(options.partialFilterExpression)pipeline.push({$match:options.partialFilterExpression});
   else if(options.sparse)pipeline.push({$match:{$or:Object.keys(keys).map(key=>({[key]:{$exists:true}}))}});
   pipeline.push({$group:{_id:id,total:{$sum:1}}},{$match:{total:{$gt:1}}},{$count:"groups"});
   const duplicates=await db.collection(collection).aggregate(pipeline).toArray();
   uniqueChecks.push({fields:Object.keys(keys),duplicateGroups:duplicates[0]?.groups||0});
  }
  report.push({collection,exists:true,count,indexes:indexes.map(index=>({name:index.name,key:index.key,unique:!!index.unique})),uniqueChecks});
 }
 const authors=db.collection("authors");
 const legacyAuthors={missingSlug:await authors.countDocuments({slug:{$exists:false}}),nullSlug:await authors.countDocuments({slug:null}),emptySlug:await authors.countDocuments({slug:""})};
 const duplicateNonblank=await authors.aggregate([{$match:{slug:{$type:"string",$ne:""}}},{$group:{_id:"$slug",total:{$sum:1}}},{$match:{total:{$gt:1}}},{$count:"groups"}]).toArray();
 legacyAuthors.duplicateNonblankSlugGroups=duplicateNonblank[0]?.groups||0;
 console.log(JSON.stringify({status:"connected",database:db.databaseName,collections:report,legacyAuthors,databaseWrites:0},null,2));
}catch(error){
 let message=error.message;for(const [key,value]of Object.entries(env))if(/SECRET|KEY|PASSWORD|MONGO.*URI/.test(key)&&value)message=message.split(value).join("[redacted]");
 console.error(JSON.stringify({status:"failed",type:error.name,code:error.code,message,databaseWrites:0}));process.exitCode=1;
}finally{if(client)await client.close();}
