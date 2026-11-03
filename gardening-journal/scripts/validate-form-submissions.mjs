import fs from 'node:fs';
import {cleanSeedData} from '../backend/controllers/seeds/seedController.js';
import {normalizeEntryPayload} from '../backend/controllers/journal/journalEntryController.js';
import {normalizePlantingPayload} from '../backend/controllers/plants/plantingController.js';
const models={
 plants:'plants/plantModel.js',seeds:'seeds/seedModel.js','seed-collections':'seeds/seedCollectionModel.js',pests:'pests/pestmodel.js',diseases:'diseases/diseaseModel.js',equipment:'equipment/equipmentModel.js',gardens:'gardens/gardenModel.js','garden-sections':'gardens/gardenSectionModel.js',plantings:'plants/plantingModel.js','garden-budgets':'planning/gardenBudgetModel.js','garden-expenses':'planning/gardenExpenseModel.js','garden-wishlist':'planning/gardenWishModel.js','fruit-calendar':'planning/fruitCalendarModel.js','vegetable-calendar':'planning/vegetableCalendarModel.js',supplies:'supplies/supplyModel.js',observations:'journal/observationModel.js','fertilizer-applications':'fertilizers/fertilizerApplicationModel.js',issues:'issues/issueModel.js',harvests:'harvest/harvestModel.js',tasks:'tasks/taskModel.js','journal-entries':'journal/journalEntryModel.js','hydro-systems':'hydroponics/hydroSystemModel.js','companion-planting':'planning/companionPlantingModel.js','equipment-vendors':'vendors/equipmentVendorModel.js','seed-vendors':'vendors/seedVendorModel.js','supply-vendors':'vendors/supplyVendorModel.js'
};
const cases=JSON.parse(fs.readFileSync(new URL('../docs/audits/form-submissions.json',import.meta.url)));
const results=[];
for(const item of cases)for(const request of item.requests||[]){
 const endpoint=request.url.match(/\/api\/([^/?]+)/)?.[1];
 if(!models[endpoint])continue;
 const {default:Model}=await import('../backend/models/'+models[endpoint]);
 let payload=structuredClone(request.payload);
 if(endpoint==='seeds')payload={...cleanSeedData(payload),user:payload.user};
 if(endpoint==='journal-entries')payload=normalizeEntryPayload(payload);
 if(endpoint==='plantings')payload=normalizePlantingPayload(payload);
 if(['seed-vendors','equipment-vendors','supply-vendors'].includes(endpoint)){
  payload.state||=null;payload.country||=null;
 }
 const document=new Model(payload);
 let errors=[];try{await document.validate();}catch(error){errors=Object.values(error.errors||{}).map(detail=>({path:detail.path,kind:detail.kind,message:detail.message}));}
 results.push({page:item.path,endpoint,method:request.method,valid:!errors.length,errors});
}
fs.writeFileSync(new URL('../docs/audits/form-model-validation.json',import.meta.url),JSON.stringify(results,null,2));
console.log(JSON.stringify({checked:results.length,failures:results.filter(result=>!result.valid)}));
if(results.some(result=>!result.valid))process.exitCode=1;
