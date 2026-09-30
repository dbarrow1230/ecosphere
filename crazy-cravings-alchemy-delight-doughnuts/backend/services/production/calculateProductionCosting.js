// backend/services/production/calculateProductionCosting.js
import ProductionBatch from "../../models/production/ProductionBatchModel.js";
import ProductionCosting from "../../models/production/ProductionCostingModel.js";
import Recipe from "../../models/recipes/RecipeModel.js";
import VendorItem from "../../models/vendors/VendorItemModel.js";
import VendorItemPrice from "../../models/vendors/VendorItemPriceModel.js";
import CostModel from "../../models/costing/CostModel.js";

const unitGroups={
 weight:["mg","g","kg","oz","lb"],
 volume:["ml","l","tsp","tbsp","cup","floz"],
 each:["each","unit","piece"]
};

const unitToBaseMap={
 mg:{unit:"g",factor:0.001},
 g:{unit:"g",factor:1},
 kg:{unit:"g",factor:1000},
 oz:{unit:"g",factor:28.349523125},
 lb:{unit:"g",factor:453.59237},

 ml:{unit:"ml",factor:1},
 l:{unit:"ml",factor:1000},
 tsp:{unit:"ml",factor:4.92892},
 tbsp:{unit:"ml",factor:14.7868},
 cup:{unit:"ml",factor:236.588},
 floz:{unit:"ml",factor:29.5735},

 each:{unit:"each",factor:1},
 unit:{unit:"each",factor:1},
 piece:{unit:"each",factor:1}
};

function normalizeUnit(unit=""){
 return String(unit).trim().toLowerCase();
}

function toBase(quantity,unit){
 const normalized=normalizeUnit(unit);
 const rule=unitToBaseMap[normalized];
 if(!rule){
  throw new Error(`Unsupported unit conversion for ${unit}`);
 }
 return{
  quantity:Number(quantity||0)*rule.factor,
  unit:rule.unit
 };
}

function sameBaseUnit(a="",b=""){
 const ua=unitToBaseMap[normalizeUnit(a)];
 const ub=unitToBaseMap[normalizeUnit(b)];
 return !!ua&&!!ub&&ua.unit===ub.unit;
}

async function getBestVendorPrice(ingredientId){
 const vendorItems=await VendorItem.find({
  ingredient:ingredientId,
  isAvailable:true
 }).lean();

 if(!vendorItems.length){
  throw new Error(`No vendor items found for ingredient ${ingredientId}`);
 }

 const vendorItemIds=vendorItems.map(v=>v._id);

 const prices=await VendorItemPrice.find({
  vendorItem:{$in:vendorItemIds},
  isCurrent:true,
  isAvailable:true
 }).sort({unitCost:1,createdAt:-1}).lean();

 if(!prices.length){
  throw new Error(`No current vendor prices found for ingredient ${ingredientId}`);
 }

 for(const price of prices){
  const vendorItem=vendorItems.find(v=>String(v._id)===String(price.vendorItem));
  if(!vendorItem||!vendorItem.packSize||!vendorItem.baseUnit||!vendorItem.packUnit){
   continue;
  }
  if(!sameBaseUnit(vendorItem.packUnit,vendorItem.baseUnit)){
   const packBase=toBase(vendorItem.packSize,vendorItem.packUnit);
   if(packBase.unit!==normalizeUnit(vendorItem.baseUnit)){
    continue;
   }
   return{
    vendorItem,
    price,
    packBaseQuantity:packBase.quantity,
    baseUnit:packBase.unit
   };
  }
  const packBase=toBase(vendorItem.packSize,vendorItem.packUnit);
  return{
   vendorItem,
   price,
   packBaseQuantity:packBase.quantity,
   baseUnit:packBase.unit
  };
 }
 throw new Error(`No usable vendor price conversion found for ingredient ${ingredientId}`);
}

function roundMoney(value){
 return Number(Number(value||0).toFixed(2));
}

function pickPercent(costModel,...keys){
 for(const key of keys){
  if(costModel?.[key]!==undefined&&costModel?.[key]!==null&&!Number.isNaN(Number(costModel[key]))){
   return Number(costModel[key]);
  }
 }
 return 0;
}

