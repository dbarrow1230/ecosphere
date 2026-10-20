from pathlib import Path
import json
resources=json.loads(Path('tmp/garden-review/separate-resources.json').read_text())
imports='\n'.join(f'import {r["model"]} from "../models/planning/{r["stem"]}Model.js";' for r in resources)
Path('backend/services/migrateGardenPlanning.js').write_text('''import mongoose from "mongoose";
'''+imports+'''

// Preserve old records and IDs; reruns never overwrite records edited in the new pages.
export async function migrateGardenPlanning(){
 const legacy=mongoose.connection.collection("garden_planning");
 let copied=0;
 let skipped=0;
 for await(const record of legacy.find({})){
  const models={budgets:GardenBudget,expenses:GardenExpense,wishlist:GardenWish,companions:CompanionPlanting};
  const Model=record.kind==="crop-calendar"
   ?record.cropType==="fruit"?FruitCalendar:record.cropType==="vegetable"?VegetableCalendar:null
   :models[record.kind];
  if(!Model){skipped++;continue;}
  const document=new Model(record);
  await document.validate();
  const data=document.toObject();
  const result=await Model.collection.updateOne({_id:record._id},{$setOnInsert:data},{upsert:true});
  copied+=result.upsertedCount;
 }
 if(copied||skipped)console.log(`Garden planning migration: ${copied} copied; ${skipped} unclassified records retained in original collection.`);
 return {copied,skipped};
}
''',encoding='utf-8')
p=Path('backend/server.js');s=p.read_text();s=s.replace('import express from "express";','import express from "express";\nimport {migrateGardenPlanning} from "./services/migrateGardenPlanning.js";');s=s.replace('await waitForMongo(process.env.MONGO_URI);','await waitForMongo(process.env.MONGO_URI);\n await migrateGardenPlanning();');p.write_text(s)
Path('tests/planningResources.test.js').write_text('''import test from "node:test";
import assert from "node:assert/strict";
'''+ '\n'.join(f'import {r["model"]} from "../backend/models/planning/{r["stem"]}Model.js";' for r in resources)+'''
import {sanitizeFruitCalendar} from "../backend/controllers/planning/fruitCalendarController.js";
import {sanitizeGardenBudget} from "../backend/controllers/planning/gardenBudgetController.js";
import {sanitizeGardenExpense} from "../backend/controllers/planning/gardenExpenseController.js";

test("all six domains use independent database collections",()=>{
 const models=[GardenBudget,GardenExpense,GardenWish,FruitCalendar,VegetableCalendar,CompanionPlanting];
 assert.equal(new Set(models.map(model=>model.collection.name)).size,6);
 assert.equal(GardenBudget.schema.path("sowMonths"),undefined);
 assert.equal(FruitCalendar.schema.path("unitCost"),undefined);
 assert.equal(GardenExpense.schema.path("allottedBudget"),undefined);
});
test("budget and expense calculations obey their own rules",async()=>{
 const budget=new GardenBudget({name:"Beds",quantity:3,unitCost:12,allottedBudget:40});
 await budget.validate();assert.equal(budget.totalCost,36);assert.equal(budget.remainingBudget,4);
 const expense=new GardenExpense({name:"Soil",quantity:3,unitCost:12,savedAmount:6});
 await expense.validate();assert.equal(expense.totalCost,30);
 expense.savedAmount=37;await assert.rejects(expense.validate(),/Savings cannot exceed/);
 const wish=new GardenWish({name:"Tools",quantity:2,unitCost:9});await wish.validate();assert.equal(wish.totalCost,18);
});
test("calendar months are validated and financial fields cannot leak into calendars",()=>{
 assert.deepEqual(sanitizeFruitCalendar({sowMonths:["3","1","3"],unitCost:100}),{sowMonths:[1,3]});
 assert.throws(()=>sanitizeFruitCalendar({sowMonths:[13]}),/Months/);
 assert.throws(()=>sanitizeFruitCalendar({sowMonths:[1.5]}),/Months/);
 assert.throws(()=>sanitizeFruitCalendar({sowMonths:"3,4"}),/array/);
 assert.throws(()=>sanitizeGardenBudget({unitCost:-1}),/nonnegative/);
 assert.throws(()=>sanitizeGardenExpense({savedAmount:"abc"}),/nonnegative/);
});
''',encoding='utf-8')
