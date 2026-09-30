import {useEffect,useMemo,useRef,useState} from "react";
import {Alert,Button,Form,Spinner,Table} from "react-bootstrap";
import SortedSelect from "../components/SortedSelect.jsx";
import VendorIngredientPriceForm from "./forms/admin/VendorIngredientPriceForm.jsx";
import {ingredientIdentity} from "../utils/ingredientIdentity.js";
import "./RecipeCostings.css";

const idOf=value=>typeof value==="object"?(value?._id||""):value||"";
const labelOf=value=>typeof value==="object"
 ?(value?.name||value?.legalName||value?.ingredientName||value?.displayName||value?.symbol||value?._id||"—")
 :(value||"—");
const rowsOf=data=>Array.isArray(data)?data:(data?.data||data?.businesses||data?.recipes||data?.ingredients||[]);
const number=value=>Number.isFinite(Number(value))?Number(value):0;
const money=value=>number(value).toFixed(2);

const unitDefinitions={
 tsp:{dimension:"volume",factor:4.92892159375,label:"Teaspoon"},
 tbsp:{dimension:"volume",factor:14.78676478125,label:"Tablespoon"},
 floz:{dimension:"volume",factor:29.5735295625,label:"Fluid Ounce"},
 cup:{dimension:"volume",factor:236.5882365,label:"Cup"},
 pint:{dimension:"volume",factor:473.176473,label:"Pint"},
 quart:{dimension:"volume",factor:946.352946,label:"Quart"},
 gallon:{dimension:"volume",factor:3785.411784,label:"Gallon"},
 ml:{dimension:"volume",factor:1,label:"Milliliter"},
 liter:{dimension:"volume",factor:1000,label:"Liter"},
 mg:{dimension:"weight",factor:.001,label:"Milligram"},
 g:{dimension:"weight",factor:1,label:"Gram"},
 kg:{dimension:"weight",factor:1000,label:"Kilogram"},
 oz:{dimension:"weight",factor:28.349523125,label:"Ounce"},
 lb:{dimension:"weight",factor:453.59237,label:"Pound"},
 each:{dimension:"count",factor:1,label:"Each"},
 dozen:{dimension:"count",factor:12,label:"Dozen"}
};

const unitAliases=[
 ["fluid ounces","floz"],["fluid ounce","floz"],["fl ounces","floz"],["fl ounce","floz"],["fl. oz.","floz"],["fl oz.","floz"],["fl. oz","floz"],["fl oz","floz"],["floz","floz"],
 ["tablespoons","tbsp"],["tablespoon","tbsp"],["tbsp.","tbsp"],["tbsp","tbsp"],["tbs.","tbsp"],["tbs","tbsp"],
 ["teaspoons","tsp"],["teaspoon","tsp"],["tsp.","tsp"],["tsp","tsp"],
 ["gallons","gallon"],["gallon","gallon"],["gal.","gallon"],["gal","gallon"],
 ["quarts","quart"],["quart","quart"],["qt.","quart"],["qt","quart"],
 ["pints","pint"],["pint","pint"],["pt.","pint"],["pt","pint"],
 ["cups","cup"],["cup","cup"],["c.","cup"],
 ["milliliters","ml"],["milliliter","ml"],["millilitres","ml"],["millilitre","ml"],["ml.","ml"],["ml","ml"],
 ["liters","liter"],["liter","liter"],["litres","liter"],["litre","liter"],["l.","liter"],
 ["kilograms","kg"],["kilogram","kg"],["kgs","kg"],["kg.","kg"],["kg","kg"],
 ["milligrams","mg"],["milligram","mg"],["mg.","mg"],["mg","mg"],
 ["grams","g"],["gram","g"],["g.","g"],["g","g"],
 ["pounds","lb"],["pound","lb"],["lbs.","lb"],["lbs","lb"],["lb.","lb"],["lb","lb"],
 ["ounces","oz"],["ounce","oz"],["oz.","oz"],["oz","oz"],
 ["dozens","dozen"],["dozen","dozen"],["doz.","dozen"],["doz","dozen"],
 ["pieces","each"],["piece","each"],["counts","each"],["count","each"],["ct.","each"],["ct","each"],["each","each"],["ea.","each"],["ea","each"],["unit","each"],["units","each"]
];

const textOf=value=>{
 if(value===null||value===undefined)return "";
 if(typeof value==="object")return value.name||value.displayName||value.symbol||value.abbreviation||value.shortName||value.code||value.label||"";
 return String(value);
};

const unitKeyOf=value=>{
 const raw=textOf(value).trim().toLowerCase();
 if(!raw)return "";

 const cleaned=` ${raw.replace(/[()]/g," ").replace(/\s+/g," ")} `;

 for(const [alias,key] of unitAliases){
  if(cleaned.includes(` ${alias} `))return key;
 }

 return "";
};

const numericText=value=>{
 const raw=String(value||"").trim();

 const mixed=raw.match(/(-?\d+)\s+(\d+)\/(\d+)/);

 if(mixed){
  const whole=Number(mixed[1]);
  const fraction=Number(mixed[2])/Number(mixed[3]);

  return whole<0?whole-fraction:whole+fraction;
 }

 const fraction=raw.match(/(-?\d+)\/(\d+)/);

 if(fraction)return Number(fraction[1])/Number(fraction[2]);

 const decimal=raw.match(/-?\d+(?:\.\d+)?/);

 return decimal?Number(decimal[0]):0;
};

