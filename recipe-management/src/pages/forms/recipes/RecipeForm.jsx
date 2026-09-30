import Alert from "../../../components/AppAlert.jsx";
import {useEffect,useRef,useState} from "react";
import {Button,Form,Spinner,Tab,Tabs} from "react-bootstrap";
import RecipeIngredientsModule from "./modules/RecipeIngredientsModule.jsx";
import RecipeYieldModule from "./modules/RecipeYieldModule.jsx";
import RecipeProfileModule from "./modules/RecipeProfileModule.jsx";
import RecipeInstructionsModule from "./modules/RecipeInstructionsModule.jsx";
import RecipeFinishModule from "./modules/RecipeFinishModule.jsx";
import RecipeNutritionModule from "./modules/RecipeNutritionModule.jsx";
import RecipeSafetyModule from "./modules/RecipeSafetyModule.jsx";
import RecipeRelatedModule from "./modules/RecipeRelatedModule.jsx";
import RecipeGeneralModule from "./modules/RecipeGeneralModule.jsx";
import RecipeParserModule from "./modules/RecipeParserModule.jsx";
import {convertMeasurement} from "../../../utils/measurementConversion.js";

const id=value=>typeof value==="object"?String(value?._id||value?.id||""):String(value||"");
const ids=values=>(Array.isArray(values)?values:[]).map(id).filter(Boolean);
const lines=value=>Array.isArray(value)?value.join("\n"):"";
const editableLines=value=>Array.isArray(value)?value.join("\n"):String(value||"");
const editableListLines=value=>(Array.isArray(value)?value:[value])
 .flatMap(item=>String(item||"").split(/\r?\n+|(?<=[.!?])\s+(?=[A-Z0-9])/))
 .map(item=>item.trim())
 .filter(Boolean)
 .join("\n");
const splitLines=value=>String(value||"").split(/\r?\n/).map(item=>item.trim()).filter(Boolean);
const numberOrNull=value=>value===""||value===null||value===undefined?null:Number(value);
const imageUrl=(filename,version="")=>{
 const value=String(filename||"").trim();
 if(!value)return "";
 const url=value.startsWith("/")||/^https?:\/\//i.test(value)?value:`/recipe_images/${encodeURIComponent(value)}`;
 return version?`${url}${url.includes("?")?"&":"?"}v=${version}`:url;
};

const emptyQuantity=()=>({imperialQuantity:"",imperialUnit:"",metricQuantity:"",metricUnit:""});
const emptyIngredient=()=>({ingredient:"",sourceName:"",vendor:"",vendorIngredientPrice:"",imperialQuantity:"",imperialUnit:"",metricQuantity:"",metricUnit:"",preparation:"",time:"",note:""});
const emptyInstruction=index=>({stepNumber:index+1,instruction:"",ccpRefs:""});
const emptyHaccp=()=>({code:"",description:""});
const emptyCcp=()=>({code:"",criticalControlPoint:"",hazard:"",criticalLimit:"",monitoring:"",correctiveAction:"",verification:"",records:""});

const nutritionFields=[
 ["calories","Calories"],["totalFat","Total Fat"],["saturatedFat","Saturated Fat"],["transFat","Trans Fat"],
 ["polyunsaturatedFat","Polyunsaturated Fat"],["monounsaturatedFat","Monounsaturated Fat"],["cholesterol","Cholesterol"],
 ["sodium","Sodium"],["potassium","Potassium"],["totalCarbohydrate","Total Carbohydrate"],["dietaryFiber","Dietary Fiber"],
 ["sugars","Sugars"],["protein","Protein"],["vitaminA","Vitamin A"],["vitaminB6","Vitamin B6"],["vitaminB12","Vitamin B12"],
 ["vitaminC","Vitamin C"],["vitaminD","Vitamin D"],["vitaminE","Vitamin E"],["calcium","Calcium"],["magnesium","Magnesium"],["iron","Iron"]
];

