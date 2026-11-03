import {isNonIngredientLine,asLabelLine} from "./ingredientRows.js";
export const idOf=value=>String(value?._id||value?.id||value||"");
const numeric=value=>value!==""&&value!==null&&value!==undefined&&Number.isFinite(Number(value))?Number(value):null;
const clean=value=>String(value||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const units=[
 ["mass",.001,"mg milligram milligrams"],["mass",1,"g gram grams"],["mass",1000,"kg kilogram kilograms"],
 ["mass",28.349523125,"oz ounce ounces"],["mass",453.59237,"lb lbs pound pounds"],
 ["volume",1,"ml milliliter milliliters millilitre millilitres"],["volume",1000,"l liter liters litre litres"],
 ["volume",4.92892159375,"tsp teaspoon teaspoons"],["volume",14.78676478125,"tbsp tablespoon tablespoons"],
 ["volume",29.5735295625,["fl oz","fluid ounce","fluid ounces","floz"]],["volume",236.5882365,"cup cups"],
 ["volume",473.176473,"pt pint pints"],["volume",946.352946,"qt quart quarts"],["volume",3785.411784,"gal gallon gallons"],
 ["count",1,"each ea count ct piece pieces unit units"],["count",12,"dozen doz"]
].map(([dimension,factor,aliases])=>({dimension,factor,aliases:Array.isArray(aliases)?aliases:aliases.split(" "),baseUnit:{mass:"g",volume:"ml",count:"each"}[dimension]}));
export const unitDefinition=(value,records=[])=>{
 const record=value&&typeof value==="object"&&(value.name||value.symbol||value.abbreviation)?value:records.find(item=>idOf(item)===idOf(value));
 const names=record?[record.symbol,record.name,record.abbreviation]:[value];
 return units.find(unit=>names.some(name=>unit.aliases.includes(clean(name))))||null;
};
export const measurements=(row,records=[])=>["imperial","metric"].flatMap(system=>{
 const quantity=numeric(row?.[`${system}Quantity`]);
 const unit=row?.[`${system}UnitRecord`]||row?.[`${system}Unit`];
 const definition=unitDefinition(unit,records);
 return quantity!==null&&quantity>=0&&definition?[{quantity,unit,...definition,baseQuantity:quantity*definition.factor}]:[];
});
export const normalizeOffer=(offer,records=[])=>{
 const pack=measurements(offer,records).find(item=>item.baseQuantity>0);
 const packCost=numeric(offer?.packCost);
 if(!pack||packCost===null||packCost<0)return null;
 return{...pack,packCost,normalizedUnitCost:packCost/pack.baseQuantity};
};
export const costLine=(line,offer,records=[])=>{
 if(isNonIngredientLine(line))return{unitCost:0,totalCost:0,error:""};
 const pack=normalizeOffer(offer,records);
 const measurement=pack&&measurements(line,records).find(item=>item.dimension===pack.dimension);
 if(!measurement)return{unitCost:0,totalCost:null,error:"A compatible quantity and vendor pack measurement are required."};
 const totalCost=measurement.baseQuantity*pack.normalizedUnitCost;
 return{unitCost:pack.normalizedUnitCost*measurement.factor,totalCost,baseQuantity:measurement.baseQuantity,dimension:pack.dimension,baseUnit:pack.baseUnit,normalizedUnitCost:pack.normalizedUnitCost,error:""};
};
export const offersFor=(offers,{business,ingredient,vendor},records=[])=>offers.filter(offer=>offer.isActive!==false&&offer.vendor?.isActive!==false&&idOf(offer.business)===idOf(business)&&idOf(offer.ingredient)===idOf(ingredient)&&(!vendor||idOf(offer.vendor)===idOf(vendor))).map(offer=>({...offer,isPreferred:Boolean(offer.isPreferred||offer.vendor?.isPreferred),comparison:normalizeOffer(offer,records)})).sort((a,b)=>(a.comparison?.normalizedUnitCost??Infinity)-(b.comparison?.normalizedUnitCost??Infinity));
export const priceChange=(previous,current)=>{
 const before=numeric(previous),after=numeric(current);
 return{difference:before===null||after===null?null:after-before,percent:before>0&&after!==null?(after-before)/before*100:null};
};
export const clearPrice=line=>({...line,vendorIngredientPrice:"",unitCost:0,totalCost:0,vendorPackCost:0,vendorPackImperialDisplay:"",vendorPackMetricDisplay:"",conversionError:""});
export const applyPrice=(line,offer,business,records=[])=>{
 if(!offer)return clearPrice(line);
 if(offer.isActive===false||idOf(offer.business)!==idOf(business)||idOf(offer.ingredient)!==idOf(line.ingredient))return{...clearPrice(line),conversionError:"The offering does not belong to this business and ingredient."};
 const calculation=costLine(line,offer,records);
 return{...line,vendor:idOf(offer.vendor),vendorIngredientPrice:idOf(offer),unitCost:calculation.unitCost,totalCost:calculation.totalCost,conversionError:calculation.error,vendorPackCost:Number(offer.packCost),vendorPackImperialDisplay:offer.imperialDisplay||"",vendorPackMetricDisplay:offer.metricDisplay||""};
};