const measurementOf=value=>{
 const text=textOf(value);
 const unit=unitKeyOf(text);

 if(!unit)return null;

 const quantity=numericText(text)||1;

 return{quantity,unit};
};

const recipeMeasurementsOf=line=>{
 const values=[];

 if(line.imperialQuantity!==""&&line.imperialQuantity!==null&&line.imperialQuantity!==undefined){
  const unit=unitKeyOf(line.imperialUnitRecord||line.imperialDisplay);

  if(unit){
   values.push({
    system:"imperial",
    quantity:number(line.imperialQuantity),
    unit
   });
  }
 }

 if(line.metricQuantity!==""&&line.metricQuantity!==null&&line.metricQuantity!==undefined){
  const unit=unitKeyOf(line.metricUnitRecord||line.metricDisplay);

  if(unit){
   values.push({
    system:"metric",
    quantity:number(line.metricQuantity),
    unit
   });
  }
 }

 return values;
};

const displayedRecipeMeasurementOf=line=>{
 const measurements=recipeMeasurementsOf(line);

 if(line.imperialQuantity!==""&&line.imperialQuantity!==null&&line.imperialQuantity!==undefined){
  const imperial=measurements.find(value=>value.system==="imperial");

  if(imperial)return imperial;
 }

 return measurements[0]||null;
};

const vendorMeasurementsOf=price=>{
 const measurements=[];

 const add=value=>{
  const measurement=measurementOf(value);

  if(!measurement)return;

  const exists=measurements.some(item=>item.unit===measurement.unit&&Math.abs(item.quantity-measurement.quantity)<.000001);

  if(!exists)measurements.push(measurement);
 };

 add(price?.imperialDisplay);
 add(price?.metricDisplay);
 add(price?.packDisplay);
 add(price?.sizeDisplay);
 add(price?.packSizeName);

 return measurements;
};

const explicitVendorUnitKeyOf=price=>{
 const values=[
  price?.unitCostUnitRecord,
  price?.unitCostUnit,
  price?.costUnitRecord,
  price?.costUnit,
  price?.normalizedUnitRecord,
  price?.normalizedUnit,
  price?.pricingUnitRecord,
  price?.pricingUnit,
  price?.baseUnitRecord,
  price?.baseUnit
 ];

 for(const value of values){
  const key=unitKeyOf(value);

  if(key)return key;
 }

 return "";
};

const inferVendorUnitKey=price=>{
 const explicit=explicitVendorUnitKeyOf(price);

 if(explicit)return explicit;

 const nativeUnitCost=number(price?.unitCost);
 const packCost=number(price?.packCost);
 const unitCount=nativeUnitCost>0&&packCost>0?packCost/nativeUnitCost:0;
 const measurements=vendorMeasurementsOf(price);

 if(unitCount>0){
  for(const measurement of measurements){
   const source=unitDefinitions[measurement.unit];

   if(!source)continue;

   const totalBase=measurement.quantity*source.factor;
   const candidates=Object.entries(unitDefinitions).filter(([,definition])=>definition.dimension===source.dimension);

   let best="";
   let bestError=Infinity;

   for(const [key,definition] of candidates){
    const expectedCount=totalBase/definition.factor;
    const error=Math.abs(expectedCount-unitCount)/Math.max(unitCount,1);

    if(error<bestError){
     bestError=error;
     best=key;
    }
   }

   if(best&&bestError<=.02)return best;
  }
 }

 for(const value of [price?.unit,price?.packUnit,price?.purchaseUnit,price?.imperialUnit,price?.metricUnit]){
  const key=unitKeyOf(value);

  if(key)return key;
 }

 return measurements[0]?.unit||"";
};

const compatibleRecipeMeasurement=(line,vendorUnit)=>{
 const vendorDefinition=unitDefinitions[vendorUnit];

 if(!vendorDefinition)return null;

 const measurements=recipeMeasurementsOf(line);

 return measurements.find(measurement=>{
  const definition=unitDefinitions[measurement.unit];

  return definition&&definition.dimension===vendorDefinition.dimension;
 })||null;
};

const packMeasurementForRecipe=(line,price)=>{
 const recipeMeasurements=recipeMeasurementsOf(line);
 const vendorMeasurements=vendorMeasurementsOf(price);

 for(const vendorMeasurement of vendorMeasurements){
  const vendorDefinition=unitDefinitions[vendorMeasurement.unit];

  if(!vendorDefinition)continue;

  const recipeMeasurement=recipeMeasurements.find(measurement=>{
   const recipeDefinition=unitDefinitions[measurement.unit];

   return recipeDefinition&&recipeDefinition.dimension===vendorDefinition.dimension;
  });

  if(recipeMeasurement){
   return{
    packMeasurement:vendorMeasurement,
    recipeMeasurement
   };
  }
 }

 return null;
};