function applyCostModel({
 ingredientCostTotal,
 explicitLaborCost,
 explicitOverheadCost,
 batchQty,
 costModel
}){
 let laborCost=Number(explicitLaborCost||0);
 let overheadCost=Number(explicitOverheadCost||0);

 if(costModel){
  const laborPercent=pickPercent(costModel,"laborPercent","laborCostPercent");
  const overheadPercent=pickPercent(costModel,"overheadPercent","overheadCostPercent");

  if(laborCost<=0&&laborPercent>0) laborCost=ingredientCostTotal*(laborPercent/100);
  if(overheadCost<=0&&overheadPercent>0) overheadCost=ingredientCostTotal*(overheadPercent/100);
 }

 const totalCost=ingredientCostTotal+laborCost+overheadCost;
 const costPerUnit=batchQty>0?totalCost/batchQty:0;

 let suggestedMenuPrice=0;
 let markupPercent=0;
 let contributionMargin=0;

 if(costModel){
  const targetFoodCostPercent=pickPercent(costModel,"foodCostPercent","targetFoodCostPercent","cogsPercent");
  const modelMarkupPercent=pickPercent(costModel,"markupPercent");
  const profitPercent=pickPercent(costModel,"profitPercent");

  if(targetFoodCostPercent>0){
   suggestedMenuPrice=costPerUnit/(targetFoodCostPercent/100);
  }else if(modelMarkupPercent>0){
   suggestedMenuPrice=costPerUnit*(1+(modelMarkupPercent/100));
  }else if(profitPercent>0&&profitPercent<100){
   suggestedMenuPrice=costPerUnit/(1-(profitPercent/100));
  }

  if(suggestedMenuPrice>0){
   markupPercent=costPerUnit>0?((suggestedMenuPrice-costPerUnit)/costPerUnit)*100:0;
   contributionMargin=suggestedMenuPrice-costPerUnit;
  }
 }

 return{
  laborCost:roundMoney(laborCost),
  overheadCost:roundMoney(overheadCost),
  totalCost:roundMoney(totalCost),
  costPerUnit:roundMoney(costPerUnit),
  markupPercent:roundMoney(markupPercent),
  suggestedMenuPrice:roundMoney(suggestedMenuPrice),
  contributionMargin:roundMoney(contributionMargin)
 };
}

export async function calculateProductionCosting(productionBatchId,{costModelId=null,laborCost=0,overheadCost=0,notes=""}={}){
 const batch=await ProductionBatch.findById(productionBatchId).lean();
 if(!batch){
  throw new Error("Production batch not found");
 }

 const sharedCostModel=costModelId?await CostModel.findById(costModelId).lean():null;
 const costingItems=[];

 for(const batchItem of batch.items){
  if(!batchItem.recipe){
   continue;
  }

  const recipe=await Recipe.findById(batchItem.recipe).populate("ingredients.ingredient").lean();
  if(!recipe){
   throw new Error(`Recipe not found for ${batchItem.recipe}`);
  }

  const itemCostModelId=batchItem.costModel||costModelId||null;
  const itemCostModel=itemCostModelId
   ?(sharedCostModel&&String(sharedCostModel._id)===String(itemCostModelId)
    ?sharedCostModel
    :await CostModel.findById(itemCostModelId).lean())
   :null;

  const ingredientCosts=[];

  for(const recipeIngredient of recipe.ingredients){
   const ingredientId=recipeIngredient.ingredient?._id||recipeIngredient.ingredient;
   const requiredBase=toBase(recipeIngredient.quantity,recipeIngredient.unit);
   const bestPrice=await getBestVendorPrice(ingredientId);
   const costPerBaseUnit=bestPrice.price.unitCost/bestPrice.packBaseQuantity;
   const totalCost=requiredBase.quantity*costPerBaseUnit;

   ingredientCosts.push({
    ingredient:ingredientId,
    vendorItem:bestPrice.vendorItem._id,
    vendorItemPrice:bestPrice.price._id,

    quantity:recipeIngredient.quantity,
    unit:recipeIngredient.unit,
    baseQuantity:requiredBase.quantity,
    baseUnit:requiredBase.unit,

    packCost:roundMoney(bestPrice.price.unitCost),
    packSize:bestPrice.vendorItem.packSize,
    packUnit:bestPrice.vendorItem.packUnit,
    costPerBaseUnit:roundMoney(costPerBaseUnit),
    totalCost:roundMoney(totalCost)
   });
  }

  const ingredientCostTotal=ingredientCosts.reduce((sum,item)=>sum+Number(item.totalCost||0),0);
  const batchQty=Number(batchItem.producedQty||batchItem.plannedQty||0);

  const pricing=applyCostModel({
   ingredientCostTotal,
   explicitLaborCost:laborCost,
   explicitOverheadCost:overheadCost,
   batchQty,
   costModel:itemCostModel
  });

  costingItems.push({
   menuItem:batchItem.menuItem,
   recipe:batchItem.recipe,
   costModel:itemCostModel?itemCostModel._id:null,
   batchQty,
   batchUnit:batchItem.unit||"each",
   ingredients:ingredientCosts,
   ingredientCostTotal:roundMoney(ingredientCostTotal),
   laborCost:pricing.laborCost,
   overheadCost:pricing.overheadCost,
   totalCost:pricing.totalCost,
   costPerUnit:pricing.costPerUnit,
   markupPercent:pricing.markupPercent,
   suggestedMenuPrice:pricing.suggestedMenuPrice,
   contributionMargin:pricing.contributionMargin
  });
 }

 const latest=await ProductionCosting.findOne({productionBatch:batch._id}).sort({version:-1}).lean();
 const costing=await ProductionCosting.create({
  productionBatch:batch._id,
  items:costingItems,
  calculatedAt:new Date(),
  version:latest?latest.version+1:1,
  notes
 });

 await ProductionBatch.findByIdAndUpdate(batch._id,{costing:costing._id});

 return costing;
}

export default calculateProductionCosting;