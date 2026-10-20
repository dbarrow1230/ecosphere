import test from "node:test";
import assert from "node:assert/strict";
import GardenBudget from "../backend/models/planning/gardenBudgetModel.js";
import GardenExpense from "../backend/models/planning/gardenExpenseModel.js";
import GardenWish from "../backend/models/planning/gardenWishModel.js";
import FruitCalendar from "../backend/models/planning/fruitCalendarModel.js";
import VegetableCalendar from "../backend/models/planning/vegetableCalendarModel.js";
import CompanionPlanting from "../backend/models/planning/companionPlantingModel.js";
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


test("one plant stores several companions with independent relationships",async()=>{
 const record=new CompanionPlanting({name:"Tomato",companions:[
  {name:"Basil",relationship:"compatible",source:"Garden notes",notes:"First row"},
  {name:"Marigold",relationship:"repellent",source:"Observation",notes:"Second row"},
  {name:"Fennel",relationship:"incompatible",notes:"Keep separate"}
 ]});
 await record.validate();
 const restored=new CompanionPlanting(record.toObject());
 await restored.validate();
 assert.equal(restored.companions.length,3);
 assert.equal(restored.companions[1].name,"Marigold");
 assert.equal(restored.companions[1].relationship,"repellent");
 restored.companions.splice(0,1);
 restored.companions[0].notes="Updated observation";
 await restored.validate();
 assert.equal(restored.companions.length,2);
 assert.equal(restored.companions[0].notes,"Updated observation");
});

test("legacy companion records preserve their original relationship and notes",async()=>{
 const record=new CompanionPlanting({name:"Tomato",companion:"Basil",relationship:"compatible",source:"Notebook",notes:"Original observation"});
 await record.validate();
 assert.equal(record.companions.length,1);
 assert.equal(record.companions[0].name,"Basil");
 assert.equal(record.companions[0].source,"Notebook");
 assert.equal(record.companions[0].notes,"Original observation");
});

test("companion input rejects empty lists, incomplete rows, and duplicates",async()=>{
 const {sanitizeCompanionPlanting,presentCompanionPlanting}=await import("../backend/controllers/planning/companionPlantingController.js");
 assert.throws(()=>sanitizeCompanionPlanting({companions:[]}),/at least one/);
 assert.throws(()=>sanitizeCompanionPlanting({companions:[{name:"",relationship:"compatible"}]}),/name/);
 assert.throws(()=>sanitizeCompanionPlanting({companions:[{name:"Basil",relationship:"unknown"}]}),/relationship/);
 assert.throws(()=>sanitizeCompanionPlanting({companions:[{name:"Basil",relationship:"compatible"},{name:" basil ",relationship:"compatible"}]}),/already/);
 const data=sanitizeCompanionPlanting({name:"Tomato",companions:[{name:" Basil ",relationship:"compatible"},{name:"Marigold",relationship:"repellent"}]});
 assert.equal(data.companions.length,2);
 assert.equal(data.companions[0].name,"Basil");
 assert.equal(presentCompanionPlanting({name:"Tomato",companion:"Basil",relationship:"compatible"}).companions[0].name,"Basil");
 await assert.rejects(new CompanionPlanting({name:"Tomato",companions:[]}).validate(),/at least one/);
});