const calculateVendorCostForLine=(line,price)=>{
 if(!line||!price){
  return{
   unitCost:0,
   totalCost:0,
   error:""
  };
 }

 const packCost=number(price.packCost);

 if(packCost<=0){
  return{
   unitCost:0,
   totalCost:0,
   error:"Vendor pack cost is missing."
  };
 }

 const matched=packMeasurementForRecipe(line,price);

 if(!matched){
  const vendorUnit=inferVendorUnitKey(price);

  if(vendorUnit){
   const compatible=compatibleRecipeMeasurement(line,vendorUnit);

   if(compatible){
    const vendorDefinition=unitDefinitions[vendorUnit];
    const recipeDefinition=unitDefinitions[compatible.unit];
    const nativeUnitCost=number(price.unitCost);

    if(nativeUnitCost>0&&vendorDefinition&&recipeDefinition){
     const recipeUnitCost=nativeUnitCost*(recipeDefinition.factor/vendorDefinition.factor);
     const totalCost=compatible.quantity*recipeUnitCost;
     const displayed=displayedRecipeMeasurementOf(line);
     const displayedUnitCost=displayed&&displayed.quantity>0?totalCost/displayed.quantity:recipeUnitCost;

     return{
      unitCost:displayedUnitCost,
      totalCost,
      error:""
     };
    }
   }
  }

  return{
   unitCost:0,
   totalCost:0,
   error:"Vendor pack measurement is not compatible with either the imperial or metric quantity saved on this recipe ingredient."
  };
 }

 const {packMeasurement,recipeMeasurement}=matched;
 const packDefinition=unitDefinitions[packMeasurement.unit];
 const recipeDefinition=unitDefinitions[recipeMeasurement.unit];

 if(!packDefinition||!recipeDefinition){
  return{
   unitCost:0,
   totalCost:0,
   error:"Unable to determine the measurement units for this vendor pack."
  };
 }

 const packBaseQuantity=packMeasurement.quantity*packDefinition.factor;

 if(packBaseQuantity<=0){
  return{
   unitCost:0,
   totalCost:0,
   error:"Vendor pack quantity must be greater than zero."
  };
 }

 const recipeBaseQuantity=recipeMeasurement.quantity*recipeDefinition.factor;
 const costPerBaseUnit=packCost/packBaseQuantity;
 const totalCost=recipeBaseQuantity*costPerBaseUnit;

 const displayed=displayedRecipeMeasurementOf(line);
 const displayedUnitCost=displayed&&displayed.quantity>0?totalCost/displayed.quantity:0;

 return{
  unitCost:displayedUnitCost,
  totalCost,
  error:""
 };
};

const emptyEditor={
 business:"",
 recipe:"",
 yieldQuantity:"",
 yieldDisplay:"",
 foodCostPercent:"30",
 laborCostPercent:"30",
 overheadCostPercent:"30",
 profitPercent:"10",
 sellingPrice:"",
 notes:"",
 ingredients:[]
};

const eachUnitRecord={name:"Each",symbol:"each",type:"count"};
const recipeUnitRecord=(line,system)=>{
 const unit=line?.[`${system}Unit`];
 if(unit)return unit;
 const hasAnyUnit=line?.imperialUnit||line?.metricUnit;
 return !hasAnyUnit?eachUnitRecord:null;
};

const recipeLineToCostLine=line=>({
 ingredient:idOf(line.ingredient),
 ingredientRecord:line.ingredient,
 vendor:"",
 vendorIngredientPrice:"",
 imperialQuantity:line.imperialQuantity??"",
 imperialUnit:idOf(line.imperialUnit),
 imperialUnitRecord:recipeUnitRecord(line,"imperial"),
 imperialDisplay:line.imperialDisplay||(!line.imperialUnit&&!line.metricUnit&&line.imperialQuantity!=null?`${line.imperialQuantity} each`:""),
 metricQuantity:line.metricQuantity??"",
 metricUnit:idOf(line.metricUnit),
 metricUnitRecord:recipeUnitRecord(line,"metric"),
 metricDisplay:line.metricDisplay||"",
 unitCost:"0",
 totalCost:0,
 vendorPackCost:0,
 vendorPackImperialDisplay:"",
 vendorPackMetricDisplay:"",
 conversionError:""
});

const savedLineToCostLine=line=>({
 ...recipeLineToCostLine(line),
 ...line,
 ingredient:idOf(line.ingredient),
 ingredientRecord:line.ingredient,
 vendor:idOf(line.vendor),
 vendorIngredientPrice:idOf(line.vendorIngredientPrice),
 imperialUnit:idOf(line.imperialUnit),
 imperialUnitRecord:recipeUnitRecord(line,"imperial"),
 metricUnit:idOf(line.metricUnit),
 metricUnitRecord:recipeUnitRecord(line,"metric"),
 unitCost:String(line.unitCost??0),
 totalCost:number(line.totalCost)
});

