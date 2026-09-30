import mongoose from "mongoose";
import Recipe from "../../models/master/ReceipeModel.js";
import RecipeCosting from "../../models/master/RecipeCostingModel.js";
import VendorIngredientPrice from "../../models/master/VendorIngredientPriceModel.js";
import "../../models/master/CategoryModel.js";
import Vendor from "../../models/reference/vendorModel.js";
import Ingredient from "../../models/production/ingredientModel.js";
import Product from "../../models/production/productModel.js";
import ProductionBatch from "../../models/production/productionBatchModel.js";
import InventoryBalance from "../../models/inventory/inventoryBalanceModel.js";
import InventoryLot from "../../models/inventory/inventoryLotModel.js";
import Role from "../../models/users/userRolesModel.js";
import PermissionModule from "../../models/users/permissionModuleModel.js";
import DashboardSnapshot from "../../models/dashboard/dashboardSnapshotModel.js";

const getId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value==="object"){
  if(typeof value._id?.$oid==="string")return value._id.$oid;
  if(typeof value._id==="string")return value._id;
  if(typeof value.$oid==="string")return value.$oid;
 }
 return String(value);
};

const isObjectId=value=>mongoose.Types.ObjectId.isValid(getId(value));

const getCostingTotal=costing=>Number(costing?.totals?.totalCost||costing?.totals?.ingredientCost||0);
const getCostingUnit=costing=>Number(costing?.totals?.costPerUnit||0);

const formatDate=value=>{
 if(!value)return "";
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "";
 return date.toISOString().slice(0,10);
};

const buildCalendarDate=value=>{
 const date=new Date(value||new Date());
 return Number.isNaN(date.getTime())?new Date():date;
};

const buildBudgetRows=costings=>{
 const totals=new Map();

 costings.forEach(costing=>{
  const recipe=costing.recipe;
  const category=String(recipe?.category?.name||"Recipe Costing").trim();
  totals.set(category,(totals.get(category)||0)+getCostingTotal(costing));
 });

 return [...totals.entries()]
  .map(([category,spent])=>{
   const budget=Math.max(spent,1);
   return{
    category,
    spent,
    budget,
    percent:budget?Math.min((spent/budget)*100,100):0,
    isOverBudget:false
   };
  })
  .sort((a,b)=>b.spent-a.spent)
  .slice(0,6);
};

