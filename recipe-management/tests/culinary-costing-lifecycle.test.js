import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import {installCostingHistory,prepareCosting} from "../../shared/culinary/costingLifecycle.js";
const oid=index=>new mongoose.Types.ObjectId(index.toString(16).padStart(24,"0"));
const business=oid(1),recipe=oid(2),ingredient=oid(3),vendor=oid(4),offering=oid(5),unit=oid(6);
const rows={recipes:[{_id:recipe,business,servings:2}],ingredients:[{_id:ingredient}],vendors:[{_id:vendor}],vendor_ingredient_prices:[{_id:offering,business,ingredient,vendor,metricQuantity:1,metricUnit:unit,packCost:12}],metric_units:[{_id:unit,symbol:"kg"}],imperial_units:[]};
const connection={asPromise:async()=>{},db:{collection:name=>({find:()=>({toArray:async()=>rows[name]||[]}),findOne:async query=>(rows[name]||[]).find(row=>Object.entries(query).every(([key,value])=>key==="$or"||key==="isActive"||String(row[key])===String(value)))||null})}};
const source={business,recipe,ingredients:[{ingredient,vendor,vendorIngredientPrice:offering,metricQuantity:.5,metricUnit:unit,unitCost:0,totalCost:5}],yield:{metricQuantity:2},totals:{ingredientCost:5,laborCost:3,overheadCost:2,totalCost:10},pricing:{suggestedPrice:20,foodCostPercent:30}};
test("server costing validation converts raw IDs, preserves financial conventions and snapshots",async()=>{
 const result=await prepareCosting(connection,mongoose,source,{...source,costHistory:[]});assert.equal(result.ingredients[0].totalCost,6);assert.equal(result.ingredients[0].priceSnapshot.packCost,12);assert.equal(result.totals.totalCost,11);assert.equal(result.totals.laborCost,3);assert.equal(result.pricing.suggestedPrice,20);assert.equal(result.pricing.actualFoodCostPercent,30);assert.equal(result.pricing.sellingPricePerYield,10);assert.equal(result.costHistory[0].totals.totalCost,10);
 await assert.rejects(()=>prepareCosting(connection,mongoose,{...source,business:oid(99)}),/same business/);
 await assert.rejects(()=>prepareCosting(connection,mongoose,{...source,ingredients:[{...source.ingredients[0],vendor:oid(99)}]}),/does not match/);
});
test("Mongoose save and update middleware retain prior approved costing revisions",async()=>{
 const isolated=mongoose.createConnection();
 const schema=new mongoose.Schema({business:mongoose.Schema.Types.ObjectId,recipe:mongoose.Schema.Types.ObjectId,ingredients:[mongoose.Schema.Types.Mixed],yield:mongoose.Schema.Types.Mixed,totals:mongoose.Schema.Types.Mixed,pricing:mongoose.Schema.Types.Mixed},{timestamps:true});
 installCostingHistory(schema,connection,mongoose);
 const Model=isolated.model("CulinaryValidationCosting",schema);let persisted=null;
 Model.collection.insertOne=async document=>{persisted=document;return{acknowledged:true,insertedId:document._id};};
 Model.collection.updateOne=async(_query,update)=>{persisted={...persisted,...update.$set};return{acknowledged:true,matchedCount:1,modifiedCount:1};};
 const row=await Model.create(source);assert.equal(row.totals.ingredientCost,6);assert.equal(row.costHistory.length,0);
 const savedSnapshot={...row.toObject()};Model.findById=()=>({lean:async()=>savedSnapshot});Model.findOne=()=>({lean:async()=>savedSnapshot});
 let captured;
 Model.collection.findOneAndUpdate=async(filter,update)=>{captured={filter,update};return{...savedSnapshot,...update.$set};};
 const updated=await Model.findOneAndUpdate({_id:row._id},{totals:{...row.totals,laborCost:4,totalCost:12}},{returnDocument:"after",runValidators:true});
 assert.equal(updated.costHistory.length,1);assert.equal(updated.costHistory[0].totals.totalCost,11);assert.equal(captured.filter.__v,0);assert.equal(captured.update.$inc.__v,1);
 await isolated.close();
});

