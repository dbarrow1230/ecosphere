import {costingSnapshot,validateRecipePrices} from "./vendorHistory.js";
import {idOf} from "./pricing.js";
export const prepareCosting=async(connection,mongoose,source,previous=null)=>{
 await connection.asPromise();
 const recipe=await connection.db.collection("recipes").findOne({_id:new mongoose.Types.ObjectId(idOf(source.recipe)),business:new mongoose.Types.ObjectId(idOf(source.business))});
 if(!recipe)throw new Error("Recipe costing must use a recipe assigned to the same business.");
 const ingredients=await validateRecipePrices(connection,mongoose,source);
 const ingredientCost=ingredients.reduce((sum,line)=>sum+Number(line.totalCost||0),0);
 const totals={...source.totals,ingredientCost};
 totals.totalCost=Number(source.totals?.totalCost||0)+ingredientCost-Number(source.totals?.ingredientCost||0);
 if(totals.totalCost<0)totals.totalCost=ingredientCost+Number(totals.laborCost||0)+Number(totals.overheadCost||0);
 const yieldQuantity=Number(source.yield?.imperialQuantity||source.yield?.metricQuantity||recipe.servings||0);
 if(yieldQuantity>0)totals.costPerUnit=totals.totalCost/yieldQuantity;
 const pricing={...source.pricing};
 const sale=Number(pricing.suggestedPrice||0)||Number(pricing.sellingPricePerYield||0)*yieldQuantity;
 if(sale>0){pricing.actualFoodCostPercent=ingredientCost/sale*100;pricing.actualLaborCostPercent=Number(totals.laborCost||0)/sale*100;pricing.actualOverheadCostPercent=Number(totals.overheadCost||0)/sale*100;pricing.actualProfitPercent=(sale-totals.totalCost)/sale*100;if(yieldQuantity>0)pricing.sellingPricePerYield=sale/yieldQuantity;}
 return{...source,ingredients,totals,pricing,...(previous?{costHistory:[...(previous.costHistory||[]),costingSnapshot(previous)]}:{costHistory:[]})};
};
export const installCostingHistory=(schema,connection,mongoose)=>{
 schema.add({costHistory:[{type:mongoose.Schema.Types.Mixed}]});
 schema.set("optimisticConcurrency",true);
 schema.pre("save",async function(){
  const previous=this.isNew?null:await this.constructor.findById(this._id).lean();
  if(!this.isNew&&!["ingredients","totals","pricing","business","recipe","yield"].some(field=>this.isModified(field))){if(this.isModified("costHistory"))this.set("costHistory",previous?.costHistory||[]);return;}
  const prepared=await prepareCosting(connection,mongoose,this.toObject(),previous);
  this.set({ingredients:prepared.ingredients,totals:prepared.totals,pricing:prepared.pricing,costHistory:prepared.costHistory});
 });
 schema.pre("findOneAndUpdate",async function(){
  const update=this.getUpdate();
  if(Object.keys(update).some(key=>key.startsWith("$")&&! ["$set","$setOnInsert"].includes(key)))throw new Error("Costing updates must use ordinary fields.");
  const payload={...Object.fromEntries(Object.entries(update).filter(([key])=>!key.startsWith("$"))),...(update.$set||{})};
  delete payload.costHistory;delete payload._id;delete payload.__v;
  if(Object.keys(payload).some(key=>key.startsWith("$")))throw new Error("Costing updates must use ordinary fields.");
  const previous=await this.model.findOne(this.getQuery()).lean();
  if(!previous)return;
  const changed=["ingredients","totals","pricing","business","recipe","yield"].some(key=>Object.hasOwn(payload,key));
  const prepared=changed?await prepareCosting(connection,mongoose,{...previous,...payload},previous):payload;
  delete prepared._id;delete prepared.__v;delete prepared.createdAt;delete prepared.updatedAt;
  if(schema.options.timestamps)prepared.updatedAt=new Date();
  this.setQuery({...this.getQuery(),__v:previous.__v??{$exists:false}});
  this.setUpdate({$set:prepared,$inc:{__v:1}});
 });
};