const getDashboardDataService=async({business_id})=>{
 const businessId=getId(business_id);
 const hasBusiness=isObjectId(businessId);
 const businessFilter=hasBusiness?{business:businessId}:{};
 const vendorBusinessFilter=hasBusiness?{business_id:businessId}:{};
 const snapshotBusinessFilter=hasBusiness?{business_id:businessId}:{};

 const [
  recipes,
  costings,
  vendors,
  vendorPrices,
  ingredients,
  products,
  batches,
  inventoryBalances,
  inventoryLots,
  roles,
  modules,
  snapshots
 ]=await Promise.all([
  Recipe.find({...businessFilter,isActive:{$ne:false}})
   .populate("category")
   .sort({updatedAt:-1})
   .limit(100)
   .lean(),
  RecipeCosting.find({...businessFilter,isActive:{$ne:false}})
   .populate({path:"recipe",populate:{path:"category"}})
   .sort({updatedAt:-1})
   .limit(100)
   .lean(),
  Vendor.find({...vendorBusinessFilter})
   .sort({isPreferred:-1,updatedAt:-1})
   .limit(100)
   .lean(),
  VendorIngredientPrice.find({...businessFilter,isActive:{$ne:false}})
   .populate("vendor")
   .sort({effectiveDate:-1,updatedAt:-1})
   .limit(100)
   .lean(),
  Ingredient.find({...vendorBusinessFilter,isActive:{$ne:false}})
   .sort({updatedAt:-1})
   .limit(100)
   .lean(),
  Product.find({...vendorBusinessFilter,isActive:{$ne:false}})
   .populate("recipeRef")
   .sort({updatedAt:-1})
   .limit(100)
   .lean(),
  ProductionBatch.find(vendorBusinessFilter)
   .populate("productRef")
   .sort({productionDate:-1,updatedAt:-1})
   .limit(100)
   .lean(),
  InventoryBalance.find(vendorBusinessFilter)
   .sort({status:1,updatedAt:-1})
   .limit(100)
   .lean(),
  InventoryLot.find(vendorBusinessFilter)
   .sort({expirationDate:1,updatedAt:-1})
   .limit(100)
   .lean(),
  Role.find({...businessFilter,isActive:{$ne:false}})
   .sort({isDefault:-1,name:1})
   .limit(100)
   .lean(),
  PermissionModule.find({...businessFilter,isActive:{$ne:false}})
   .sort({group:1,label:1})
   .limit(100)
   .lean(),
  DashboardSnapshot.find(snapshotBusinessFilter)
   .sort({generatedAt:-1})
   .limit(12)
   .lean()
 ]);

 const pricedRecipeIds=new Set(costings.map(costing=>getId(costing.recipe)).filter(Boolean));
 const unpricedRecipes=recipes.filter(recipe=>!pricedRecipeIds.has(getId(recipe)));
 const preferredVendors=vendors.filter(vendor=>vendor.isPreferred);
 const activeVendors=vendors.filter(vendor=>vendor.isActive!==false);
 const inactiveVendors=vendors.filter(vendor=>vendor.isActive===false);
 const vendorComplianceAlerts=vendors.filter(vendor=>vendor.compliance?.insuranceExpiration);
 const activeProducts=products.filter(product=>product.status!=="retired"&&product.isActive!==false);
 const activeBatches=batches.filter(batch=>!["closed","voided"].includes(batch.status));
 const releasedBatches=batches.filter(batch=>batch.status==="released");
 const lowStockBalances=inventoryBalances.filter(balance=>balance.status==="lowStock"||Number(balance.quantityAvailable||0)<=Number(balance.reorderPoint||0));
 const today=new Date();
 const expirationWindow=new Date(today);
 expirationWindow.setDate(expirationWindow.getDate()+30);
 const expiringLots=inventoryLots.filter(lot=>{
  if(!lot.expirationDate)return false;
  const date=new Date(lot.expirationDate);
  return !Number.isNaN(date.getTime())&&date>=today&&date<=expirationWindow;
 });

 const categoryCosts=costings.map(costing=>({
  id:getId(costing),
  category:costing.recipe?.name||"Recipe Cost",
  type:costing.recipe?.category?.name||"recipe-costing",
  cost:getCostingTotal(costing),
  value:getCostingTotal(costing),
  amount:getCostingTotal(costing),
  date:costing.updatedAt||costing.createdAt||new Date()
 }));

 const recentItems=[
  ...products.slice(0,4).map(product=>({
   id:getId(product),
   name:product.productName,
   category:product.productType||"Product",
   location:product.package?.sizeLabel||"Product catalog"
  })),
  ...batches.slice(0,4).map(batch=>({
   id:getId(batch),
   name:batch.batchNumber,
   category:batch.productRef?.productName||"Production batch",
   location:batch.status||"Batch workflow"
  })),
  ...recipes.slice(0,6).map(recipe=>({
   id:getId(recipe),
   name:recipe.name,
   category:recipe.category?.name||"Recipe",
   location:recipe.yield?.imperialDisplay||recipe.yield?.metricDisplay||"Recipe library"
  })),
  ...vendors.slice(0,4).map(vendor=>({
   id:getId(vendor),
   name:vendor.legalName,
   category:vendor.vendorCategory||"Vendor",
   location:vendor.isPreferred?"Preferred vendor":"Vendor record"
  }))
 ].slice(0,8);

 const calendarEvents=[
  ...recipes.slice(0,12).map(recipe=>({
   id:`recipe-${getId(recipe)}`,
   title:`Recipe updated: ${recipe.name}`,
   start:buildCalendarDate(recipe.updatedAt||recipe.createdAt),
   end:buildCalendarDate(recipe.updatedAt||recipe.createdAt),
   type:"recipe"
  })),
  ...batches.slice(0,12).map(batch=>({
   id:`batch-${getId(batch)}`,
   title:`Batch: ${batch.productRef?.productName||batch.batchNumber}`,
   start:buildCalendarDate(batch.productionDate||batch.plannedStartAt||batch.createdAt),
   end:buildCalendarDate(batch.completedAt||batch.productionDate||batch.plannedStartAt||batch.createdAt),
   type:"productionBatch"
  })),
  ...costings.slice(0,12).map(costing=>({
   id:`costing-${getId(costing)}`,
   title:`Costed: ${costing.recipe?.name||"Recipe"}`,
   start:buildCalendarDate(costing.updatedAt||costing.createdAt),
   end:buildCalendarDate(costing.updatedAt||costing.createdAt),
   type:"costing"
  })),
  ...vendorComplianceAlerts.slice(0,12).map(vendor=>({
   id:`vendor-${getId(vendor)}`,
   title:`Vendor review: ${vendor.legalName}`,
   start:buildCalendarDate(vendor.compliance?.insuranceExpiration),
   end:buildCalendarDate(vendor.compliance?.insuranceExpiration),
   type:"vendor"
  }))
 ];

 return{
  business_id:businessId||null,
  generatedAt:new Date(),
  stats:[
   {
    label:"Products",
    value:activeProducts.length,
    details:[
     {label:"Recipes",value:recipes.length},
     {label:"Active Products",value:activeProducts.length},
     {label:"Ingredients",value:ingredients.length}
    ]
   },
   {
    label:"Batches",
    value:batches.length,
    details:[
     {label:"Active",value:activeBatches.length},
     {label:"Released",value:releasedBatches.length},
     {label:"QA Hold",value:batches.filter(batch=>batch.status==="qaHold").length}
    ]
   },
   {
    label:"Inventory",
    value:inventoryBalances.length,
    details:[
     {label:"Low Stock",value:lowStockBalances.length},
     {label:"Lots",value:inventoryLots.length},
     {label:"Expiring",value:expiringLots.length}
    ]
   },
   {
    label:"Costing",
    value:recipes.length,
    details:[
     {label:"Costed",value:pricedRecipeIds.size},
     {label:"Needs Costing",value:unpricedRecipes.length},
     {label:"Cost Records",value:costings.length}
    ]
   },
   {
    label:"Vendors",
    value:vendors.length,
    details:[
     {label:"Active",value:activeVendors.length},
     {label:"Preferred",value:preferredVendors.length},
     {label:"Reviews Due",value:vendorComplianceAlerts.length}
    ]
   },
   {
    label:"Pricing",
    value:vendorPrices.length+costings.length,
    details:[
     {label:"Vendor Prices",value:vendorPrices.length},
     {label:"Recipe Costs",value:costings.length},
     {label:"Inactive Vendors",value:inactiveVendors.length}
    ]
   },
   {
    label:"App Setup",
    value:modules.length+roles.length,
    details:[
     {label:"Modules",value:modules.length},
     {label:"Roles",value:roles.length},
     {label:"Snapshots",value:snapshots.length}
    ]
   }
  ],
  calendarEvents,
  lowStockItems:unpricedRecipes.slice(0,8).map(recipe=>({
   id:getId(recipe),
   name:recipe.name,
   quantity:"Needs",
   unit:"costing",
   location:recipe.category?.name||"Recipe setup"
  })).concat(lowStockBalances.slice(0,8).map(balance=>({
   id:getId(balance),
   name:balance.itemName,
   quantity:Number(balance.quantityAvailable||balance.quantityOnHand||0),
   unit:balance.unit||"",
   location:"Inventory below reorder point"
  }))).slice(0,8),
  expiringItems:expiringLots.slice(0,8).map(lot=>({
   id:getId(lot),
   name:lot.itemName,
   expirationDate:formatDate(lot.expirationDate),
   location:lot.lotNumber||"Inventory lot"
  })).concat(vendorComplianceAlerts.slice(0,8).map(vendor=>({
   id:getId(vendor),
   name:vendor.legalName,
   expirationDate:formatDate(vendor.compliance?.insuranceExpiration)||"Review date needed",
   location:"Vendor compliance"
  }))).slice(0,8),
  recentItems,
  missingItems:[
   ...inactiveVendors.slice(0,4).map(vendor=>({
    id:getId(vendor),
    name:vendor.legalName,
    category:"Inactive vendor",
    location:"Vendor follow-up"
   }))
  ],
  categoryCosts,
  budgetInsights:{
   yearlyByCategory:buildBudgetRows(costings),
   monthlyByCategory:buildBudgetRows(costings.filter(costing=>{
    const date=new Date(costing.updatedAt||costing.createdAt||new Date());
    const today=new Date();
    return date.getFullYear()===today.getFullYear()&&date.getMonth()===today.getMonth();
   })),
   overBudget:[]
  },
  operations:{
   recipes:recipes.length,
   costedRecipes:pricedRecipeIds.size,
   unpricedRecipes:unpricedRecipes.length,
   activeVendors:activeVendors.length,
   preferredVendors:preferredVendors.length,
   vendorPrices:vendorPrices.length,
   roles:roles.length,
   permissionModules:modules.length,
   snapshots:snapshots.length,
   products:products.length,
   batches:batches.length,
   ingredients:ingredients.length,
   inventoryLots:inventoryLots.length,
   lowStock:lowStockBalances.length
  }
 };
};

export default getDashboardDataService;