const buildForm=source=>({
 business:id(source.business),name:source.name||"",recipeNumber:source.recipeNumber||"",recipeSequence:source.recipeSequence||null,image:source.image||"",cuisines:ids(source.cuisines),courses:ids(source.courses),mealType:id(source.mealType),categories:ids(source.categories),primaryCuisine:id(source.primaryCuisine)||ids(source.cuisines)[0]||"",primaryCourse:id(source.primaryCourse)||ids(source.courses)[0]||"",primaryCategory:id(source.primaryCategory)||ids(source.categories)[0]||"",sourceCuisine:source.sourceCuisine||source.cuisine||source.referenceNames?.cuisine||"",sourceCourse:source.sourceCourse||source.course||source.referenceNames?.course||"",sourceCategory:source.sourceCategory||source.category||source.referenceNames?.category||"",sourceMealType:source.sourceMealType||source.mealTypeName||"",
 dietaryConsiderations:ids(source.dietaryConsiderations),yield:{...emptyQuantity(),...(source.yield||{}),imperialUnit:id(source.yield?.imperialUnit),metricUnit:id(source.yield?.metricUnit)},
 servingSize:{...emptyQuantity(),...(source.servingSize||{}),imperialUnit:id(source.servingSize?.imperialUnit),metricUnit:id(source.servingSize?.metricUnit)},servingSizeDescription:source.servingSizeDescription||"",servings:source.servings??"",
 times:{prepTime:"",cookTime:"",chillTime:"",restTime:"",...(source.times||{})},flavorProfile:{taste:editableLines(source.flavorProfile?.taste),aroma:editableLines(source.flavorProfile?.aroma),mouthfeel:editableLines(source.flavorProfile?.mouthfeel)},
 fermentationTemperatureAdjustment:source.fermentationTemperatureAdjustment||"",generalDescription:source.generalDescription||"",suggestedPrice:source.suggestedPrice??"",
 menuDescription:source.menuDescription||"",origin:source.origin||"",history:source.history||"",culturalSignificance:source.culturalSignificance||"",
 techniques:lines(source.techniques),techniqueRefs:ids(source.techniqueRefs),unmatchedTechniques:source.unmatchedTechniques||[],equipment:ids(source.equipment),equipmentNames:source.equipmentNames||[],unmatchedEquipment:source.unmatchedEquipment||[],unmatchedDietaries:source.unmatchedDietaries||[],
 haccp:(source.haccp||[]).map(item=>({...emptyHaccp(),...item})),ccp:(source.ccp||[]).map(item=>({...emptyCcp(),...item})),
 ingredients:(source.ingredients||[]).map(item=>({...emptyIngredient(),...item,ingredient:id(item.ingredient),vendor:id(item.vendor),vendorIngredientPrice:id(item.vendorIngredientPrice),imperialUnit:id(item.imperialUnit),metricUnit:id(item.metricUnit)})),
 instructions:(source.instructions||[]).map((item,index)=>({...item,stepNumber:item.stepNumber||index+1,ccpRefs:Array.isArray(item.ccpRefs)?item.ccpRefs.join(", "):item.ccpRefs||""})),
 plating:editableListLines(source.plating),notes:editableListLines(source.notes),storage:editableListLines(source.storage),nutrition:Object.fromEntries(nutritionFields.map(([key])=>[key,source.nutrition?.[key]||""])),
 allergens:ids(source.allergens),isActive:source.isActive!==false
});

const SelectOptions=({items=[],placeholder})=><><option value="">{placeholder}</option>{items.map(item=><option key={item._id} value={item._id}>{item.legalName||item.name}{item.symbol?` (${item.symbol})`:""}</option>)}</>;
const objectId=value=>typeof value==="object"?String(value?._id||value?.id||""):String(value||"");
const normalizeName=value=>String(value||"").trim().toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const lookupId=(items,value)=>items.find(item=>normalizeName(item.name||item.legalName)===normalizeName(value))?._id||"";
const lookupUnitId=(items,name,display)=>items.find(item=>{
 const expected=normalizeName(name);
 const itemName=normalizeName(item.name);
 const symbol=normalizeName(item.symbol);
 const measurement=normalizeName(display);
 return expected&&itemName===expected||symbol&&measurement.split(" ").includes(symbol)||itemName&&measurement.includes(itemName);
})?._id||"";
const countUnitId=items=>items.find(item=>normalizeName(item.type)==="count")?._id||"";
const countFromDescription=value=>{
 const match=String(value||"").trim().match(/^(\d+(?:\.\d+)?)\s+(.+)/);
 return match?{quantity:Number(match[1]),label:match[2].trim()}:null;
};

