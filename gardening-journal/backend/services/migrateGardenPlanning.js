import mongoose from "mongoose";
import GardenBudget from "../models/planning/gardenBudgetModel.js";
import GardenExpense from "../models/planning/gardenExpenseModel.js";
import GardenWish from "../models/planning/gardenWishModel.js";
import FruitCalendar from "../models/planning/fruitCalendarModel.js";
import VegetableCalendar from "../models/planning/vegetableCalendarModel.js";
import CompanionPlanting from "../models/planning/companionPlantingModel.js";

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
  try{
   await document.validate();
  }catch{
   skipped++;
   continue;
  }
  const data=document.toObject();
  const result=await Model.collection.updateOne({_id:record._id},{$setOnInsert:data},{upsert:true});
  copied+=result.upsertedCount;
 }
 if(copied||skipped)console.log(`Garden planning migration: ${copied} copied; ${skipped} unclassified records retained in original collection.`);
 return {copied,skipped};
}