export default function RecipeCostings(){
 const [costings,setCostings]=useState([]);
 const [businesses,setBusinesses]=useState([]);
 const [recipes,setRecipes]=useState([]);
 const [ingredients,setIngredients]=useState([]);
 const [vendorPrices,setVendorPrices]=useState([]);
 const [editor,setEditor]=useState(emptyEditor);
 const [editingId,setEditingId]=useState("");
 const [mode,setMode]=useState("list");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [vendorPriceLine,setVendorPriceLine]=useState(null);
 const initialRecipeHandled=useRef(false);

 const ingredientRecordOf=value=>{
  const ingredientId=idOf(value);

  return ingredients.find(item=>item._id===ingredientId)||(typeof value==="object"?value:null);
 };

 const hydrateCostLine=line=>({
  ...line,
  ingredientRecord:ingredientRecordOf(line.ingredientRecord||line.ingredient)
 });

 const load=async()=>{
  try{
   setLoading(true);
   setError("");

   const responses=await Promise.all([
    fetch("/api/recipe-costings"),
    fetch("/api/businesses"),
    fetch("/api/recipes"),
    fetch("/api/ingredients"),
    fetch("/api/vendor-ingredient-prices?isActive=true")
   ]);

   const data=await Promise.all(responses.map(async response=>{
    const body=await response.json();

    if(!response.ok)throw new Error(body.message||"Failed to load recipe costing data");

    return body;
   }));

   const byName=(left,right)=>String(labelOf(left)||"").localeCompare(String(labelOf(right)||""),undefined,{sensitivity:"base"});
   const loadedIngredients=[...rowsOf(data[3])].sort(byName);

   const ingredientRecordById=value=>{
    const ingredientId=idOf(value);

    return loadedIngredients.find(item=>item._id===ingredientId)||(typeof value==="object"?value:null);
   };

   const hydrateLoadedLine=line=>({
    ...line,
    ingredientRecord:ingredientRecordById(line.ingredientRecord||line.ingredient)
   });

   setCostings([...rowsOf(data[0])].sort((left,right)=>byName(left.recipe,right.recipe)));
   setBusinesses([...rowsOf(data[1])].sort(byName));
   setRecipes([...rowsOf(data[2])].sort(byName));
   setIngredients(loadedIngredients);
   setVendorPrices(rowsOf(data[4]));

   if(!initialRecipeHandled.current){
    initialRecipeHandled.current=true;

    const requestedRecipeId=new URLSearchParams(window.location.search).get("recipe")||"";
    const requestedRecipe=rowsOf(data[2]).find(item=>item._id===requestedRecipeId);

    if(requestedRecipe){
     setEditingId("");

     setEditor({
      ...emptyEditor,
      business:idOf(requestedRecipe.business),
      recipe:requestedRecipe._id,
      yieldQuantity:requestedRecipe.yield?.imperialQuantity??requestedRecipe.yield?.metricQuantity??"",
      yieldDisplay:requestedRecipe.yield?.imperialDisplay||requestedRecipe.yield?.metricDisplay||"",
      sellingPrice:requestedRecipe.suggestedPrice?String(requestedRecipe.suggestedPrice):"",
      ingredients:Array.isArray(requestedRecipe.ingredients)?requestedRecipe.ingredients.map(recipeLineToCostLine).map(hydrateLoadedLine):[]
     });

     setMode("edit");
     window.history.replaceState({},document.title,window.location.pathname);
    }
   }
  }
  catch(err){
   setError(err.message);
  }
  finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  const task=Promise.resolve().then(load);

  return()=>{void task;};
 },[]);

 const ingredientCost=useMemo(
  ()=>editor.ingredients.reduce((sum,line)=>sum+number(line.totalCost),0),
  [editor.ingredients]
 );

 const foodCostPercent=number(editor.foodCostPercent);
 const laborCostPercent=number(editor.laborCostPercent);
 const overheadCostPercent=number(editor.overheadCostPercent);
 const profitPercent=number(editor.profitPercent);
 const modelPercentTotal=foodCostPercent+laborCostPercent+overheadCostPercent+profitPercent;
 const calculatedSellingPrice=foodCostPercent>0?ingredientCost/(foodCostPercent/100):0;
 const enteredSellingPrice=number(editor.sellingPrice);
 const sellingPrice=enteredSellingPrice>0?enteredSellingPrice:calculatedSellingPrice;
 const laborCost=sellingPrice*(laborCostPercent/100);
 const overheadCost=sellingPrice*(overheadCostPercent/100);
 const profit=sellingPrice*(profitPercent/100);
 const totalRecipeCost=ingredientCost+laborCost+overheadCost;
 const yieldQuantity=number(editor.yieldQuantity);
 const costPerUnit=yieldQuantity>0?totalRecipeCost/yieldQuantity:0;
 const sellingPricePerYield=yieldQuantity>0?sellingPrice/yieldQuantity:0;
 const actualFoodCostPercent=sellingPrice>0?(ingredientCost/sellingPrice)*100:0;
 const actualLaborCostPercent=sellingPrice>0?(laborCost/sellingPrice)*100:0;
 const actualOverheadCostPercent=sellingPrice>0?(overheadCost/sellingPrice)*100:0;
 const actualProfitPercent=sellingPrice>0?((sellingPrice-totalRecipeCost)/sellingPrice)*100:0;

 const startNew=()=>{
  setEditingId("");
  setEditor(emptyEditor);
  setError("");
  setMode("edit");
 };

 const editCosting=row=>{
  const savedSellingPrice=number(row.pricing?.suggestedPrice);
  const savedIngredientCost=number(row.totals?.ingredientCost);
  const savedLaborCost=number(row.totals?.laborCost);
  const savedOverheadCost=number(row.totals?.overheadCost);

  setEditingId(row._id);

  setEditor({
   business:idOf(row.business),
   recipe:idOf(row.recipe),
   yieldQuantity:row.yield?.imperialQuantity??row.yield?.metricQuantity??"",
   yieldDisplay:row.yield?.imperialDisplay||row.yield?.metricDisplay||"",
   foodCostPercent:String(row.pricing?.foodCostPercent??row.pricing?.targetFoodCostPercent??(savedSellingPrice>0?(savedIngredientCost/savedSellingPrice)*100:30)),
   laborCostPercent:String(row.pricing?.laborCostPercent??(savedSellingPrice>0?(savedLaborCost/savedSellingPrice)*100:30)),
   overheadCostPercent:String(row.pricing?.overheadCostPercent??(savedSellingPrice>0?(savedOverheadCost/savedSellingPrice)*100:30)),
   profitPercent:String(row.pricing?.profitPercent??10),
   sellingPrice:savedSellingPrice>0?String(savedSellingPrice):"",
   notes:Array.isArray(row.notes)?row.notes.join("\n"):"",
   ingredients:Array.isArray(row.ingredients)?row.ingredients.map(savedLineToCostLine).map(hydrateCostLine):[]
  });

  setError("");
  setMode("edit");
 };

 const chooseRecipe=recipeId=>{
  const recipe=recipes.find(item=>item._id===recipeId);

  setEditor(previous=>({
   ...previous,
   recipe:recipeId,
   business:previous.business||idOf(recipe?.business),
   yieldQuantity:recipe?.yield?.imperialQuantity??recipe?.yield?.metricQuantity??"",
   yieldDisplay:recipe?.yield?.imperialDisplay||recipe?.yield?.metricDisplay||"",
   sellingPrice:recipe?.suggestedPrice?String(recipe.suggestedPrice):previous.sellingPrice,
   ingredients:Array.isArray(recipe?.ingredients)?recipe.ingredients.map(recipeLineToCostLine).map(hydrateCostLine):[]
  }));
 };

 const pricesForLine=line=>{
  const businessPrices=vendorPrices.filter(price=>!editor.business||idOf(price.business)===editor.business);
  const lineIngredient=ingredientRecordOf(line.ingredientRecord||line.ingredient);
  const matchingPrices=businessPrices.filter(price=>idOf(price.ingredient)===line.ingredient||(
   ingredientIdentity(price.ingredient)&&ingredientIdentity(price.ingredient)===ingredientIdentity(lineIngredient)
  ));
  const availablePrices=matchingPrices.length?matchingPrices:businessPrices;

  return availablePrices.sort((left,right)=>{
  const leftCalculation=calculateVendorCostForLine(line,left);
  const rightCalculation=calculateVendorCostForLine(line,right);

  const leftCost=leftCalculation.error?Infinity:leftCalculation.unitCost;
  const rightCost=rightCalculation.error?Infinity:rightCalculation.unitCost;

   return leftCost-rightCost||labelOf(left.vendor).localeCompare(labelOf(right.vendor));
  });
 };

 const updateLine=(index,changes)=>{
  setEditor(previous=>{
   const ingredients=previous.ingredients.map((line,lineIndex)=>{
    if(lineIndex!==index)return line;

    const updated={...line,...changes};
    const displayed=displayedRecipeMeasurementOf(updated);

    if(Object.prototype.hasOwnProperty.call(changes,"unitCost")){
     updated.totalCost=displayed?displayed.quantity*number(updated.unitCost):0;
    }

    return updated;
   });

   return{...previous,ingredients};
  });
 };

 const applyVendorPrice=(index,price)=>{
  const line=editor.ingredients[index];

  if(!line)return;

  if(!price){
   updateLine(index,{
    vendorIngredientPrice:"",
    vendor:"",
    unitCost:"0",
    totalCost:0,
    vendorPackCost:0,
    vendorPackImperialDisplay:"",
    vendorPackMetricDisplay:"",
    conversionError:""
   });

   return;
  }

  const calculation=calculateVendorCostForLine(line,price);

  setEditor(previous=>{
   const ingredients=previous.ingredients.map((currentLine,lineIndex)=>{
    if(lineIndex!==index)return currentLine;

    return{
     ...currentLine,
     vendorIngredientPrice:price._id||"",
     vendor:idOf(price.vendor),
     unitCost:String(calculation.unitCost),
     totalCost:calculation.totalCost,
     vendorPackCost:number(price.packCost),
     vendorPackImperialDisplay:price.imperialDisplay||price.packSizeName||"",
     vendorPackMetricDisplay:price.metricDisplay||"",
     conversionError:calculation.error
    };
   });

   return{...previous,ingredients};
  });
 };

 const chooseVendorPrice=(index,priceId)=>applyVendorPrice(index,vendorPrices.find(item=>item._id===priceId));

 const saveVendorPrice=async payload=>{
  try{
   setSaving(true);
   setError("");

   const isEdit=!!payload._id;
   const response=await fetch(isEdit?`/api/vendor-ingredient-prices/${payload._id}`:"/api/vendor-ingredient-prices",{
    method:isEdit?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await response.json().catch(()=>null);

   if(!response.ok)throw new Error(data?.message||"Failed to save vendor price");

   const priceResponse=await fetch("/api/vendor-ingredient-prices?isActive=true");
   const priceData=await priceResponse.json().catch(()=>null);

   if(!priceResponse.ok)throw new Error(priceData?.message||"Failed to reload vendor prices");

   const updatedPrices=rowsOf(priceData);

   setVendorPrices(updatedPrices);

   const savedId=idOf(data?.data||data);
   const savedPrice=updatedPrices.find(price=>price._id===savedId);

   if(savedPrice&&vendorPriceLine){
    const line=editor.ingredients[vendorPriceLine.index];

    if(line){
     const calculation=calculateVendorCostForLine(line,savedPrice);

     setEditor(previous=>{
      const ingredients=previous.ingredients.map((currentLine,lineIndex)=>{
       if(lineIndex!==vendorPriceLine.index)return currentLine;

       return{
        ...currentLine,
        vendorIngredientPrice:savedPrice._id||"",
        vendor:idOf(savedPrice.vendor),
        unitCost:String(calculation.unitCost),
        totalCost:calculation.totalCost,
        vendorPackCost:number(savedPrice.packCost),
        vendorPackImperialDisplay:savedPrice.imperialDisplay||savedPrice.packSizeName||"",
        vendorPackMetricDisplay:savedPrice.metricDisplay||"",
        conversionError:calculation.error
       };
      });

      return{...previous,ingredients};
     });
    }
   }

   setVendorPriceLine(null);
  }
  catch(err){
   setError(err.message);
   throw err;
  }
  finally{
   setSaving(false);
  }
 };

 const save=async event=>{
  event.preventDefault();

  try{
   setSaving(true);
   setError("");

   if(Math.abs(modelPercentTotal-100)>0.001)throw new Error("Food, labor, overhead, and profit percentages must equal 100%.");

   const conversionErrorLine=editor.ingredients.find(line=>line.conversionError);

   if(conversionErrorLine)throw new Error(`${labelOf(conversionErrorLine.ingredientRecord)}: ${conversionErrorLine.conversionError}`);

   const ingredientsPayload=editor.ingredients.map(line=>({
    ingredient:line.ingredient,
    vendor:line.vendor||null,
    vendorIngredientPrice:line.vendorIngredientPrice||null,
    imperialQuantity:line.imperialQuantity===""?null:number(line.imperialQuantity),
    imperialUnit:line.imperialUnit||null,
    imperialDisplay:line.imperialDisplay||"",
    metricQuantity:line.metricQuantity===""?null:number(line.metricQuantity),
    metricUnit:line.metricUnit||null,
    metricDisplay:line.metricDisplay||"",
    unitCost:number(line.unitCost),
    totalCost:number(line.totalCost),
    vendorPackCost:number(line.vendorPackCost),
    vendorPackImperialDisplay:line.vendorPackImperialDisplay||"",
    vendorPackMetricDisplay:line.vendorPackMetricDisplay||""
   }));

   const recipe=recipes.find(item=>item._id===editor.recipe);

   const payload={
    business:editor.business,
    recipe:editor.recipe,
    yield:{
     ...(recipe?.yield||{}),
     imperialQuantity:yieldQuantity||null,
     imperialDisplay:editor.yieldDisplay||recipe?.yield?.imperialDisplay||""
    },
    ingredients:ingredientsPayload,
    totals:{
     ingredientCost,
     laborCost,
     overheadCost,
     profit,
     totalCost:totalRecipeCost,
     costPerUnit
    },
    pricing:{
     foodCostPercent,
     laborCostPercent,
     overheadCostPercent,
     profitPercent,
     targetFoodCostPercent:foodCostPercent,
     suggestedPrice:sellingPrice,
     sellingPricePerYield,
     actualFoodCostPercent,
     actualLaborCostPercent,
     actualOverheadCostPercent,
     actualProfitPercent
    },
    notes:String(editor.notes||"").split(/\r?\n/).map(value=>value.trim()).filter(Boolean),
    isActive:true
   };

   const response=await fetch(editingId?`/api/recipe-costings/${editingId}`:"/api/recipe-costings",{
    method:editingId?"PUT":"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await response.json();

   if(!response.ok)throw new Error(data.message||"Failed to save recipe costing");

   await load();
   setMode("list");
  }
  catch(err){
   setError(err.message);
  }
  finally{
   setSaving(false);
  }
 };

 const archive=async row=>{
  if(!window.confirm(`Archive the costing for ${labelOf(row.recipe)}?`))return;

  try{
   const response=await fetch(`/api/recipe-costings/${row._id}`,{method:"DELETE"});
   const data=await response.json();

   if(!response.ok)throw new Error(data.message||"Failed to archive recipe costing");

   await load();
  }
  catch(err){
   setError(err.message);
  }
 };

 if(loading)return <main className="recipe-costing-page"><div className="recipe-costing-loading"><Spinner animation="border"/> Loading recipe costing data…</div></main>;

 return(
  <main className="recipe-costing-page">
   <header className="recipe-costing-header">
    <div>
     <h1>Recipe Costing</h1>
     <p>Cost every ingredient against vendor pricing and calculate the finished recipe price.</p>
    </div>
    {mode==="list"
     ?<Button onClick={startNew}>Cost a Recipe</Button>
     :<Button variant="outline-secondary" onClick={()=>setMode("list")} disabled={saving}>Back to Costings</Button>}
   </header>

   {error?<Alert variant="danger" className="recipe-costing-alert">{error}</Alert>:null}

   {mode==="list"?(
    <section className="recipe-costing-panel">
     <div className="recipe-costing-scroll">
      <Table striped hover bordered className="recipe-costing-table">
       <thead><tr><th>Recipe</th><th>Business</th><th>Ingredient Cost</th><th>Labor</th><th>Overhead</th><th>Profit</th><th>Selling Price</th><th>Price / Yield</th><th>Food Cost %</th><th>Actions</th></tr></thead>
       <tbody>
        {costings.length===0?<tr><td colSpan="10" className="empty-cell">No costings yet. Select “Cost a Recipe” to begin.</td></tr>:costings.map(row=>(
         <tr key={row._id}>
          <td>{labelOf(row.recipe)}</td>
          <td>{labelOf(row.business)}</td>
          <td>${money(row.totals?.ingredientCost)}</td>
          <td>${money(row.totals?.laborCost)}</td>
          <td>${money(row.totals?.overheadCost)}</td>
          <td>${money(row.totals?.profit)}</td>
          <td>${money(row.pricing?.suggestedPrice)}</td>
          <td>${money(row.pricing?.sellingPricePerYield)}</td>
          <td>{number(row.pricing?.actualFoodCostPercent).toFixed(1)}%</td>
          <td><div className="recipe-costing-actions"><Button size="sm" onClick={()=>editCosting(row)}>Open</Button><Button size="sm" variant="outline-danger" onClick={()=>archive(row)}>Archive</Button></div></td>
         </tr>
        ))}
       </tbody>
      </Table>
     </div>
    </section>
   ):(
    <Form onSubmit={save} className="recipe-costing-editor">
     <section className="recipe-costing-panel recipe-costing-setup">
      <Form.Group><Form.Label>Business</Form.Label><SortedSelect value={editor.business} onChange={event=>setEditor({...editor,business:event.target.value})} required disabled={saving||!!editingId} options={businesses} getValue={row=>row._id} getLabel={labelOf} placeholder="Select business"/></Form.Group>
      <Form.Group><Form.Label>Recipe</Form.Label><SortedSelect value={editor.recipe} onChange={event=>chooseRecipe(event.target.value)} required disabled={saving||!!editingId} options={recipes} getValue={row=>row._id} getLabel={row=>row.recipeNumber?`${row.recipeNumber} — ${row.name}`:row.name} placeholder="Select recipe"/></Form.Group>
      <Form.Group><Form.Label>Recipe Yield</Form.Label><Form.Control type="number" min="0" step="any" value={editor.yieldQuantity} onChange={event=>setEditor({...editor,yieldQuantity:event.target.value})}/></Form.Group>
      <Form.Group><Form.Label>Yield Display</Form.Label><Form.Control value={editor.yieldDisplay} onChange={event=>setEditor({...editor,yieldDisplay:event.target.value})} placeholder="Example: 12 portions"/></Form.Group>
     </section>

     <section className="recipe-costing-panel">
      <div className="recipe-costing-section-heading"><h2>Ingredient Cost Worksheet</h2><span>{editor.ingredients.length} ingredient{editor.ingredients.length===1?"":"s"}</span></div>
      {!editor.recipe?<Alert variant="info" className="m-3">Select a recipe to load its ingredient quantities.</Alert>:null}
      {editor.recipe&&editor.ingredients.length===0?<Alert variant="warning" className="m-3">This recipe has no ingredient lines in the recipe management database.</Alert>:null}

      {editor.ingredients.length>0?(
       <div className="recipe-costing-scroll">
        <Table bordered hover className="recipe-costing-table ingredient-cost-table">
         <thead><tr><th>Ingredient</th><th>Recipe Qty</th><th>Unit</th><th>Vendor / Pack</th><th>Pack Cost</th><th>Unit Cost</th><th>Line Cost</th></tr></thead>
         <tbody>{editor.ingredients.map((line,index)=>{
          const quantity=line.imperialQuantity!==""?line.imperialQuantity:line.metricQuantity;
          const unit=line.imperialQuantity!==""?line.imperialUnitRecord:line.metricUnitRecord;
          const prices=pricesForLine(line);
          const displayedMeasurement=displayedRecipeMeasurementOf(line);
          const displayedUnitLabel=displayedMeasurement?unitDefinitions[displayedMeasurement.unit]?.label||labelOf(unit):labelOf(unit);

          return(
           <tr key={`${line.ingredient}-${index}`}>
            <td><strong>{labelOf(line.ingredientRecord)}</strong></td>
            <td><Form.Control type="number" min="0" step="any" value={quantity} onChange={event=>updateLine(index,line.imperialQuantity!==""?{imperialQuantity:event.target.value}:{metricQuantity:event.target.value})}/></td>
            <td>{labelOf(unit)}</td>
            <td>
             <SortedSelect
              aria-label={`Vendor price for ${labelOf(line.ingredientRecord)}`}
              value={line.vendorIngredientPrice}
              onChange={event=>chooseVendorPrice(index,event.target.value)}
              options={prices}
              sort={false}
              getValue={price=>price._id}
              getLabel={price=>{
               const calculation=calculateVendorCostForLine(line,price);
               const costLabel=calculation.error?"Cannot convert":`$${money(calculation.unitCost)}/${displayedUnitLabel}`;

               const priceIngredient=ingredientRecordOf(price.ingredient)||price.ingredient;
               const differentIngredient=idOf(price.ingredient)!==line.ingredient&&ingredientIdentity(priceIngredient)!==ingredientIdentity(line.ingredientRecord);
               const ingredientLabel=differentIngredient?` · saved for ${labelOf(priceIngredient)}`:"";
               return `${labelOf(price.vendor)} · ${price.packSizeName||price.imperialDisplay||price.metricDisplay||"pack"}${ingredientLabel} · ${costLabel}${price._id===prices[0]?._id&&!calculation.error?" (Lowest)":""}`;
              }}
              placeholder={prices.length?"Manual cost / select vendor price":"No vendor prices saved"}
             />
             <Button type="button" size="sm" variant="outline-primary" className="mt-2" onClick={()=>setVendorPriceLine({index,ingredient:line.ingredientRecord,row:prices.find(price=>price._id===line.vendorIngredientPrice)||prices[0]||null})}>{prices.length?"Open Vendor Price":"+ Add Vendor Price"}</Button>
             {prices.length===0?<small className="d-block mt-1">Add a price for this ingredient, or enter a manual unit cost.</small>:null}
            </td>
            <td>${money(line.vendorPackCost)}</td>
            <td>
             <Form.Control type="number" min="0" step="0.0001" value={line.unitCost} onChange={event=>updateLine(index,{unitCost:event.target.value,conversionError:""})}/>
             {line.conversionError?<small className="d-block mt-1 text-danger">{line.conversionError}</small>:null}
            </td>
            <td><strong>${money(line.totalCost)}</strong></td>
           </tr>
          );
         })}</tbody>
         <tfoot><tr><td colSpan="6">Ingredient Total</td><td><strong>${money(ingredientCost)}</strong></td></tr></tfoot>
        </Table>
       </div>
      ):null}
     </section>

     <section className="recipe-costing-bottom">
      <div className="recipe-costing-panel cost-inputs">
       <h2>30 / 30 / 30 / 10 Costing Model</h2>
       <div className="cost-input-grid">
        <Form.Group><Form.Label>Food Cost %</Form.Label><Form.Control type="number" min="0" max="100" step="0.01" value={editor.foodCostPercent} onChange={event=>setEditor({...editor,foodCostPercent:event.target.value})}/></Form.Group>
        <Form.Group><Form.Label>Labor Cost %</Form.Label><Form.Control type="number" min="0" max="100" step="0.01" value={editor.laborCostPercent} onChange={event=>setEditor({...editor,laborCostPercent:event.target.value})}/></Form.Group>
        <Form.Group><Form.Label>Overhead Cost %</Form.Label><Form.Control type="number" min="0" max="100" step="0.01" value={editor.overheadCostPercent} onChange={event=>setEditor({...editor,overheadCostPercent:event.target.value})}/></Form.Group>
        <Form.Group><Form.Label>Profit %</Form.Label><Form.Control type="number" min="0" max="100" step="0.01" value={editor.profitPercent} onChange={event=>setEditor({...editor,profitPercent:event.target.value})}/></Form.Group>
        <Form.Group><Form.Label>Actual Selling Price</Form.Label><Form.Control type="number" min="0" step="0.01" value={editor.sellingPrice} onChange={event=>setEditor({...editor,sellingPrice:event.target.value})} placeholder={money(calculatedSellingPrice)}/></Form.Group>
       </div>
       {Math.abs(modelPercentTotal-100)>0.001?<Alert variant="warning" className="mt-3 mb-0">The costing percentages currently total {modelPercentTotal.toFixed(2)}%. They must equal 100%.</Alert>:null}
       <Form.Group className="mt-3"><Form.Label>Notes</Form.Label><Form.Control as="textarea" rows={3} value={editor.notes} onChange={event=>setEditor({...editor,notes:event.target.value})}/></Form.Group>
      </div>

      <aside className="recipe-costing-panel costing-summary">
       <h2>Cost Summary</h2>
       <dl>
        <div><dt>Ingredients ({foodCostPercent.toFixed(1)}%)</dt><dd>${money(ingredientCost)}</dd></div>
        <div><dt>Labor ({laborCostPercent.toFixed(1)}%)</dt><dd>${money(laborCost)}</dd></div>
        <div><dt>Overhead ({overheadCostPercent.toFixed(1)}%)</dt><dd>${money(overheadCost)}</dd></div>
        <div><dt>Profit ({profitPercent.toFixed(1)}%)</dt><dd>${money(profit)}</dd></div>
        <div className="summary-total"><dt>Selling Price</dt><dd>${money(sellingPrice)}</dd></div>
        <div><dt>Recipe Cost Before Profit</dt><dd>${money(totalRecipeCost)}</dd></div>
        <div><dt>Recipe Cost Per Yield</dt><dd>${money(costPerUnit)}</dd></div>
        <div><dt>Selling Price Per Yield</dt><dd>${money(sellingPricePerYield)}</dd></div>
        <div><dt>Actual Food Cost</dt><dd>{actualFoodCostPercent.toFixed(1)}%</dd></div>
        <div><dt>Actual Profit</dt><dd>{actualProfitPercent.toFixed(1)}%</dd></div>
       </dl>
       <Button type="submit" size="lg" disabled={saving||!editor.recipe||!editor.business||Math.abs(modelPercentTotal-100)>0.001}>{saving?"Saving Costing…":editingId?"Update Recipe Costing":"Save Recipe Costing"}</Button>
      </aside>
     </section>
    </Form>
   )}

   {vendorPriceLine?<VendorIngredientPriceForm key={vendorPriceLine.row?._id||`costing-price-${vendorPriceLine.ingredient?._id||vendorPriceLine.index}`} row={vendorPriceLine.row} business={editor.business} ingredient={vendorPriceLine.ingredient} onClose={()=>setVendorPriceLine(null)} onSave={saveVendorPrice} saving={saving}/>:null}
  </main>
 );
}