export default function RecipeForm({initialData={},lookups={},onSubmit,loading=false,submitLabel,onCreateLookup=null,onBulkImported=null}){
 const [data,setData]=useState(()=>buildForm(initialData));
 const baseline=useRef(buildForm(initialData));
 const [activeTab,setActiveTab]=useState("general");
 const [formError,setFormError]=useState("");
 const [uploadingImage,setUploadingImage]=useState(false);
 const [imageInputKey,setImageInputKey]=useState(0);
 const [imageVersion,setImageVersion]=useState(()=>Date.now());
 const [creatingLookup,setCreatingLookup]=useState("");
 const [submitting,setSubmitting]=useState(false);
 const [reservingNumber,setReservingNumber]=useState(false);
 const [newLookups,setNewLookups]=useState({cuisines:"",courses:"",categories:"",mealTypes:"",dietaries:"",techniques:"",equipment:"",allergenName:"",allergenEmoji:""});
 const reservedSignature=useRef("");

 useEffect(()=>{const next=buildForm(initialData);const techniqueNames=splitLines(next.techniques);const matchedTechniques=techniqueNames.map(value=>lookupId(lookups.techniques||[],value)).filter(Boolean);next.techniqueRefs=[...new Set([...next.techniqueRefs,...matchedTechniques])];next.unmatchedTechniques=[...new Set([...next.unmatchedTechniques,...techniqueNames.filter(value=>!lookupId(lookups.techniques||[],value))])];baseline.current=structuredClone(next);setData(next);reservedSignature.current=next.recipeNumber?[next.business,next.primaryCourse,next.primaryCuisine,next.primaryCategory].join(":"):"";setActiveTab("general");setFormError("");setImageInputKey(key=>key+1);setImageVersion(Date.now());},[initialData]);

 useEffect(()=>{
  const signature=[data.business,data.primaryCourse,data.primaryCuisine,data.primaryCategory].join(":");
  if(!data.business||!data.primaryCourse||!data.primaryCuisine||!data.primaryCategory||reservedSignature.current===signature)return;
  const controller=new AbortController();
  const timer=setTimeout(async()=>{
   try{
    setReservingNumber(true);setFormError("");
    const response=await fetch("/api/recipes/reserve-number",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({business:data.business,primaryCourse:data.primaryCourse,primaryCuisine:data.primaryCategory}),signal:controller.signal});
    const payload=await response.json().catch(()=>null);if(!response.ok)throw new Error(payload?.message||"Failed to reserve recipe number.");
    reservedSignature.current=signature;setData(prev=>({...prev,recipeNumber:payload.recipeNumber,recipeSequence:payload.recipeSequence}));
   }catch(error){if(error.name!=="AbortError")setFormError(error.message||"Failed to reserve recipe number.");}finally{if(!controller.signal.aborted)setReservingNumber(false);}
  },350);
  return()=>{clearTimeout(timer);controller.abort();};
 },[data.business,data.primaryCourse,data.primaryCuisine,data.primaryCategory,initialData?._id]);

 const change=e=>{const {name,value,type,checked}=e.target;setData(prev=>({...prev,[name]:type==="checkbox"?checked:value}));};
 const nestedChange=(section,name,value)=>setData(prev=>({...prev,[section]:{...prev[section],[name]:value}}));
 const measurementChange=(section,name,value)=>setData(prev=>{
  if(name.endsWith("Quantity")&&value!==""&&!/^\d*(?:\.\d*)?$/.test(value))return prev;
  const nextSection={...prev[section],[name]:value};
  const imperialChanged=name.startsWith("imperial");
  const quantityField=imperialChanged?"imperialQuantity":"metricQuantity";
  const unitField=imperialChanged?"imperialUnit":"metricUnit";
  const targetQuantityField=imperialChanged?"metricQuantity":"imperialQuantity";
  const targetUnitField=imperialChanged?"metricUnit":"imperialUnit";
  const sourceUnits=imperialChanged?lookups.imperialUnits||[]:lookups.metricUnits||[];
  const targetUnits=imperialChanged?lookups.metricUnits||[]:lookups.imperialUnits||[];
  const converted=convertMeasurement(nextSection[quantityField],nextSection[unitField],sourceUnits,targetUnits);
  if(converted){nextSection[targetQuantityField]=converted.quantity;nextSection[targetUnitField]=converted.unit;}
  const next={...prev,[section]:nextSection};
  if(section==="servingSize"&&Number(prev.servings)>0)next.yield={
   imperialQuantity:prev.yield.imperialQuantity===""&&nextSection.imperialQuantity!==""?Number(nextSection.imperialQuantity)*Number(prev.servings):prev.yield.imperialQuantity,
   imperialUnit:prev.yield.imperialUnit||nextSection.imperialUnit,
   metricQuantity:prev.yield.metricQuantity===""&&nextSection.metricQuantity!==""?Number(nextSection.metricQuantity)*Number(prev.servings):prev.yield.metricQuantity,
   metricUnit:prev.yield.metricUnit||nextSection.metricUnit
  };
  return next;
 });
 const measurementQuantityChange=(section,name,value)=>setData(prev=>{
  if(value!==""&&!/^\d*(?:\.\d*)?$/.test(value))return prev;
  return{...prev,[section]:{...prev[section],[name]:value}};
 });
 const servingsChange=value=>setData(prev=>{
  if(value!==""&&!/^\d*(?:\.\d*)?$/.test(value))return prev;
  const count=Number(value);
  return{...prev,servings:value,yield:value!==""&&Number.isFinite(count)&&count>0?{
   imperialQuantity:prev.yield.imperialQuantity===""&&prev.servingSize.imperialQuantity!==""?Number(prev.servingSize.imperialQuantity)*count:prev.yield.imperialQuantity,
   imperialUnit:prev.yield.imperialUnit||prev.servingSize.imperialUnit,
   metricQuantity:prev.yield.metricQuantity===""&&prev.servingSize.metricQuantity!==""?Number(prev.servingSize.metricQuantity)*count:prev.yield.metricQuantity,
   metricUnit:prev.yield.metricUnit||prev.servingSize.metricUnit
  }:prev.yield};
 });
 const arrayChange=(section,index,name,value)=>setData(prev=>({...prev,[section]:prev[section].map((item,i)=>i===index?{...item,[name]:value}:item)}));
 const ingredientChange=(section,index,name,value)=>setData(prev=>({...prev,[section]:prev[section].map((item,i)=>{
  if(i!==index)return item;
  const nextItem={...item,[name]:value};
  if(!name.startsWith("imperial")&&!name.startsWith("metric"))return nextItem;
  const imperialChanged=name.startsWith("imperial");
  const quantityField=imperialChanged?"imperialQuantity":"metricQuantity";
  const unitField=imperialChanged?"imperialUnit":"metricUnit";
  const targetQuantityField=imperialChanged?"metricQuantity":"imperialQuantity";
  const targetUnitField=imperialChanged?"metricUnit":"imperialUnit";
  const sourceUnits=imperialChanged?lookups.imperialUnits||[]:lookups.metricUnits||[];
  const targetUnits=imperialChanged?lookups.metricUnits||[]:lookups.imperialUnits||[];
  const converted=convertMeasurement(nextItem[quantityField],nextItem[unitField],sourceUnits,targetUnits);
  if(converted){nextItem[targetQuantityField]=converted.quantity;nextItem[targetUnitField]=converted.unit;}
  return nextItem;
 })}));
 const chooseVendor=(index,vendor)=>setData(prev=>({...prev,ingredients:prev.ingredients.map((item,i)=>i===index?{...item,vendor,vendorIngredientPrice:"",unitCost:0,totalCost:0,vendorPackCost:0,vendorPackImperialDisplay:"",vendorPackMetricDisplay:""}:item)}));
 const chooseIngredient=(index,ingredient)=>setData(prev=>({...prev,ingredients:prev.ingredients.map((item,i)=>i===index?{...item,ingredient,vendorIngredientPrice:"",unitCost:0,totalCost:0,vendorPackCost:0,vendorPackImperialDisplay:"",vendorPackMetricDisplay:""}:item)}));
 const chooseVendorPrice=(index,priceId)=>setData(prev=>({...prev,ingredients:prev.ingredients.map((item,i)=>{
  if(i!==index)return item;const price=(lookups.vendorIngredientPrices||[]).find(option=>option._id===priceId);if(!price)return{...item,vendorIngredientPrice:""};
  const quantity=Number(item.metricQuantity!==""&&item.metricQuantity!==null&&item.metricQuantity!==undefined?item.metricQuantity:item.imperialQuantity||0);const unitCost=Number(price.unitCost||0);
  return{...item,vendor:objectId(price.vendor),vendorIngredientPrice:price._id,unitCost,totalCost:quantity*unitCost,vendorPackCost:Number(price.packCost||0),vendorPackImperialDisplay:price.imperialDisplay||"",vendorPackMetricDisplay:price.metricDisplay||""};
 })}));
 const addRow=(section,row)=>setData(prev=>({...prev,[section]:[...prev[section],row]}));
 const removeRow=(section,index)=>setData(prev=>({...prev,[section]:prev[section].filter((_,i)=>i!==index)}));
 const toggleDietary=value=>setData(prev=>({...prev,dietaryConsiderations:prev.dietaryConsiderations.includes(value)?prev.dietaryConsiderations.filter(item=>item!==value):[...prev.dietaryConsiderations,value]}));
 const toggleLookup=(field,value)=>setData(prev=>{const next=prev[field].includes(value)?prev[field].filter(item=>item!==value):[...prev[field],value];const primaryField={cuisines:"primaryCuisine",courses:"primaryCourse",categories:"primaryCategory"}[field];return{...prev,[field]:next,...(primaryField?{[primaryField]:next.includes(prev[primaryField])?prev[primaryField]:next[0]||""}:{})};});
 const createLookup=async(type,payload,apply)=>{
  const name=typeof payload==="string"?payload:payload?.name;
  if(!onCreateLookup||!name?.trim())return;
  try{setCreatingLookup(`${type}:${name}`);setFormError("");const record=await onCreateLookup(type,payload);apply(record._id);return record;}
  catch(err){setFormError(err.message||`Failed to create ${name}.`);}finally{setCreatingLookup("");}
 };
 const addLookup=async(type,field,inputKey)=>{
  const name=newLookups[inputKey].trim();
  const payload=type==="allergens"?{name,emoji:newLookups.allergenEmoji.trim()}:{name};
  const record=await createLookup(type,payload,value=>setData(prev=>{const next=Array.isArray(prev[field])?[...new Set([...prev[field],value])]:value;const primaryField={cuisines:"primaryCuisine",courses:"primaryCourse",categories:"primaryCategory"}[field];return{...prev,[field]:next,...(primaryField&&!prev[primaryField]?{[primaryField]:value}:{})};}));
  if(record)setNewLookups(prev=>({...prev,[inputKey]:"",...(type==="allergens"?{allergenEmoji:""}:{})}));
 };

 const uploadImage=async e=>{
  const file=e.target.files?.[0];
  if(!file)return;
  try{
   setUploadingImage(true);setFormError("");
   const body=new FormData();
   body.append("file",file);
   const res=await fetch("/api/upload/recipe_images",{method:"POST",body});
   const payload=await res.json().catch(()=>null);
   if(!res.ok)throw new Error(payload?.message||"Failed to upload recipe image.");
   setData(prev=>({...prev,image:payload?.filename||""}));
   setImageVersion(Date.now());
   setImageInputKey(key=>key+1);
  }catch(err){setFormError(err.message||"Failed to upload recipe image.");}finally{setUploadingImage(false);}
 };

 const submit=async e=>{
  e.preventDefault();
  const editing=Boolean(initialData._id);
  const changed=Object.keys(data).filter(key=>JSON.stringify(data[key])!==JSON.stringify(baseline.current[key]));
  if(editing&&!changed.length){await onSubmit({});return;}
  const generalChanged=!editing||['name','business','cuisines','courses','categories','primaryCuisine','primaryCourse','primaryCategory','recipeNumber','recipeSequence'].some(key=>changed.includes(key));
  const ingredientsChanged=!editing||changed.includes('ingredients');
  const missingGeneral=!data.name.trim()||!data.business||!data.cuisines.length||!data.courses.length||!data.categories.length||!data.primaryCuisine||!data.primaryCourse||!data.primaryCategory||!data.recipeNumber||!data.recipeSequence;
  if(generalChanged&&missingGeneral){setActiveTab("general");setFormError(reservingNumber?"Wait for the recipe number to finish generating.":"Recipe name, business, primary classifications, and a generated recipe number are required.");return;}
  const unnamedIngredients=data.ingredients.filter(item=>!item.ingredient&&!String(item.sourceName||"").trim());
  if(ingredientsChanged&&unnamedIngredients.length){setActiveTab("ingredients");setFormError(`${unnamedIngredients.length} ingredient row${unnamedIngredients.length===1?" needs":"s need"} an ingredient name or selection.`);return;}
  setFormError("");
  setSubmitting(true);
  try{
   let resolvedIngredients=data.ingredients;
   const missingIngredients=data.ingredients.filter(item=>!item.ingredient&&String(item.sourceName||"").trim());
   if(ingredientsChanged&&missingIngredients.length){
    if(!onCreateLookup){setActiveTab("ingredients");setFormError("Parsed ingredient names could not be created.");return;}
    const createdByName=new Map();
    for(const item of missingIngredients){
     const name=String(item.sourceName).trim();
     const key=normalizeName(name);
     if(!createdByName.has(key))createdByName.set(key,await onCreateLookup("ingredients",{name,unit:item.metricUnitName||item.imperialUnitName||"g"}));
    }
    resolvedIngredients=data.ingredients.map(item=>item.ingredient?item:{...item,ingredient:createdByName.get(normalizeName(item.sourceName))?._id||""});
    setData(current=>({...current,ingredients:resolvedIngredients}));
   }
   const payload={
   ...data,business:data.business,cuisines:data.cuisines,courses:data.courses,mealType:data.mealType||null,categories:data.categories,primaryCuisine:data.primaryCuisine,primaryCourse:data.primaryCourse,primaryCategory:data.primaryCategory,
   suggestedPrice:Number(data.suggestedPrice||0),dietaryConsiderations:data.dietaryConsiderations,equipment:data.equipment,equipmentNames:data.equipmentNames,servings:numberOrNull(data.servings),servingSizeDescription:data.servingSizeDescription.trim(),flavorProfile:{taste:splitLines(data.flavorProfile.taste),aroma:splitLines(data.flavorProfile.aroma),mouthfeel:splitLines(data.flavorProfile.mouthfeel)},
   yield:{...data.yield,imperialQuantity:numberOrNull(data.yield.imperialQuantity),imperialUnit:data.yield.imperialUnit||null,metricQuantity:numberOrNull(data.yield.metricQuantity),metricUnit:data.yield.metricUnit||null},
   servingSize:{...data.servingSize,imperialQuantity:numberOrNull(data.servingSize.imperialQuantity),imperialUnit:data.servingSize.imperialUnit||null,metricQuantity:numberOrNull(data.servingSize.metricQuantity),metricUnit:data.servingSize.metricUnit||null},
   techniques:splitLines(data.techniques),techniqueRefs:data.techniqueRefs,allergens:data.allergens,plating:splitLines(data.plating),notes:splitLines(data.notes),storage:splitLines(data.storage),
   ingredients:resolvedIngredients.filter(item=>item.ingredient).map(item=>({...item,imperialQuantity:numberOrNull(item.imperialQuantity),imperialUnit:item.imperialUnit||null,metricQuantity:numberOrNull(item.metricQuantity),metricUnit:item.metricUnit||null})),
   instructions:data.instructions.filter(item=>item.instruction.trim()).map((item,index)=>({...item,stepNumber:Number(item.stepNumber||index+1),ccpRefs:String(item.ccpRefs||"").split(",").map(value=>value.trim()).filter(Boolean)})),
   haccp:data.haccp.filter(item=>String(item.code||"").trim()),ccp:data.ccp.filter(item=>String(item.code||"").trim())
  };
   await onSubmit(editing?Object.fromEntries(Object.entries(payload).filter(([key])=>changed.includes(key))):payload);
  }catch(error){setFormError(error.message||"Failed to save recipe.");}
  finally{setSubmitting(false);}
 };

 const applyParsedRecipe=source=>{
  const cuisine=lookupId(lookups.cuisines||[],source.cuisine||source.referenceNames?.cuisine);
  const course=lookupId(lookups.courses||[],source.course||source.referenceNames?.course);
  const category=lookupId(lookups.categories||[],source.category||source.referenceNames?.category);
  const parsedDietaryNames=[...new Set([...(source.dietaryConsiderations||[]),...(source.dietaryConsiderationNames||[]),...(source.referenceNames?.dietaryConsiderations||[])].map(value=>typeof value==="object"?value.name||"":value).map(value=>String(value||"").trim()).filter(Boolean))];
  const parsed={
   ...source,
   isActive:true,
   business:data.business||objectId(initialData.business),
   cuisines:[cuisine].filter(Boolean),
   courses:[course].filter(Boolean),
   categories:[category].filter(Boolean),
   primaryCuisine:cuisine,
   primaryCourse:course,
   primaryCategory:category,
   sourceCuisine:source.cuisine||source.referenceNames?.cuisine||"",
   sourceCourse:source.course||source.referenceNames?.course||"",
   sourceCategory:source.category||source.referenceNames?.category||"",
   sourceMealType:source.mealTypeName||"",
   dietaryConsiderations:parsedDietaryNames.map(value=>lookupId(lookups.dietaries||[],value)).filter(Boolean),
   unmatchedDietaries:parsedDietaryNames.filter(value=>!lookupId(lookups.dietaries||[],value)),
   equipment:(source.equipmentNames||[]).map(value=>lookupId(lookups.equipment||[],value)).filter(Boolean),
   equipmentNames:source.equipmentNames||[],
   unmatchedEquipment:(source.equipmentNames||[]).filter(value=>!lookupId(lookups.equipment||[],value)),
   techniqueRefs:(source.techniques||[]).map(value=>lookupId(lookups.techniques||[],value)).filter(Boolean),
   unmatchedTechniques:(source.techniques||[]).filter(value=>!lookupId(lookups.techniques||[],value)),
   allergens:(source.allergens||[]).map(value=>lookupId(lookups.allergens||[],value)).filter(Boolean),
   yield:{...(source.yield||{}),imperialUnit:lookupUnitId(lookups.imperialUnits||[],source.yield?.imperialUnitName,source.yield?.imperialDisplay),metricUnit:lookupUnitId(lookups.metricUnits||[],source.yield?.metricUnitName,source.yield?.metricDisplay)},
   servingSize:{...(source.servingSize||{}),imperialUnit:lookupUnitId(lookups.imperialUnits||[],source.servingSize?.imperialUnitName,source.servingSize?.imperialDisplay),metricUnit:lookupUnitId(lookups.metricUnits||[],source.servingSize?.metricUnitName,source.servingSize?.metricDisplay)},
   ingredients:(source.ingredients||[]).map(item=>{
    const ingredientName=String(item.ingredientName||item.sourceName||item.name||"").trim();
    return{...item,ingredient:lookupId(lookups.ingredients||[],ingredientName),sourceName:ingredientName,imperialUnit:lookupUnitId(lookups.imperialUnits||[],item.imperialUnitName,item.imperialDisplay),metricUnit:lookupUnitId(lookups.metricUnits||[],item.metricUnitName,item.metricDisplay)};
   })
  };
  const next=buildForm(parsed);
  const servingCount=countFromDescription(next.servingSizeDescription);
  if(servingCount&&next.servingSize.imperialQuantity===""&&next.servingSize.metricQuantity===""){
   next.servingSize.imperialQuantity=servingCount.quantity;
   next.servingSize.metricQuantity=servingCount.quantity;
   next.servingSize.imperialUnit=countUnitId(lookups.imperialUnits||[]);
   next.servingSize.metricUnit=countUnitId(lookups.metricUnits||[]);
  }
  for(const section of ["yield","servingSize"]){
   const measurement=next[section];
   if(measurement.imperialQuantity!==null&&measurement.imperialQuantity!==""&&measurement.imperialUnit&&(!measurement.metricUnit||measurement.metricQuantity===null||measurement.metricQuantity==="")){
    const converted=convertMeasurement(measurement.imperialQuantity,measurement.imperialUnit,lookups.imperialUnits||[],lookups.metricUnits||[]);
    if(converted){measurement.metricQuantity=converted.quantity;measurement.metricUnit=converted.unit;}
   }else if(measurement.metricQuantity!==null&&measurement.metricQuantity!==""&&measurement.metricUnit&&(!measurement.imperialUnit||measurement.imperialQuantity===null||measurement.imperialQuantity==="")){
    const converted=convertMeasurement(measurement.metricQuantity,measurement.metricUnit,lookups.metricUnits||[],lookups.imperialUnits||[]);
    if(converted){measurement.imperialQuantity=converted.quantity;measurement.imperialUnit=converted.unit;}
   }
  }
  if(Number(next.servings)>0){
   const hasImperial=next.servingSize.imperialQuantity!==""&&next.servingSize.imperialQuantity!==null&&next.servingSize.imperialQuantity!==undefined;
   const hasMetric=next.servingSize.metricQuantity!==""&&next.servingSize.metricQuantity!==null&&next.servingSize.metricQuantity!==undefined;
   next.yield={imperialQuantity:hasImperial?Number(next.servingSize.imperialQuantity)*Number(next.servings):next.yield.imperialQuantity,imperialUnit:hasImperial?next.servingSize.imperialUnit:next.yield.imperialUnit,metricQuantity:hasMetric?Number(next.servingSize.metricQuantity)*Number(next.servings):next.yield.metricQuantity,metricUnit:hasMetric?next.servingSize.metricUnit:next.yield.metricUnit};
  }
  next.ingredients=next.ingredients.map(item=>{
   const measurement={...item};
   if(measurement.imperialQuantity!==null&&measurement.imperialQuantity!==""&&measurement.imperialUnit&&(!measurement.metricUnit||measurement.metricQuantity===null||measurement.metricQuantity==="")){
    const converted=convertMeasurement(measurement.imperialQuantity,measurement.imperialUnit,lookups.imperialUnits||[],lookups.metricUnits||[]);
    if(converted){measurement.metricQuantity=converted.quantity;measurement.metricUnit=converted.unit;}
   }else if(measurement.metricQuantity!==null&&measurement.metricQuantity!==""&&measurement.metricUnit&&(!measurement.imperialUnit||measurement.imperialQuantity===null||measurement.imperialQuantity==="")){
    const converted=convertMeasurement(measurement.metricQuantity,measurement.metricUnit,lookups.metricUnits||[],lookups.imperialUnits||[]);
    if(converted){measurement.imperialQuantity=converted.quantity;measurement.imperialUnit=converted.unit;}
   }
   return measurement;
  });
  setData(next);
  reservedSignature.current="";
  setFormError("");
  setActiveTab("general");
 };

 return(
  <Form className="recipe-form" onSubmit={submit}>
   {submitting||loading?<Alert variant="info" className="recipe-save-progress"><Spinner animation="border" size="sm" aria-hidden="true"/> <strong>Saving recipe…</strong> {initialData._id?"Updating changed fields.":"Creating the recipe."}</Alert>:null}
   {formError?<Alert variant="danger" onClose={()=>setFormError("")}>{formError}</Alert>:null}
   <Tabs activeKey={activeTab} onSelect={key=>setActiveTab(key||"general")} className="mb-3" fill>
    <Tab eventKey="gpt-parser" title="GPT Parser"><RecipeParserModule type="text" onParsed={applyParsedRecipe}/></Tab>
    <Tab eventKey="word-parser" title="Word Parser"><RecipeParserModule type="word" onParsed={applyParsedRecipe} business={data.business} onImportedAll={onBulkImported}/></Tab>
    <Tab eventKey="general" title="General"><RecipeGeneralModule data={data} lookups={lookups} initialData={initialData} change={change} uploadImage={uploadImage} uploadingImage={uploadingImage} imageInputKey={imageInputKey} imageVersion={imageVersion} imageUrl={imageUrl} setData={setData} setImageInputKey={setImageInputKey} setImageVersion={setImageVersion} newLookups={newLookups} setNewLookups={setNewLookups} createLookup={createLookup} addLookup={addLookup} toggleLookup={toggleLookup} creatingLookup={creatingLookup} reservingNumber={reservingNumber} SelectOptions={SelectOptions} id={id}/></Tab>

    <Tab eventKey="yield" title="Yield & Serving"><RecipeYieldModule data={data} lookups={lookups} measurementChange={measurementChange} measurementQuantityChange={measurementQuantityChange} servingsChange={servingsChange} descriptionChange={value=>setData(prev=>({...prev,servingSizeDescription:value}))} SelectOptions={SelectOptions}/></Tab>

    <Tab eventKey="profile" title="Times & Flavor"><RecipeProfileModule data={data} nestedChange={nestedChange} change={change}/></Tab>

    <Tab eventKey="related" title="Related Items"><RecipeRelatedModule data={data} setData={setData} lookups={lookups} change={change} toggleDietary={toggleDietary} toggleLookup={toggleLookup} createLookup={createLookup} newLookups={newLookups} setNewLookups={setNewLookups} addLookup={addLookup} creatingLookup={creatingLookup}/></Tab>

    <Tab eventKey="ingredients" title={`Ingredients (${data.ingredients.length})`}><RecipeIngredientsModule data={data} lookups={lookups} SelectOptions={SelectOptions} arrayChange={ingredientChange} chooseVendor={chooseVendor} chooseIngredient={chooseIngredient} chooseVendorPrice={chooseVendorPrice} removeRow={removeRow} addIngredient={()=>addRow("ingredients",emptyIngredient())}/></Tab>

    <Tab eventKey="instructions" title={`Instructions (${data.instructions.length})`}><RecipeInstructionsModule instructions={data.instructions} arrayChange={arrayChange} removeRow={removeRow} addInstruction={()=>addRow("instructions",emptyInstruction(data.instructions.length))}/></Tab>

    <Tab eventKey="safety" title="Safety"><RecipeSafetyModule data={data} arrayChange={arrayChange} removeRow={removeRow} addHaccp={()=>addRow("haccp",emptyHaccp())} addCcp={()=>addRow("ccp",emptyCcp())}/></Tab>

    <Tab eventKey="finish" title="Plating & Storage"><RecipeFinishModule data={data} change={change}/></Tab>

    <Tab eventKey="nutrition" title="Nutrition"><RecipeNutritionModule recipeId={initialData._id} nutrition={data.nutrition} fields={nutritionFields} nestedChange={nestedChange} ingredients={data.ingredients} lookups={lookups} servings={data.servings} onApply={nutrition=>{baseline.current.nutrition=nutrition;setData(current=>({...current,nutrition}));}}/></Tab>
   </Tabs>
   <div className="d-flex justify-content-end mt-4"><Button type="submit" disabled={loading||submitting||uploadingImage||reservingNumber}>{loading||submitting?"Saving...":uploadingImage?"Uploading Image...":reservingNumber?"Generating Number...":(submitLabel||(initialData._id?"Save Changes":"Save Recipe"))}</Button></div>
  </Form>
 );
}