import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {config} from '@dotenvx/dotenvx';
import mongoose from 'mongoose';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
config({path:[path.resolve(root,'../config/.env.mongo'),path.join(root,'backend/.env')],quiet:true});
await mongoose.connect(process.env.MONGO_URI);
const files=['seeds/seedModel.js','species/speciesModel.js','plants/plantModel.js','plants/plantingModel.js','equipment/equipmentModel.js','gardens/gardenModel.js','journal/journalEntryModel.js','journal/observationModel.js','harvest/harvestModel.js','tasks/taskModel.js','pests/pestmodel.js','vendors/equipmentVendorModel.js','vendors/seedVendorModel.js','planning/gardenBudgetModel.js'];
const results=[];
try{
 for(const file of files){
  const {default:Model}=await import(pathToFileURL(path.join(root,'backend/models',file)));
  let total=0,invalid=0;const fields={};
  for await(const record of mongoose.connection.collection(Model.collection.name).find({})){
   total++;
   try{await Model.hydrate(record).validate();}
   catch(error){invalid++;for(const [key,detail] of Object.entries(error.errors||{})){const label=`${key} (${detail.kind||detail.name})`;fields[label]=(fields[label]||0)+1;}}
  }
  results.push({model:Model.modelName,total,invalid,fields});
 }
 fs.mkdirSync(path.join(root,'docs/audits'),{recursive:true});
 fs.writeFileSync(path.join(root,'docs/audits/model-validation.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify(results));
}finally{await mongoose.disconnect();}
