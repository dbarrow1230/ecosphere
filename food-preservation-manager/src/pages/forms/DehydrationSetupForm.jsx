// src/pages/forms/DehydrationSetupForm.jsx
import {useEffect,useMemo,useState} from "react";
import {Modal,Form,Row,Col,Button,Alert,Spinner} from "react-bootstrap";
import {useNavigate,useParams} from "react-router-dom";
import SortedSelect from "../../components/SortedSelect.jsx";
import "../../styles/dehyrdationSetup.css";

const createMinMax=()=>({min:"",max:""});
const createDateTimeRange=()=>({minDate:"",minTime:"",maxDate:"",maxTime:""});
const createScheduleItem=()=>({date:"",time:"",action:""});
const createPrepItem=()=>({step:0,date:"",time:"",action:"",preparation:""});
const createBeforePriceRow=()=>({weight:"",pricePerUnit:"",totalPrice:""});
const createAfterPriceRow=()=>({weightAfterDehydration:"",pricePerUnit:"",totalPrice:""});
const createEquivalentRow=()=>({freshAmount:"",driedEquivalent:"",equivalentLb:"",equivalentOz:"",equivalentGrams:""});
const createCostSummaryRow=()=>({method:"",wattage:"",energyUsedKwh:"",energyCost:"",totalCost:""});
const createIntervalNote=()=>({date:"",time:"",note:""});

const parseAmountNumber=value=>{
 const text=String(value||"").trim();
 const mixed=text.match(/^(\d+)\s+(\d+)\/(\d+)/);
 if(mixed) return Number(mixed[1])+(Number(mixed[2])/Number(mixed[3]));
 const fraction=text.match(/^(\d+)\/(\d+)/);
 if(fraction) return Number(fraction[1])/Number(fraction[2]);
 return Number.parseFloat(text.replace(",",""))||0;
};

const equivalentWeights=(freshAmount,form)=>{
 const text=String(freshAmount||"").toLowerCase();
 const amount=parseAmountNumber(text);
 if(!amount) return null;
 let grams=0;
 if(/\bkg\b|kilogram/.test(text)) grams=amount*1000;
 else if(/\bg\b|gram/.test(text)) grams=amount;
 else if(/\blb\b|pound/.test(text)) grams=amount*453.59237;
 else if(/\boz\b|ounce/.test(text)) grams=amount*28.349523125;
 else if(/\bcup\b|tablespoon|\btbsp\b|teaspoon|\btsp\b/.test(text)){
  const recordedGrams=Number(form?.marketPriceCalculationDefaults?.beforeDehydration?.grams?.weight||0);
  const cupMultiplier=/tablespoon|\btbsp\b/.test(text)?amount/16:(/teaspoon|\btsp\b/.test(text)?amount/48:amount);
  if(recordedGrams>0) grams=recordedGrams*cupMultiplier;
 }
 if(!grams) return null;
 return{
  equivalentLb:(grams/453.59237).toFixed(4),
  equivalentOz:(grams/28.349523125).toFixed(4),
  equivalentGrams:grams.toFixed(2)
 };
};

const createDefaultForm=()=>({
 item:"",
 dehydrator:"",
 fuelSource:"",
 dehydrationMethods:{
  dehydratorMethod:{
   suggestedTemperatureRange:"95–115°F (35–46°C)",
   estimatedDuration:"",
   estimatedEnergyConsumption:createMinMax(),
   estimatedEnergyCost:createMinMax(),
   estimatedEndDateTime:createDateTimeRange()
  },
  ovenMethod:{
   temperature:"",
   estimatedTime:"",
   energyConsumption:createMinMax(),
   estimatedEnergyCost:createMinMax(),
   estimatedEndDateTime:createDateTimeRange()
  }
 },
 predictedWeightAfterDehydration:{
  expectedWeightLoss:"",
  predictedWeight:"",
  predictedFinalWeight:createMinMax()
 },
 totalCostSummary:[createCostSummaryRow()],
 marketPriceCalculationDefaults:{
  beforeDehydration:{
   pounds:createBeforePriceRow(),
   ounces:createBeforePriceRow(),
   grams:createBeforePriceRow()
  },
  afterDehydration:{
   pounds:createAfterPriceRow(),
   ounces:createAfterPriceRow(),
   grams:createAfterPriceRow()
  },
  costPerUnitCalculation:{
   totalCost:"",
   totalWeight:"",
   costPerUnit:""
  }
 },
 defaultSchedules:{
  dehydratorSchedule:[createScheduleItem()],
  ovenSchedule:[createScheduleItem()]
 },
 preparationInstructions:[createPrepItem()],
 storageInstructions:{
  instructions:[""],
  shelfLife:{
   roomTemperature:"",
   freezer:"",
   powder:""
  }
 },
 rehydrationInstructions:"",
 equivalentsTable:[createEquivalentRow()],
 finalNotes:"",
 status:"active",
 isActive:true
});

const toInputDate=value=>{
 if(!value) return "";
 const date=new Date(value);
 if(Number.isNaN(date.getTime())) return "";
 return date.toISOString().slice(0,10);
};

const normalizeMinMax=value=>({
 min:value?.min?.$numberDecimal??value?.min??"",
 max:value?.max?.$numberDecimal??value?.max??""
});

const normalizeDateTimeRange=value=>({
 minDate:toInputDate(value?.minDate),
 minTime:value?.minTime??"",
 maxDate:toInputDate(value?.maxDate),
 maxTime:value?.maxTime??""
});

const normalizeBeforePriceRow=value=>({
 weight:value?.weight?.$numberDecimal??value?.weight??"",
 pricePerUnit:value?.pricePerUnit?.$numberDecimal??value?.pricePerUnit??"",
 totalPrice:value?.totalPrice?.$numberDecimal??value?.totalPrice??""
});

const normalizeAfterPriceRow=value=>({
 weightAfterDehydration:value?.weightAfterDehydration?.$numberDecimal??value?.weightAfterDehydration??"",
 pricePerUnit:value?.pricePerUnit?.$numberDecimal??value?.pricePerUnit??"",
 totalPrice:value?.totalPrice?.$numberDecimal??value?.totalPrice??""
});

const normalizeCostSummaryRow=value=>({
 method:value?.method??"",
 wattage:value?.wattage?.$numberDecimal??value?.wattage??"",
 energyUsedKwh:value?.energyUsedKwh?.$numberDecimal??value?.energyUsedKwh??"",
 energyCost:value?.energyCost?.$numberDecimal??value?.energyCost??"",
 totalCost:value?.totalCost?.$numberDecimal??value?.totalCost??""
});

const normalizeEquivalentRow=value=>({
 freshAmount:value?.freshAmount??"",
 driedEquivalent:value?.driedEquivalent??"",
 equivalentLb:value?.equivalentLb?.$numberDecimal??value?.equivalentLb??"",
 equivalentOz:value?.equivalentOz?.$numberDecimal??value?.equivalentOz??"",
 equivalentGrams:value?.equivalentGrams?.$numberDecimal??value?.equivalentGrams??""
});

const normalizePrepItem=value=>({
 step:value?.step??0,
 date:toInputDate(value?.date),
 time:value?.time??"",
 action:value?.action??"",
 preparation:value?.preparation??""
});

const normalizeScheduleItem=value=>({
 date:toInputDate(value?.date),
 time:value?.time??"",
 action:value?.action??""
});

const normalizeSetup=data=>({
 item:data?.item??"",
 dehydrator:data?.dehydrator?._id??data?.dehydrator??"",
 fuelSource:data?.fuelSource?._id??data?.fuelSource??"",
 dehydrationMethods:{
  dehydratorMethod:{
   suggestedTemperatureRange:data?.dehydrationMethods?.dehydratorMethod?.suggestedTemperatureRange??"95–115°F (35–46°C)",
   estimatedDuration:data?.dehydrationMethods?.dehydratorMethod?.estimatedDuration??"",
   estimatedEnergyConsumption:normalizeMinMax(data?.dehydrationMethods?.dehydratorMethod?.estimatedEnergyConsumption),
   estimatedEnergyCost:normalizeMinMax(data?.dehydrationMethods?.dehydratorMethod?.estimatedEnergyCost),
   estimatedEndDateTime:normalizeDateTimeRange(data?.dehydrationMethods?.dehydratorMethod?.estimatedEndDateTime)
  },
  ovenMethod:{
   temperature:data?.dehydrationMethods?.ovenMethod?.temperature??"",
   estimatedTime:data?.dehydrationMethods?.ovenMethod?.estimatedTime??"",
   energyConsumption:normalizeMinMax(data?.dehydrationMethods?.ovenMethod?.energyConsumption),
   estimatedEnergyCost:normalizeMinMax(data?.dehydrationMethods?.ovenMethod?.estimatedEnergyCost),
   estimatedEndDateTime:normalizeDateTimeRange(data?.dehydrationMethods?.ovenMethod?.estimatedEndDateTime)
  }
 },
 predictedWeightAfterDehydration:{
  expectedWeightLoss:data?.predictedWeightAfterDehydration?.expectedWeightLoss?.$numberDecimal??data?.predictedWeightAfterDehydration?.expectedWeightLoss??"",
  predictedWeight:data?.predictedWeightAfterDehydration?.predictedWeight?.$numberDecimal??data?.predictedWeightAfterDehydration?.predictedWeight??"",
  predictedFinalWeight:normalizeMinMax(data?.predictedWeightAfterDehydration?.predictedFinalWeight)
 },
 totalCostSummary:Array.isArray(data?.totalCostSummary)&&data.totalCostSummary.length?data.totalCostSummary.map(normalizeCostSummaryRow):[createCostSummaryRow()],
 marketPriceCalculationDefaults:{
  beforeDehydration:{
   pounds:normalizeBeforePriceRow(data?.marketPriceCalculationDefaults?.beforeDehydration?.pounds),
   ounces:normalizeBeforePriceRow(data?.marketPriceCalculationDefaults?.beforeDehydration?.ounces),
   grams:normalizeBeforePriceRow(data?.marketPriceCalculationDefaults?.beforeDehydration?.grams)
  },
  afterDehydration:{
   pounds:normalizeAfterPriceRow(data?.marketPriceCalculationDefaults?.afterDehydration?.pounds),
   ounces:normalizeAfterPriceRow(data?.marketPriceCalculationDefaults?.afterDehydration?.ounces),
   grams:normalizeAfterPriceRow(data?.marketPriceCalculationDefaults?.afterDehydration?.grams)
  },
  costPerUnitCalculation:{
   totalCost:data?.marketPriceCalculationDefaults?.costPerUnitCalculation?.totalCost?.$numberDecimal??data?.marketPriceCalculationDefaults?.costPerUnitCalculation?.totalCost??"",
   totalWeight:data?.marketPriceCalculationDefaults?.costPerUnitCalculation?.totalWeight?.$numberDecimal??data?.marketPriceCalculationDefaults?.costPerUnitCalculation?.totalWeight??"",
   costPerUnit:data?.marketPriceCalculationDefaults?.costPerUnitCalculation?.costPerUnit?.$numberDecimal??data?.marketPriceCalculationDefaults?.costPerUnitCalculation?.costPerUnit??""
  }
 },
 defaultSchedules:{
  dehydratorSchedule:Array.isArray(data?.defaultSchedules?.dehydratorSchedule)&&data.defaultSchedules.dehydratorSchedule.length?data.defaultSchedules.dehydratorSchedule.map(normalizeScheduleItem):[createScheduleItem()],
  ovenSchedule:Array.isArray(data?.defaultSchedules?.ovenSchedule)&&data.defaultSchedules.ovenSchedule.length?data.defaultSchedules.ovenSchedule.map(normalizeScheduleItem):[createScheduleItem()]
 },
 preparationInstructions:Array.isArray(data?.preparationInstructions)&&data.preparationInstructions.length?data.preparationInstructions.map(normalizePrepItem):[createPrepItem()],
 storageInstructions:{
  instructions:Array.isArray(data?.storageInstructions?.instructions)&&data.storageInstructions.instructions.length?data.storageInstructions.instructions:[""],
  shelfLife:{
   roomTemperature:data?.storageInstructions?.shelfLife?.roomTemperature??"",
   freezer:data?.storageInstructions?.shelfLife?.freezer??"",
   powder:data?.storageInstructions?.shelfLife?.powder??""
  }
 },
 rehydrationInstructions:data?.rehydrationInstructions??"",
 equivalentsTable:Array.isArray(data?.equivalentsTable)&&data.equivalentsTable.length?data.equivalentsTable.map(normalizeEquivalentRow):[createEquivalentRow()],
 finalNotes:data?.finalNotes??"",
 status:data?.status??(data?.isActive===false?"inactive":"active"),
 isActive:typeof data?.isActive==="boolean"?data.isActive:true
});

const cleanDecimal=value=>{
 if(value===null||value===undefined) return "";
 return String(value).trim();
};

const cloneForm=form=>JSON.parse(JSON.stringify(form));

const escapeRegex=value=>String(value).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");

const normalizeImportText=value=>String(value||"")
 .replace(/&nbsp;|&#x20;/gi," ")
 .replace(/\\\s*\r?\n/g,"\n")
 .replace(/\u00a0/g," ")
 .replace(/\r/g,"")
 .replace(/^\s*#{1,6}\s*/gm,"")
 .replace(/\*\*/g,"")
 .replace(/__/g,"")
 .replace(/^\s*>\s?/gm,"")
 .trim();

const normalizeHeading=value=>String(value||"")
 .replace(/^\s*[-*+]\s*/,"")
 .replace(/^\s*#{1,6}\s*/,"")
 .replace(/\*\*/g,"")
 .replace(/__/g,"")
 .replace(/[:\\]+$/g,"")
 .replace(/\s+/g," ")
 .trim()
 .toLowerCase();

const getLineValue=(text,label)=>{
 const source=normalizeImportText(text);
 const escaped=escapeRegex(label);
 const patterns=[
  new RegExp(`^\\s*[-*+]?\\s*${escaped}\\s*:\\s*(.*)$`,"im"),
  new RegExp(`^\\s*${escaped}\\s{2,}(.*)$`,"im"),
  new RegExp(`^\\s*\\|?\\s*${escaped}\\s*\\|\\s*(.*?)\\s*\\|?\\s*$`,"im")
 ];
 for(const pattern of patterns){
  const match=source.match(pattern);
  if(match?.[1]!=null)return match[1].trim();
 }
 return "";
};

const getAnyLineValue=(text,labels=[])=>{
 for(const label of labels){
  const value=getLineValue(text,label);
  if(value)return value;
 }
 return "";
};

const getSectionText=(text,startHeading,endHeadings=[])=>{
 const source=normalizeImportText(text);
 const lines=source.split(/\r?\n/);
 const startNames=(Array.isArray(startHeading)?startHeading:[startHeading]).map(normalizeHeading);
 const endNames=endHeadings.map(normalizeHeading);
 let start=-1;
 for(let index=0;index<lines.length;index+=1){
  const current=normalizeHeading(lines[index]);
  if(startNames.some(name=>current===name||current.startsWith(`${name} -`)||current.startsWith(`${name} `))){
   start=index;
   break;
  }
 }
 if(start<0)return "";
 let end=lines.length;
 for(let index=start+1;index<lines.length;index+=1){
  const current=normalizeHeading(lines[index]);
  if(endNames.some(name=>current===name||current.startsWith(`${name} -`)||current.startsWith(`${name} `))){
   end=index;
   break;
  }
 }
 return lines.slice(start+1,end).join("\n").trim();
};

const firstNumber=value=>{
 const match=String(value||"").replace(/,/g,"").match(/-?\d+(?:\.\d+)?/);
 return match?match[0]:"";
};

const allNumbers=value=>String(value||"").replace(/,/g,"").match(/-?\d+(?:\.\d+)?/g)||[];

const normalizeImportDate=value=>{
 const raw=String(value||"").trim();
 if(!raw)return "";
 const date=new Date(raw);
 if(Number.isNaN(date.getTime()))return "";
 return date.toISOString().slice(0,10);
};

const normalizeImportTime=value=>{
 const raw=String(value||"").trim();
 if(!raw)return "";
 const twentyFour=raw.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
 if(twentyFour)return `${String(twentyFour[1]).padStart(2,"0")}:${twentyFour[2]}`;
 const twelve=raw.match(/\b(1[0-2]|0?[1-9]):([0-5]\d)\s*(am|pm)\b/i);
 if(!twelve)return "";
 let hour=Number(twelve[1]);
 if(twelve[3].toLowerCase()==="pm"&&hour!==12)hour+=12;
 if(twelve[3].toLowerCase()==="am"&&hour===12)hour=0;
 return `${String(hour).padStart(2,"0")}:${twelve[2]}`;
};

const splitTabularRows=section=>{
 return normalizeImportText(section)
  .split(/\r?\n/)
  .map(line=>line.trim().replace(/\\$/,"").trim())
  .filter(line=>line&&!(line.startsWith("|")&&/^\|?[\s:|-]+\|?$/.test(line)))
  .map(line=>{
   if(line.includes("|"))return line.replace(/^\|/,"").replace(/\|$/,"").split("|").map(value=>value.trim());
   if(line.includes("\t"))return line.split(/\t+/).map(value=>value.trim());
   return line.split(/\s{2,}/).map(value=>value.trim());
  });
};

const getExactSection=(text,startHeading,endHeadings=[])=>getSectionText(text,[startHeading],endHeadings);

const numberRange=value=>{
 const values=allNumbers(value).map(number=>String(Math.abs(Number(number))));
 return {min:values[0]||"",max:values[1]||values[0]||""};
};

const bulletLines=section=>normalizeImportText(section).split(/\r?\n/)
 .map(line=>line.trim().replace(/\\$/,"").replace(/^[-*+]\s*/,"").trim())
 .filter(line=>line&&!/^\|?[\s:|-]+\|?$/.test(line));

const getRangeFromSection=(section,rangeLabels,minLabels,maxLabels)=>{
 const minValue=getAnyLineValue(section,minLabels);
 const maxValue=getAnyLineValue(section,maxLabels);
 if(minValue||maxValue)return {min:firstNumber(minValue),max:firstNumber(maxValue)};
 const rangeValue=getAnyLineValue(section,rangeLabels);
 return numberRange(rangeValue);
};

const getDateTimeRangeFromSection=section=>({
 minDate:normalizeImportDate(getAnyLineValue(section,["Estimated End Min Date","Min Date","Earliest End Date","Estimated Minimum End Date"])),
 minTime:normalizeImportTime(getAnyLineValue(section,["Estimated End Min Time","Min Time","Earliest End Time","Estimated Minimum End Time"])),
 maxDate:normalizeImportDate(getAnyLineValue(section,["Estimated End Max Date","Max Date","Latest End Date","Estimated Maximum End Date"])),
 maxTime:normalizeImportTime(getAnyLineValue(section,["Estimated End Max Time","Max Time","Latest End Time","Estimated Maximum End Time"]))
});

const unitValues=value=>{
 const source=String(value||"").replace(/,/g,"");
 const read=(regex)=>firstNumber((source.match(regex)||[])[1]||"");
 return{
  pounds:read(/(\d+(?:\.\d+)?)\s*(?:lb\.?|lbs\.?|pounds?)/i),
  ounces:read(/(\d+(?:\.\d+)?)\s*(?:oz\.?|ounces?)/i),
  grams:read(/(\d+(?:\.\d+)?)\s*(?:g\.?|grams?)/i)
 };
};

const findOptionId=(options,value,labelFields=[])=>{
 const needle=String(value||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
 if(!needle)return "";
 const found=options.find(option=>{
  const label=labelFields.map(field=>option?.[field]||"").join(" ").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
  return label===needle||label.includes(needle)||needle.includes(label)||needle.split(" ").every(part=>label.includes(part));
 });
 return found?found._id||found.id||"":"";
};

const parseUnitTable=(section,after=false)=>{
 const result={};
 const rows=splitTabularRows(section);
 const aliases={pounds:/^(?:pounds?|lb\.?|lbs\.?)$/i,ounces:/^(?:ounces?|oz\.?)$/i,grams:/^(?:grams?|g\.?)$/i};
 for(const [unit,regex] of Object.entries(aliases)){
  const row=rows.find(values=>regex.test(String(values[0]||"").trim()));
  if(!row)continue;
  const values=row.slice(1).map(firstNumber).filter(value=>value!=="");
  if(!values.length)continue;
  result[unit]=after
   ?{weightAfterDehydration:values[0]||"",pricePerUnit:values[1]||"",totalPrice:values[2]||""}
   :{weight:values[0]||"",pricePerUnit:values[1]||"",totalPrice:values[2]||""};
 }
 return result;
};

const parseScheduleRows=section=>{
 const rows=splitTabularRows(section);
 const result={dehydrator:[],oven:[]};
 for(const row of rows){
  const method=String(row[0]||"").trim().toLowerCase();
  if(method!=="dehydrator"&&method!=="oven")continue;
  const date=normalizeImportDate(row[1]||"");
  const time=normalizeImportTime(row[2]||"");
  const action=(time?row.slice(3):row.slice(2)).filter(Boolean).join(" — ").trim();
  result[method].push({date,time,action});
 }
 return result;
};

const applyTemplateImport=(currentForm,text,dehydrators=[],fuelSources=[])=>{
 const next=cloneForm(currentForm);
 const source=normalizeImportText(text);

 const item=getAnyLineValue(source,["Item","Product","Ingredient"]);
 if(item)next.item=item;

 const importedStatus=getAnyLineValue(source,["Status"]);
 if(importedStatus){
  const status=importedStatus.toLowerCase().replace(/\s+/g,"_");
  if(["active","inactive","paused","completed","cancelled"].includes(status)){
   next.status=status;
   next.isActive=status!=="inactive"&&status!=="cancelled";
  }
 }

 const dehydratorValue=getAnyLineValue(source,["Dehydrator","Dehydrator Model","Dehydrator Used","Equipment"]);
 const dehydratorId=findOptionId(dehydrators,dehydratorValue,["brand","name","title","model"]);
 if(dehydratorId)next.dehydrator=dehydratorId;

 const fuelValue=getAnyLineValue(source,["Fuel Source","Fuel","Energy Source"]);
 const fuelId=findOptionId(fuelSources,fuelValue,["name","title","type","provider"]);
 if(fuelId)next.fuelSource=fuelId;

 const methodSection=getSectionText(source,["Dehydration Methods","Methods"],["Predicted Weight After Dehydration","Predicted Weight","Total Cost Summary","Market Price Calculation"]);
 const methodSource=methodSection||source;
 const dehydratorSection=getSectionText(methodSource,["Dehydrator Method","Dehydrator"],["Oven Method","Oven","Predicted Weight After Dehydration","Total Cost Summary"]);
 const ovenSection=getSectionText(methodSource,["Oven Method","Oven"],["Predicted Weight After Dehydration","Total Cost Summary","Market Price Calculation"]);
 const dehydratorSource=dehydratorSection||methodSource;
 const ovenSource=ovenSection||methodSource;

 const dehydratorMethod=next.dehydrationMethods.dehydratorMethod;
 const suggestedTemp=getAnyLineValue(dehydratorSource,["Suggested Temperature Range","Temperature Range","Temperature"]);
 const dehydratorDuration=getAnyLineValue(dehydratorSource,["Estimated Duration","Estimated Time","Duration","Time"]);
 if(suggestedTemp)dehydratorMethod.suggestedTemperatureRange=suggestedTemp;
 if(dehydratorDuration)dehydratorMethod.estimatedDuration=dehydratorDuration;
 const dehydratorConsumption=getRangeFromSection(dehydratorSource,["Estimated Energy Consumption","Estimated Energy Used","Energy Consumption","Energy Used"],["Estimated Energy Consumption Min","Estimated Energy Used Min","Energy Consumption Min","Energy Used Min"],["Estimated Energy Consumption Max","Estimated Energy Used Max","Energy Consumption Max","Energy Used Max"]);
 if(dehydratorConsumption.min)dehydratorMethod.estimatedEnergyConsumption.min=dehydratorConsumption.min;
 if(dehydratorConsumption.max)dehydratorMethod.estimatedEnergyConsumption.max=dehydratorConsumption.max;
 const dehydratorCost=getRangeFromSection(dehydratorSource,["Estimated Energy Cost","Energy Cost"],["Estimated Energy Cost Min","Energy Cost Min"],["Estimated Energy Cost Max","Energy Cost Max"]);
 if(dehydratorCost.min)dehydratorMethod.estimatedEnergyCost.min=dehydratorCost.min;
 if(dehydratorCost.max)dehydratorMethod.estimatedEnergyCost.max=dehydratorCost.max;
 const dehydratorEnd=getDateTimeRangeFromSection(dehydratorSource);
 Object.entries(dehydratorEnd).forEach(([key,value])=>{if(value)dehydratorMethod.estimatedEndDateTime[key]=value;});

 const ovenMethod=next.dehydrationMethods.ovenMethod;
 const ovenTemperature=getAnyLineValue(ovenSource,["Temperature","Oven Temperature","Temperature Range"]);
 const ovenTime=getAnyLineValue(ovenSource,["Estimated Time","Estimated Duration","Duration","Time"]);
 if(ovenTemperature)ovenMethod.temperature=ovenTemperature;
 if(ovenTime)ovenMethod.estimatedTime=ovenTime;
 const ovenConsumption=getRangeFromSection(ovenSource,["Energy Consumption","Estimated Energy Consumption","Estimated Energy Used","Energy Used"],["Energy Consumption Min","Estimated Energy Consumption Min","Estimated Energy Used Min","Energy Used Min"],["Energy Consumption Max","Estimated Energy Consumption Max","Estimated Energy Used Max","Energy Used Max"]);
 if(ovenConsumption.min)ovenMethod.energyConsumption.min=ovenConsumption.min;
 if(ovenConsumption.max)ovenMethod.energyConsumption.max=ovenConsumption.max;
 const ovenCost=getRangeFromSection(ovenSource,["Estimated Energy Cost","Energy Cost"],["Estimated Energy Cost Min","Energy Cost Min"],["Estimated Energy Cost Max","Energy Cost Max"]);
 if(ovenCost.min)ovenMethod.estimatedEnergyCost.min=ovenCost.min;
 if(ovenCost.max)ovenMethod.estimatedEnergyCost.max=ovenCost.max;
 const ovenEnd=getDateTimeRangeFromSection(ovenSource);
 Object.entries(ovenEnd).forEach(([key,value])=>{if(value)ovenMethod.estimatedEndDateTime[key]=value;});

 const predictedSection=getSectionText(source,["Predicted Weight After Dehydration","Predicted Weight"],["Total Cost Summary","Market Price Calculation","Cost Per Unit Calculation","Preparation Instructions"]);
 const predictedSource=predictedSection||source;
 const expectedLoss=getAnyLineValue(predictedSource,["Expected Weight Loss","Estimated Weight Reduction","Weight Loss","Expected Weight Reduction"]);
 const predictedWeight=getAnyLineValue(predictedSource,["Predicted Weight","Expected Final Weight"]);
 const predictedMin=getAnyLineValue(predictedSource,["Predicted Final Weight Min","Minimum Final Weight","Min"]);
 const predictedMax=getAnyLineValue(predictedSource,["Predicted Final Weight Max","Maximum Final Weight","Max"]);
 const predictedRange=getAnyLineValue(predictedSource,["Predicted Final Weight","Final Weight Range"]);
 if(expectedLoss)next.predictedWeightAfterDehydration.expectedWeightLoss=firstNumber(expectedLoss);
 if(predictedWeight)next.predictedWeightAfterDehydration.predictedWeight=firstNumber(predictedWeight);
 const range=numberRange(predictedRange);
 if(predictedMin||range.min)next.predictedWeightAfterDehydration.predictedFinalWeight.min=firstNumber(predictedMin)||range.min;
 if(predictedMax||range.max)next.predictedWeightAfterDehydration.predictedFinalWeight.max=firstNumber(predictedMax)||range.max;

 const startingWeight=getAnyLineValue(source,["Starting Weight","Weight Before Dehydration","Fresh Weight","Weight"]);
 const startingUnits=unitValues(startingWeight);
 if(startingUnits.pounds)next.marketPriceCalculationDefaults.beforeDehydration.pounds.weight=startingUnits.pounds;
 if(startingUnits.ounces)next.marketPriceCalculationDefaults.beforeDehydration.ounces.weight=startingUnits.ounces;
 if(startingUnits.grams)next.marketPriceCalculationDefaults.beforeDehydration.grams.weight=startingUnits.grams;
 if(!startingUnits.pounds&&!startingUnits.ounces&&!startingUnits.grams&&startingWeight){
  const value=firstNumber(startingWeight);
  if(/\boz\b|ounce/i.test(startingWeight))next.marketPriceCalculationDefaults.beforeDehydration.ounces.weight=value;
  else if(/\bg\b|gram/i.test(startingWeight))next.marketPriceCalculationDefaults.beforeDehydration.grams.weight=value;
  else if(/\blb\b|pound/i.test(startingWeight))next.marketPriceCalculationDefaults.beforeDehydration.pounds.weight=value;
 }

 const purchasePrice=getAnyLineValue(source,["Purchase Price","Market Price","Ingredient Cost","Total Purchase Price"]);
 const costPerPound=getAnyLineValue(source,["Cost Per Pound","Price Per Pound","Price Per lb"]);
 const costPerOunce=getAnyLineValue(source,["Cost Per Ounce","Price Per Ounce","Price Per oz"]);
 const costPerGram=getAnyLineValue(source,["Cost Per Gram","Price Per Gram","Price Per g"]);
 if(costPerPound)next.marketPriceCalculationDefaults.beforeDehydration.pounds.pricePerUnit=firstNumber(costPerPound);
 if(costPerOunce)next.marketPriceCalculationDefaults.beforeDehydration.ounces.pricePerUnit=firstNumber(costPerOunce);
 if(costPerGram)next.marketPriceCalculationDefaults.beforeDehydration.grams.pricePerUnit=firstNumber(costPerGram);
 if(purchasePrice){
  const value=firstNumber(purchasePrice);
  if(startingUnits.grams)next.marketPriceCalculationDefaults.beforeDehydration.grams.totalPrice=value;
  else if(startingUnits.ounces)next.marketPriceCalculationDefaults.beforeDehydration.ounces.totalPrice=value;
  else if(startingUnits.pounds)next.marketPriceCalculationDefaults.beforeDehydration.pounds.totalPrice=value;
 }

 const beforeSection=getSectionText(source,["Market Price Calculation - Before Dehydration","Before Dehydration","Before"],["Market Price Calculation - After Dehydration","After Dehydration","After","Cost Per Unit Calculation"]);
 const beforeTable=parseUnitTable(beforeSection,false);
 for(const [unit,row] of Object.entries(beforeTable))next.marketPriceCalculationDefaults.beforeDehydration[unit]={...next.marketPriceCalculationDefaults.beforeDehydration[unit],...row};

 const afterSection=getSectionText(source,["Market Price Calculation - After Dehydration","After Dehydration","After"],["Cost Per Unit Calculation","Schedule of Dates, Times, and Actions","Preparation Instructions"]);
 const afterTable=parseUnitTable(afterSection,true);
 for(const [unit,row] of Object.entries(afterTable))next.marketPriceCalculationDefaults.afterDehydration[unit]={...next.marketPriceCalculationDefaults.afterDehydration[unit],...row};

 const costSection=getSectionText(source,["Cost Per Unit Calculation","Cost per Unit Calculation"],["Schedule of Dates, Times, and Actions","Preparation Instructions","Storage Instructions"]);
 const costSource=costSection||source;
 const totalCost=getAnyLineValue(costSource,["Total Cost"]);
 const totalWeight=getAnyLineValue(costSource,["Total Weight","Finished Weight"]);
 const costPerUnit=getAnyLineValue(costSource,["Cost Per Unit"]);
 if(totalCost)next.marketPriceCalculationDefaults.costPerUnitCalculation.totalCost=firstNumber(totalCost);
 if(totalWeight)next.marketPriceCalculationDefaults.costPerUnitCalculation.totalWeight=firstNumber(totalWeight);
 if(costPerUnit)next.marketPriceCalculationDefaults.costPerUnitCalculation.costPerUnit=firstNumber(costPerUnit);

 const totalCostSection=getSectionText(source,["Total Cost Summary"],["Market Price Calculation","Cost Per Unit Calculation","Schedule of Dates, Times, and Actions"]);
 const totalCostRows=splitTabularRows(totalCostSection).filter(row=>/^(dehydrator|oven)$/i.test(String(row[0]||"").trim()));
 if(totalCostRows.length){
  next.totalCostSummary=totalCostRows.map(row=>{
   const numbers=row.slice(1).map(firstNumber).filter(value=>value!=="");
   return{
    method:row[0],
    wattage:numbers[0]||"",
    energyUsedKwh:numbers[1]||"",
    energyCost:numbers[2]||"",
    totalCost:numbers[3]||""
   };
  });
 }

 const scheduleSection=getSectionText(source,["Schedule of Dates, Times, and Actions","Default Schedule","Schedules"],["Preparation Instructions","Storage Instructions"]);
 const schedules=parseScheduleRows(scheduleSection);
 if(schedules.dehydrator.length)next.defaultSchedules.dehydratorSchedule=schedules.dehydrator;
 if(schedules.oven.length)next.defaultSchedules.ovenSchedule=schedules.oven;

 const prepSection=getSectionText(source,["Preparation Instructions","Preparation","Prep Instructions"],["Storage Instructions","Shelf Life","Rehydration Instructions"]);
 const prepRows=splitTabularRows(prepSection).filter(row=>/^\d+$/.test(String(row[0]||"").trim()));
 if(prepRows.length){
  next.preparationInstructions=prepRows.map((row,index)=>{
   const hasDate=normalizeImportDate(row[1]||"");
   const hasTime=normalizeImportTime(row[2]||"");
   return{
    step:Number(firstNumber(row[0])||index+1),
    date:hasDate,
    time:hasTime,
    action:hasDate||hasTime?String(row[3]||"").trim():"",
    preparation:hasDate||hasTime?row.slice(4).filter(Boolean).join(" ").trim():row.slice(1).filter(Boolean).join(" ").trim()
   };
  });
 }else{
  const numbered=bulletLines(prepSection).map(line=>line.match(/^(\d+)[.)-]?\s+(.*)$/)).filter(Boolean);
  if(numbered.length){
   next.preparationInstructions=numbered.map(match=>({step:Number(match[1]),date:"",time:"",action:"",preparation:match[2].trim()}));
  }
 }

 const storageSection=getSectionText(source,["Storage Instructions","Storage"],["Shelf Life","Rehydration Instructions","Equivalents Table"]);
 const storageLines=bulletLines(storageSection)
  .filter(line=>!/^instruction\s*\d*\s*:/i.test(line)?true:true)
  .map(line=>line.replace(/^instruction\s*\d*\s*:\s*/i,"").trim())
  .filter(Boolean);
 if(storageLines.length)next.storageInstructions.instructions=storageLines;

 const shelfSection=getSectionText(source,["Shelf Life"],["Rehydration Instructions","Equivalents Table","Final Notes"]);
 const shelfSource=shelfSection||source;
 const roomTemperature=getAnyLineValue(shelfSource,["Room Temperature","Room Temp","Pantry"]);
 const freezer=getAnyLineValue(shelfSource,["Freezer","Frozen"]);
 const powder=getAnyLineValue(shelfSource,["Powder","Powdered"]);
 if(roomTemperature)next.storageInstructions.shelfLife.roomTemperature=roomTemperature;
 if(freezer)next.storageInstructions.shelfLife.freezer=freezer;
 if(powder)next.storageInstructions.shelfLife.powder=powder;

 const rehydrationSection=getSectionText(source,["Rehydration Instructions","Rehydration"],["Equivalents Table","Final Notes","Notes"]);
 if(rehydrationSection)next.rehydrationInstructions=rehydrationSection.trim();

 const equivalentsSection=getSectionText(source,["Equivalents Table","Equivalents"],["Final Notes","Notes"]);
 const equivalentRows=splitTabularRows(equivalentsSection).filter(row=>row.length>=2&&!/fresh amount|dried amount|fresh sweet basil/i.test(String(row[0]||"")));
 if(equivalentRows.length){
  next.equivalentsTable=equivalentRows.map(row=>{
   const entry={
    ...createEquivalentRow(),
    freshAmount:String(row[0]||"").trim(),
    driedEquivalent:String(row[1]||"").trim(),
    equivalentLb:firstNumber(row[2]||""),
    equivalentOz:firstNumber(row[3]||""),
    equivalentGrams:firstNumber(row[4]||"")
   };
   if(!entry.equivalentLb&&!entry.equivalentOz&&!entry.equivalentGrams){
    const generated=equivalentWeights(entry.freshAmount,next);
    if(generated)Object.assign(entry,generated);
   }
   return entry;
  });
 }

 const finalNotes=getAnyLineValue(source,["Final Notes","Notes"]);
 const finalNotesSection=getSectionText(source,["Final Notes"],[]);
 if(finalNotes||finalNotesSection)next.finalNotes=(finalNotes||finalNotesSection).trim();

 return next;
};

const applyRunImport=(currentRun,text)=>{
 const next={...currentRun};
 const source=normalizeImportText(text);
 const set=(key,labels,transform=value=>value)=>{
  const value=getAnyLineValue(source,labels);
  if(value!=="")next[key]=transform(value);
 };
 set("batchName",["Batch Name","Item","Product","Ingredient"]);
 set("method",["Method"],value=>/oven/i.test(value)?"oven":"dehydrator");
 set("trayCount",["Number of Trays","Tray Count","Trays"],firstNumber);
 set("actualTemperature",["Actual Temperature","Temperature Used"]);
 set("weightPounds",["Weight Pounds","Weight Before Pounds","Pounds"],firstNumber);
 set("weightOunces",["Weight Ounces","Weight Before Ounces","Ounces"],firstNumber);
 set("ingredientCost",["Ingredient Cost","Purchase Price","Market Price"],firstNumber);
 set("costPerPound",["Cost Per Pound","Price Per Pound"],firstNumber);
 set("costPerOunce",["Cost Per Ounce","Price Per Ounce"],firstNumber);
 set("actualFinalWeight",["Actual Final Weight","Final Weight"],firstNumber);
 set("startDate",["Start Date","Date"],normalizeImportDate);
 set("startTime",["Start Time"],normalizeImportTime);
 set("estimatedEndDate",["Estimated End Date"],normalizeImportDate);
 set("endDate",["End Date","Completed Date"],normalizeImportDate);
 set("endTime",["End Time","Completed Time"],normalizeImportTime);
 set("status",["Run Status","Status"],value=>value.toLowerCase().replace(/\s+/g,"_"));
 set("finalNotes",["Run Final Notes","Final Notes"]);
 const weightLine=getAnyLineValue(source,["Starting Weight","Weight Before Dehydration","Fresh Weight"]);
 const weights=unitValues(weightLine);
 if(weights.pounds)next.weightPounds=weights.pounds;
 if(weights.ounces)next.weightOunces=weights.ounces;
 return next;
};

const buildPayload=form=>({
 item:form.item,
 dehydrator:form.dehydrator||null,
 fuelSource:form.fuelSource||null,
 dehydrationMethods:{
  dehydratorMethod:{
   suggestedTemperatureRange:form.dehydrationMethods.dehydratorMethod.suggestedTemperatureRange,
   estimatedDuration:form.dehydrationMethods.dehydratorMethod.estimatedDuration,
   estimatedEnergyConsumption:{
    min:cleanDecimal(form.dehydrationMethods.dehydratorMethod.estimatedEnergyConsumption.min)||"0",
    max:cleanDecimal(form.dehydrationMethods.dehydratorMethod.estimatedEnergyConsumption.max)||"0"
   },
   estimatedEnergyCost:{
    min:cleanDecimal(form.dehydrationMethods.dehydratorMethod.estimatedEnergyCost.min)||"0",
    max:cleanDecimal(form.dehydrationMethods.dehydratorMethod.estimatedEnergyCost.max)||"0"
   },
   estimatedEndDateTime:{
    minDate:form.dehydrationMethods.dehydratorMethod.estimatedEndDateTime.minDate||null,
    minTime:form.dehydrationMethods.dehydratorMethod.estimatedEndDateTime.minTime||"",
    maxDate:form.dehydrationMethods.dehydratorMethod.estimatedEndDateTime.maxDate||null,
    maxTime:form.dehydrationMethods.dehydratorMethod.estimatedEndDateTime.maxTime||""
   }
  },
  ovenMethod:{
   temperature:form.dehydrationMethods.ovenMethod.temperature,
   estimatedTime:form.dehydrationMethods.ovenMethod.estimatedTime,
   energyConsumption:{
    min:cleanDecimal(form.dehydrationMethods.ovenMethod.energyConsumption.min)||"0",
    max:cleanDecimal(form.dehydrationMethods.ovenMethod.energyConsumption.max)||"0"
   },
   estimatedEnergyCost:{
    min:cleanDecimal(form.dehydrationMethods.ovenMethod.estimatedEnergyCost.min)||"0",
    max:cleanDecimal(form.dehydrationMethods.ovenMethod.estimatedEnergyCost.max)||"0"
   },
   estimatedEndDateTime:{
    minDate:form.dehydrationMethods.ovenMethod.estimatedEndDateTime.minDate||null,
    minTime:form.dehydrationMethods.ovenMethod.estimatedEndDateTime.minTime||"",
    maxDate:form.dehydrationMethods.ovenMethod.estimatedEndDateTime.maxDate||null,
    maxTime:form.dehydrationMethods.ovenMethod.estimatedEndDateTime.maxTime||""
   }
  }
 },
 predictedWeightAfterDehydration:{
  expectedWeightLoss:cleanDecimal(form.predictedWeightAfterDehydration.expectedWeightLoss)||"0",
  predictedWeight:cleanDecimal(form.predictedWeightAfterDehydration.predictedWeight)||"0",
  predictedFinalWeight:{
   min:cleanDecimal(form.predictedWeightAfterDehydration.predictedFinalWeight.min)||"0",
   max:cleanDecimal(form.predictedWeightAfterDehydration.predictedFinalWeight.max)||"0"
  }
 },
 totalCostSummary:form.totalCostSummary.map(row=>({
  method:row.method,
  wattage:cleanDecimal(row.wattage)||"0",
  energyUsedKwh:cleanDecimal(row.energyUsedKwh)||"0",
  energyCost:cleanDecimal(row.energyCost)||"0",
  totalCost:cleanDecimal(row.totalCost)||"0"
 })),
 marketPriceCalculationDefaults:{
  beforeDehydration:{
   pounds:{
    weight:cleanDecimal(form.marketPriceCalculationDefaults.beforeDehydration.pounds.weight)||"0",
    pricePerUnit:cleanDecimal(form.marketPriceCalculationDefaults.beforeDehydration.pounds.pricePerUnit)||"0",
    totalPrice:cleanDecimal(form.marketPriceCalculationDefaults.beforeDehydration.pounds.totalPrice)||"0"
   },
   ounces:{
    weight:cleanDecimal(form.marketPriceCalculationDefaults.beforeDehydration.ounces.weight)||"0",
    pricePerUnit:cleanDecimal(form.marketPriceCalculationDefaults.beforeDehydration.ounces.pricePerUnit)||"0",
    totalPrice:cleanDecimal(form.marketPriceCalculationDefaults.beforeDehydration.ounces.totalPrice)||"0"
   },
   grams:{
    weight:cleanDecimal(form.marketPriceCalculationDefaults.beforeDehydration.grams.weight)||"0",
    pricePerUnit:cleanDecimal(form.marketPriceCalculationDefaults.beforeDehydration.grams.pricePerUnit)||"0",
    totalPrice:cleanDecimal(form.marketPriceCalculationDefaults.beforeDehydration.grams.totalPrice)||"0"
   }
  },
  afterDehydration:{
   pounds:{
    weightAfterDehydration:cleanDecimal(form.marketPriceCalculationDefaults.afterDehydration.pounds.weightAfterDehydration)||"0",
    pricePerUnit:cleanDecimal(form.marketPriceCalculationDefaults.afterDehydration.pounds.pricePerUnit)||"0",
    totalPrice:cleanDecimal(form.marketPriceCalculationDefaults.afterDehydration.pounds.totalPrice)||"0"
   },
   ounces:{
    weightAfterDehydration:cleanDecimal(form.marketPriceCalculationDefaults.afterDehydration.ounces.weightAfterDehydration)||"0",
    pricePerUnit:cleanDecimal(form.marketPriceCalculationDefaults.afterDehydration.ounces.pricePerUnit)||"0",
    totalPrice:cleanDecimal(form.marketPriceCalculationDefaults.afterDehydration.ounces.totalPrice)||"0"
   },
   grams:{
    weightAfterDehydration:cleanDecimal(form.marketPriceCalculationDefaults.afterDehydration.grams.weightAfterDehydration)||"0",
    pricePerUnit:cleanDecimal(form.marketPriceCalculationDefaults.afterDehydration.grams.pricePerUnit)||"0",
    totalPrice:cleanDecimal(form.marketPriceCalculationDefaults.afterDehydration.grams.totalPrice)||"0"
   }
  },
  costPerUnitCalculation:{
   totalCost:cleanDecimal(form.marketPriceCalculationDefaults.costPerUnitCalculation.totalCost)||"0",
   totalWeight:cleanDecimal(form.marketPriceCalculationDefaults.costPerUnitCalculation.totalWeight)||"0",
   costPerUnit:cleanDecimal(form.marketPriceCalculationDefaults.costPerUnitCalculation.costPerUnit)||"0"
  }
 },
 defaultSchedules:{
  dehydratorSchedule:form.defaultSchedules.dehydratorSchedule.map(row=>({
   date:row.date||null,
   time:row.time||"",
   action:row.action||""
  })),
  ovenSchedule:form.defaultSchedules.ovenSchedule.map(row=>({
   date:row.date||null,
   time:row.time||"",
   action:row.action||""
  }))
 },
 preparationInstructions:form.preparationInstructions.map(row=>({
  step:Number(row.step||0),
  date:row.date||null,
  time:row.time||"",
  action:row.action||"",
  preparation:row.preparation||""
 })),
 storageInstructions:{
  instructions:form.storageInstructions.instructions.filter(Boolean),
  shelfLife:{
   roomTemperature:form.storageInstructions.shelfLife.roomTemperature,
   freezer:form.storageInstructions.shelfLife.freezer,
   powder:form.storageInstructions.shelfLife.powder
  }
 },
 rehydrationInstructions:form.rehydrationInstructions,
 equivalentsTable:form.equivalentsTable.map(row=>({
  freshAmount:row.freshAmount,
  driedEquivalent:row.driedEquivalent,
  equivalentLb:cleanDecimal(row.equivalentLb)||"0",
  equivalentOz:cleanDecimal(row.equivalentOz)||"0",
  equivalentGrams:cleanDecimal(row.equivalentGrams)||"0"
 })),
 finalNotes:form.finalNotes,
 status:form.status,
 isActive:!!form.isActive
});

function DehydrationSetupForm({show,onHide,setupId,runId,onSaved,runMode=false})
{
 const params=useParams();
 const navigate=useNavigate();
 const routeSetupId=params.id||"";
 const effectiveShow=show!==undefined?show:true;
 const effectiveSetupId=setupId||routeSetupId;
 const isRouteMode=show===undefined;
 const [form,setForm]=useState(createDefaultForm());
 const [loading,setLoading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [dehydrators,setDehydrators]=useState([]);
 const [fuelSources,setFuelSources]=useState([]);
 const [electricityRates,setElectricityRates]=useState([]);
 const [runDetails,setRunDetails]=useState({batchName:"",method:"dehydrator",trayCount:"",actualTemperature:"",weightPounds:"",weightOunces:"",ingredientCost:"",costPerPound:"",costPerOunce:"",actualFinalWeight:"",startDate:new Date().toISOString().slice(0,10),startTime:"",estimatedEndDate:"",endDate:"",endTime:"",electricityRate:"",status:"planned",finalNotes:"",intervalNotes:[createIntervalNote()],dehydratorSchedule:[createScheduleItem()],ovenSchedule:[createScheduleItem()]});
 const [runTab,setRunTab]=useState(()=>runMode?"defaults":"import");
 const [defaultTab,setDefaultTab]=useState("setup");
 const [actualTab,setActualTab]=useState("batch");
 const [importText,setImportText]=useState("");

 const modalTitle=useMemo(()=>runMode?(runId?"Edit Dehydration Run":"Add Dehydration Run"):(effectiveSetupId?"Edit Dehydration Project":"New Dehydration Project"),[effectiveSetupId,runId,runMode]);

 useEffect(()=>{
  if(!effectiveShow)
  {
   return;
  }

  const loadOptions=async()=>{
   try
   {
    const [dehydratorRes,fuelRes,electricityRateRes]=await Promise.all([
     fetch("/api/dehydrators"),
     fetch("/api/fuel-sources"),
     fetch("/api/electricity-rates")
    ]);

    const dehydratorData=await dehydratorRes.json();
    const fuelData=await fuelRes.json();
    const electricityRateData=await electricityRateRes.json();

    if(dehydratorRes.ok)
    {
     setDehydrators(Array.isArray(dehydratorData?.data)?dehydratorData.data:Array.isArray(dehydratorData)?dehydratorData:[]);
    }

    if(fuelRes.ok)
    {
     setFuelSources(Array.isArray(fuelData?.fuelSources)?fuelData.fuelSources:Array.isArray(fuelData?.data)?fuelData.data:Array.isArray(fuelData)?fuelData:[]);
    }
    if(electricityRateRes.ok){
     const rates=Array.isArray(electricityRateData)?electricityRateData:[];
     setElectricityRates(rates);
     setRunDetails(prev=>({...prev,electricityRate:prev.electricityRate||rates[0]?._id||""}));
    }
   }
   catch(err)
   {
    console.error("Failed to load setup modal options",err);
   }
  };

  loadOptions();
 },[effectiveShow]);

 useEffect(()=>{
  if(!effectiveShow)
  {
   return;
  }

  const loadSetup=async()=>{
   setError("");
   setSuccess("");

   if(!effectiveSetupId)
   {
    setForm(createDefaultForm());
    setRunDetails({batchName:"",method:"dehydrator",trayCount:"",actualTemperature:"",weightPounds:"",weightOunces:"",ingredientCost:"",costPerPound:"",costPerOunce:"",actualFinalWeight:"",startDate:new Date().toISOString().slice(0,10),startTime:"",estimatedEndDate:"",endDate:"",endTime:"",electricityRate:"",status:"planned",finalNotes:"",intervalNotes:[createIntervalNote()],dehydratorSchedule:[createScheduleItem()],ovenSchedule:[createScheduleItem()]});
    return;
   }

   setLoading(true);

   try
   {
    const res=await fetch(`/api/dehydration-setups/${effectiveSetupId}`);
    const data=await res.json();

    if(!res.ok)
    {
     throw new Error(data?.message||"Failed to load dehydration setup");
    }

    const setup=normalizeSetup(data?.data||data);
    setForm(setup);
    if(runMode&&!runId){
     const today=new Date().toISOString().slice(0,10);
     setRunDetails(prev=>({...prev,batchName:setup.item,startDate:today}));
    }
   }
   catch(err)
   {
    setError(err.message||"Failed to load dehydration setup");
   }
   finally
   {
    setLoading(false);
   }
  };

  loadSetup();
 },[effectiveShow,effectiveSetupId,runId,runMode]);

 useEffect(()=>{
  if(!effectiveShow||!runMode||!runId)return;
  const loadRun=async()=>{
   try{
    const response=await fetch(`/api/dehydration-processes/${runId}`);
    const run=await response.json();
    if(!response.ok)throw new Error(run?.message||"Failed to load dehydration run");
    setRunDetails({
     batchName:run.batchName||"",
     method:run.method||"dehydrator",
     trayCount:run.operationalData?.trayCount??"",
     actualTemperature:run.operationalData?.actualTemperature||"",
     weightPounds:run.itemDetails?.weightBeforeDehydration?.pounds??"",
     weightOunces:run.itemDetails?.weightBeforeDehydration?.ounces??"",
     ingredientCost:run.itemDetails?.totalCost?.$numberDecimal??run.itemDetails?.totalCost??"",
     costPerPound:run.itemDetails?.costPerPound?.$numberDecimal??run.itemDetails?.costPerPound??"",
     costPerOunce:run.itemDetails?.costPerOunce?.$numberDecimal??run.itemDetails?.costPerOunce??"",
     actualFinalWeight:run.actualResults?.actualFinalWeight?.$numberDecimal??run.actualResults?.actualFinalWeight??"",
     startDate:toInputDate(run.operationalData?.startDate||run.itemDetails?.startDate),
     startTime:run.operationalData?.startTime||"",
     estimatedEndDate:toInputDate(run.itemDetails?.estimatedEndDate),
     endDate:toInputDate(run.operationalData?.endDate||run.actualResults?.completedDate),
     endTime:run.operationalData?.endTime||"",
     electricityRate:run.electricityRate?._id??run.electricityRate??"",
     status:run.status||"planned",
     finalNotes:run.finalNotes||"",
     intervalNotes:Array.isArray(run.operationalData?.intervalNotes)&&run.operationalData.intervalNotes.length?run.operationalData.intervalNotes.map(note=>({date:toInputDate(note.date),time:note.time||"",note:note.note||""})):[createIntervalNote()],
     dehydratorSchedule:Array.isArray(run.processSchedules?.dehydratorSchedule)&&run.processSchedules.dehydratorSchedule.length?run.processSchedules.dehydratorSchedule.map(normalizeScheduleItem):[createScheduleItem()],
     ovenSchedule:Array.isArray(run.processSchedules?.ovenSchedule)&&run.processSchedules.ovenSchedule.length?run.processSchedules.ovenSchedule.map(normalizeScheduleItem):[createScheduleItem()]
    });
   }catch(err){setError(err.message||"Failed to load dehydration run");}
  };
  loadRun();
 },[effectiveShow,runId,runMode]);

 useEffect(()=>{
  if(!effectiveShow||runMode||!effectiveSetupId)return;
  const loadProjectRun=async()=>{
   try{
    const response=await fetch("/api/dehydration-processes");
    const rows=await response.json();
    if(!response.ok||!Array.isArray(rows))return;
    const run=rows.find(row=>String(row.dehydrationSetup?._id??row.dehydrationSetup)===String(effectiveSetupId));
    if(!run)return;
    setRunDetails(prev=>({...prev,batchName:run.batchName||"",method:run.method||"dehydrator",trayCount:run.operationalData?.trayCount??"",actualTemperature:run.operationalData?.actualTemperature||"",weightPounds:run.itemDetails?.weightBeforeDehydration?.pounds??"",weightOunces:run.itemDetails?.weightBeforeDehydration?.ounces??"",ingredientCost:run.itemDetails?.totalCost?.$numberDecimal??run.itemDetails?.totalCost??"",costPerPound:run.itemDetails?.costPerPound?.$numberDecimal??run.itemDetails?.costPerPound??"",costPerOunce:run.itemDetails?.costPerOunce?.$numberDecimal??run.itemDetails?.costPerOunce??"",actualFinalWeight:run.actualResults?.actualFinalWeight?.$numberDecimal??run.actualResults?.actualFinalWeight??"",startDate:toInputDate(run.operationalData?.startDate||run.itemDetails?.startDate),startTime:run.operationalData?.startTime||"",estimatedEndDate:toInputDate(run.itemDetails?.estimatedEndDate),endDate:toInputDate(run.operationalData?.endDate||run.actualResults?.completedDate),endTime:run.operationalData?.endTime||"",electricityRate:run.electricityRate?._id??run.electricityRate??"",status:run.status||"planned",finalNotes:run.finalNotes||"",intervalNotes:Array.isArray(run.operationalData?.intervalNotes)&&run.operationalData.intervalNotes.length?run.operationalData.intervalNotes.map(note=>({date:toInputDate(note.date),time:note.time||"",note:note.note||""})):[createIntervalNote()],dehydratorSchedule:Array.isArray(run.processSchedules?.dehydratorSchedule)&&run.processSchedules.dehydratorSchedule.length?run.processSchedules.dehydratorSchedule.map(normalizeScheduleItem):[createScheduleItem()],ovenSchedule:Array.isArray(run.processSchedules?.ovenSchedule)&&run.processSchedules.ovenSchedule.length?run.processSchedules.ovenSchedule.map(normalizeScheduleItem):[createScheduleItem()]}));
   }catch(err){console.error("Failed to load project run information",err);}
  };
  loadProjectRun();
 },[effectiveShow,effectiveSetupId,runMode]);

 const handleClose=()=>{
  if(onHide){
   onHide();
   return;
  }

  navigate("/dehydration/projects");
 };

 const updateField=(path,value)=>{
  setForm(prev=>{
   const next={...prev};
   let ref=next;

   for(let i=0;i<path.length-1;i+=1)
   {
    ref[path[i]]=Array.isArray(ref[path[i]])?[...ref[path[i]]]:{...ref[path[i]]};
    ref=ref[path[i]];
   }

   ref[path[path.length-1]]=value;

   if(path[0]==="status"){
    next.isActive=value!=="inactive";
   }

   if(path[0]==="isActive"){
    next.status=value?"active":"inactive";
   }

   return next;
  });
 };

 const updateArrayItem=(path,index,field,value)=>{
  setForm(prev=>{
   const next={...prev};
   let ref=next;

   for(let i=0;i<path.length;i+=1)
   {
    ref[path[i]]=Array.isArray(ref[path[i]])?[...ref[path[i]]]:{...ref[path[i]]};
    ref=ref[path[i]];
   }

   ref[index]={...ref[index],[field]:value};
   if(path[0]==="equivalentsTable"&&field==="freshAmount"){
    const generated=equivalentWeights(value,next);
    if(generated) ref[index]={...ref[index],...generated};
   }
   return next;
  });
 };

 const addArrayItem=(path,factory)=>{
  setForm(prev=>{
   const next={...prev};
   let ref=next;

   for(let i=0;i<path.length;i+=1)
   {
    ref[path[i]]=Array.isArray(ref[path[i]])?[...ref[path[i]]]:{...ref[path[i]]};
    ref=ref[path[i]];
   }

   ref.push(factory());
   return next;
  });
 };

 const removeArrayItem=(path,index,fallbackFactory)=>{
  setForm(prev=>{
   const next={...prev};
   let ref=next;

   for(let i=0;i<path.length;i+=1)
   {
    ref[path[i]]=Array.isArray(ref[path[i]])?[...ref[path[i]]]:{...ref[path[i]]};
    ref=ref[path[i]];
   }

   const filtered=ref.filter((_,i)=>i!==index);

   while(ref.length)
   {
    ref.pop();
   }

   if(filtered.length)
   {
    filtered.forEach(item=>ref.push(item));
   }
   else
   {
    ref.push(fallbackFactory());
   }

   return next;
  });
 };

 const updateStorageInstruction=(index,value)=>{
  setForm(prev=>({
   ...prev,
   storageInstructions:{
    ...prev.storageInstructions,
    instructions:prev.storageInstructions.instructions.map((item,i)=>i===index?value:item)
   }
  }));
 };

 const addStorageInstruction=()=>{
  setForm(prev=>({
   ...prev,
   storageInstructions:{
    ...prev.storageInstructions,
    instructions:[...prev.storageInstructions.instructions,""]
   }
  }));
 };

 const removeStorageInstruction=index=>{
  setForm(prev=>{
   const next=prev.storageInstructions.instructions.filter((_,i)=>i!==index);
   return{
    ...prev,
    storageInstructions:{
     ...prev.storageInstructions,
     instructions:next.length?next:[""]
    }
   };
  });
 };

 const handleImportText=()=>{
  if(!importText.trim()){
   setError("Paste dehydration setup text before importing.");
   return;
  }

 setForm(prev=>applyTemplateImport(prev,importText,dehydrators,fuelSources));
  setRunDetails(prev=>applyRunImport(prev,importText));
  setError("");
  setSuccess("Imported setup fields into the form. Review the values before saving.");
 };

 const handleSubmit=async e=>{
  e.preventDefault();
  setSaving(true);
  setError("");
  setSuccess("");

  try
  {
   const payload=buildPayload(form);
   if(runMode){
    const startDateTime=new Date(`${runDetails.startDate}T${runDetails.startTime||"00:00"}`);
    const before=payload.marketPriceCalculationDefaults.beforeDehydration;
    const processPayload={
     dehydrationSetup:effectiveSetupId,
     batchName:runDetails.batchName||form.item,
     method:runDetails.method,
     electricityRate:runDetails.electricityRate||null,
     setupSnapshot:payload,
     operationalData:{
      trayCount:Number(runDetails.trayCount||0),
      actualTemperature:runDetails.actualTemperature,
      startDate:startDateTime.toISOString(),
      startTime:runDetails.startTime||"00:00",
      endDate:runDetails.endDate?new Date(`${runDetails.endDate}T${runDetails.endTime||"00:00"}`).toISOString():null,
      endTime:runDetails.endTime,
      intervalNotes:runDetails.intervalNotes.filter(row=>row.note.trim()).map(row=>({date:row.date?new Date(`${row.date}T${row.time||"00:00"}`).toISOString():null,time:row.time,note:row.note}))
     },
     itemDetails:{
      weightBeforeDehydration:{pounds:Number(runDetails.weightPounds||before.pounds.weight||0),ounces:Number(runDetails.weightOunces||before.ounces.weight||0)},
      totalCost:Number(runDetails.ingredientCost||before.pounds.totalPrice||before.ounces.totalPrice||before.grams.totalPrice||0),
      costPerPound:Number(runDetails.costPerPound||before.pounds.pricePerUnit||0),
      costPerOunce:Number(runDetails.costPerOunce||before.ounces.pricePerUnit||0),
      startDate:startDateTime.toISOString(),
      estimatedEndDate:runDetails.estimatedEndDate?new Date(`${runDetails.estimatedEndDate}T00:00:00`).toISOString():null
     },
     processSchedules:{
      dehydratorSchedule:runDetails.dehydratorSchedule.filter(row=>row.date||row.time||row.action).map(row=>({date:row.date||null,time:row.time||"",action:row.action||""})),
      ovenSchedule:runDetails.ovenSchedule.filter(row=>row.date||row.time||row.action).map(row=>({date:row.date||null,time:row.time||"",action:row.action||""}))
     },
     actualResults:{actualFinalWeight:Number(runDetails.actualFinalWeight||0),completedDate:runDetails.endDate?new Date(`${runDetails.endDate}T${runDetails.endTime||"00:00"}`).toISOString():null},
     finalNotes:runDetails.finalNotes,
     status:runDetails.endDate?"completed":runDetails.status
    };
    const processUrl=runId?`/api/dehydration-processes/${runId}`:"/api/dehydration-processes";
    const processRes=await fetch(processUrl,{method:runId?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(processPayload)});
    const processData=await processRes.json();
    if(!processRes.ok) throw new Error(processData?.message||"Failed to save dehydration run");
    setSuccess(runId?"Run updated":"Run created");
    if(onSaved) onSaved(processData);
    return;
   }
   const url=effectiveSetupId?`/api/dehydration-setups/${effectiveSetupId}`:"/api/dehydration-setups";
   const method=effectiveSetupId?"PUT":"POST";

   const res=await fetch(url,{
    method,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json();

   if(!res.ok)
   {
    throw new Error(data?.message||"Failed to save dehydration setup");
   }

   setSuccess(effectiveSetupId?"Setup updated":"Setup created");

   if(onSaved)
   {
    onSaved(data?.data||data);
   }

   if(!effectiveSetupId)
   {
    setForm(createDefaultForm());
   }

   if(isRouteMode){
    navigate("/dehydration/projects");
   }
  }
  catch(err)
  {
   setError(err.message||"Failed to save dehydration setup");
  }
  finally
  {
   setSaving(false);
  }
 };

 return(
  <Modal show={effectiveShow} onHide={handleClose} size="lg" centered scrollable backdrop="static" keyboard={false} dialogClassName="dehydration-setup-modal" contentClassName="dehydration-setup-modal-content">
   <Modal.Header closeButton className="setup-modal-header">
    <div className="w-100 d-flex justify-content-between align-items-center flex-wrap gap-2">
     <Modal.Title>{modalTitle}</Modal.Title>
     <Button type="submit" form="dehydration-setup-form" className="setup-save-btn" disabled={saving||loading}>
      {saving
       ?(runMode?(runId?"Updating Run...":"Saving Run..."):(effectiveSetupId?"Updating Setup...":"Saving Setup..."))
       :(runMode?(runId?"Update Run":"Save Run"):(effectiveSetupId?"Update Setup":"Save Setup"))}
     </Button>
    </div>
   </Modal.Header>

   <Modal.Body className="setup-modal-body">
    {loading?
     <div className="setup-loading-wrap">
      <Spinner animation="border"/>
     </div>
    :
     <Form id="dehydration-setup-form" onSubmit={handleSubmit} className="setup-form-shell">
      {error?<Alert variant="danger" className="mb-3">{error}</Alert>:null}
      {success?<Alert variant="success" className="mb-3">{success}</Alert>:null}

      <div className="setup-run-tab-list" role="tablist" aria-label="Dehydration form sections">
       {!runMode?<button type="button" role="tab" aria-selected={runTab==="import"} className={`setup-run-tab${runTab==="import"?" is-active":""}`} onClick={()=>setRunTab("import")}>Import Text</button>:null}
       <button type="button" role="tab" aria-selected={runTab==="defaults"} className={`setup-run-tab${runTab==="defaults"?" is-active":""}`} onClick={()=>setRunTab("defaults")}>Default Setup</button>
       <button type="button" role="tab" aria-selected={runTab==="actual"} className={`setup-run-tab${runTab==="actual"?" is-active":""}`} onClick={()=>setRunTab("actual")}>Actual Inputs</button>
      </div>

      {runTab==="actual"?
       <div className="setup-section-card">
        <h3 className="setup-section-title">Actual Inputs</h3>
        <div className="setup-default-tab-list" role="tablist" aria-label="Actual input sections">
         <button type="button" role="tab" aria-selected={actualTab==="batch"} className={`setup-default-tab${actualTab==="batch"?" is-active":""}`} onClick={()=>setActualTab("batch")}>Batch</button>
         <button type="button" role="tab" aria-selected={actualTab==="timing"} className={`setup-default-tab${actualTab==="timing"?" is-active":""}`} onClick={()=>setActualTab("timing")}>Timing &amp; Notes</button>
         <button type="button" role="tab" aria-selected={actualTab==="schedules"} className={`setup-default-tab${actualTab==="schedules"?" is-active":""}`} onClick={()=>setActualTab("schedules")}>Actual Schedules</button>
        </div>
        <div className="setup-default-fields">
        <Row className="g-3">
         {actualTab==="batch"?<>
         <Col md={3}>
          <Form.Group controlId="dehydrationRunMethod" className="actual-input-field">
           <Form.Label>Method</Form.Label>
           <Form.Select value={runDetails.method} onChange={e=>setRunDetails(prev=>({...prev,method:e.target.value}))}>
            <option value="dehydrator">Dehydrator</option>
            <option value="oven">Oven</option>
           </Form.Select>
          </Form.Group>
         </Col>
         </>:null}
         {actualTab==="timing"?<>
         <Col md={3}>
          <Form.Group controlId="dehydrationRunStartDate" className="actual-input-field">
           <Form.Label>Start Date</Form.Label>
           <Form.Control type="date" value={runDetails.startDate} onChange={e=>setRunDetails(prev=>({...prev,startDate:e.target.value}))} required={runMode}/>
          </Form.Group>
         </Col>
         </>:null}
         {actualTab==="timing"?
         <Col md={3}>
          <Form.Group controlId="dehydrationRunStartTime" className="actual-input-field">
           <Form.Label>Start Time</Form.Label>
           <Form.Control type="time" value={runDetails.startTime} onChange={e=>setRunDetails(prev=>({...prev,startTime:e.target.value}))}/>
          </Form.Group>
         </Col>
         :null}
         {actualTab==="batch"?
         <Col md={3}>
          <Form.Group controlId="dehydrationRunStatus" className="actual-input-field">
           <Form.Label>Status</Form.Label>
           <Form.Select value={runDetails.status} onChange={e=>setRunDetails(prev=>({...prev,status:e.target.value}))}>
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
           </Form.Select>
          </Form.Group>
         </Col>
         :null}
         {actualTab==="batch"?
         <Col md={3}>
          <Form.Group controlId="dehydrationRunTrayCount" className="actual-input-field">
           <Form.Label>Number of Trays</Form.Label>
           <Form.Control type="number" min="0" step="1" value={runDetails.trayCount} onChange={e=>setRunDetails(prev=>({...prev,trayCount:e.target.value}))}/>
          </Form.Group>
         </Col>
         :null}
         {actualTab==="batch"?
         <Col md={3}>
          <Form.Group controlId="dehydrationRunActualTemperature" className="actual-input-field">
           <Form.Label>Actual Temperature</Form.Label>
           <Form.Control value={runDetails.actualTemperature} onChange={e=>setRunDetails(prev=>({...prev,actualTemperature:e.target.value}))} placeholder="Example: 135°F"/>
          </Form.Group>
         </Col>
         :null}
         {actualTab==="timing"?<>
         <Col md={3}>
          <Form.Group controlId="dehydrationRunEndDate" className="actual-input-field">
           <Form.Label>End Date</Form.Label>
           <Form.Control type="date" value={runDetails.endDate} onChange={e=>setRunDetails(prev=>({...prev,endDate:e.target.value}))}/>
          </Form.Group>
         </Col>
         <Col md={3}>
          <Form.Group controlId="dehydrationRunEndTime" className="actual-input-field">
           <Form.Label>End Time</Form.Label>
           <Form.Control type="time" value={runDetails.endTime} onChange={e=>setRunDetails(prev=>({...prev,endTime:e.target.value}))}/>
          </Form.Group>
         </Col>
         </>:null}
         {actualTab==="timing"?
         <Col md={3}>
          <Form.Group controlId="dehydrationRunActualFinalWeight" className="actual-input-field">
           <Form.Label>Actual Final Weight (lb)</Form.Label>
           <Form.Control type="number" min="0" step="any" value={runDetails.actualFinalWeight} onChange={e=>setRunDetails(prev=>({...prev,actualFinalWeight:e.target.value}))}/>
          </Form.Group>
         </Col>
         :null}
         {actualTab==="batch"?
         <Col md={6}>
          <Form.Group controlId="dehydrationRunElectricityBill" className="actual-input-field">
           <Form.Label>Electricity Bill Used for Costing</Form.Label>
           <Form.Select value={runDetails.electricityRate} onChange={e=>setRunDetails(prev=>({...prev,electricityRate:e.target.value}))} required={runMode&&(runDetails.method==="dehydrator"||!form.fuelSource)}>
            <option value="">Select electricity bill</option>
            {electricityRates.map(rate=><option key={rate._id} value={rate._id}>{new Date(rate.billingStartDate).toLocaleDateString()} – {new Date(rate.billingEndDate).toLocaleDateString()} · {rate.electricityAccount?.nickname||rate.electricityAccount?.provider||"Electricity"}</option>)}
           </Form.Select>
          </Form.Group>
         </Col>
         :null}
         {actualTab==="timing"?<>
         <Col xs={12}>
          <div className="setup-section-header">
           <h4 className="setup-subsection-title mb-0">Timed Notes</h4>
           <Button type="button" className="setup-add-btn" onClick={()=>setRunDetails(prev=>({...prev,intervalNotes:[...prev.intervalNotes,createIntervalNote()]}))}>Add Note</Button>
          </div>
          {runDetails.intervalNotes.map((row,index)=><Row className="g-2 mt-1" key={`run-note-${index}`}>
           <Col md={3}><Form.Control type="date" aria-label={`Note ${index+1} date`} value={row.date} onChange={e=>setRunDetails(prev=>({...prev,intervalNotes:prev.intervalNotes.map((item,i)=>i===index?{...item,date:e.target.value}:item)}))}/></Col>
           <Col md={2}><Form.Control type="time" aria-label={`Note ${index+1} time`} value={row.time} onChange={e=>setRunDetails(prev=>({...prev,intervalNotes:prev.intervalNotes.map((item,i)=>i===index?{...item,time:e.target.value}:item)}))}/></Col>
           <Col md={6}><Form.Control aria-label={`Note ${index+1}`} value={row.note} onChange={e=>setRunDetails(prev=>({...prev,intervalNotes:prev.intervalNotes.map((item,i)=>i===index?{...item,note:e.target.value}:item)}))} placeholder="Observation or action"/></Col>
           <Col md={1}><Button type="button" variant="outline-danger" onClick={()=>setRunDetails(prev=>({...prev,intervalNotes:prev.intervalNotes.length>1?prev.intervalNotes.filter((_,i)=>i!==index):[createIntervalNote()]}))}>×</Button></Col>
          </Row>)}
         </Col>
         <Col xs={12}>
          <Form.Group controlId="dehydrationRunFinalNotes">
           <Form.Label>Final Notes</Form.Label>
           <Form.Control as="textarea" rows={3} value={runDetails.finalNotes} onChange={e=>setRunDetails(prev=>({...prev,finalNotes:e.target.value}))}/>
          </Form.Group>
         </Col>
         </>:null}
         {actualTab==="schedules"?<Col xs={12}>
          {[{key:"dehydratorSchedule",title:"Dehydrator Schedule"},{key:"ovenSchedule",title:"Oven Schedule"}].map(section=><div className="setup-inline-block" key={section.key}>
           <div className="setup-section-header">
            <h4 className="setup-subsection-title mb-0">{section.title}</h4>
            <Button type="button" className="setup-add-btn" onClick={()=>setRunDetails(prev=>({...prev,[section.key]:[...prev[section.key],createScheduleItem()]}))}>Add Schedule Item</Button>
           </div>
           {runDetails[section.key].map((row,index)=><Row className="g-2 mt-1" key={`${section.key}-${index}`}>
            <Col md={3}><Form.Group><Form.Label>Date</Form.Label><Form.Control type="date" value={row.date} onChange={e=>setRunDetails(prev=>({...prev,[section.key]:prev[section.key].map((item,i)=>i===index?{...item,date:e.target.value}:item)}))}/></Form.Group></Col>
            <Col md={2}><Form.Group><Form.Label>Time</Form.Label><Form.Control type="time" value={row.time} onChange={e=>setRunDetails(prev=>({...prev,[section.key]:prev[section.key].map((item,i)=>i===index?{...item,time:e.target.value}:item)}))}/></Form.Group></Col>
            <Col md={6}><Form.Group><Form.Label>Action</Form.Label><Form.Control value={row.action} onChange={e=>setRunDetails(prev=>({...prev,[section.key]:prev[section.key].map((item,i)=>i===index?{...item,action:e.target.value}:item)}))}/></Form.Group></Col>
            <Col md={1} className="d-flex align-items-end"><Button type="button" variant="outline-danger" onClick={()=>setRunDetails(prev=>({...prev,[section.key]:prev[section.key].length>1?prev[section.key].filter((_,i)=>i!==index):[createScheduleItem()]}))}>×</Button></Col>
           </Row>)}
          </div>)}
         </Col>:null}
        </Row>
        </div>
       </div>
      :null}

      {runTab==="import"?<div className="setup-section-card setup-import-card">
       <div className="setup-section-header">
        <h3 className="setup-section-title mb-0">Import Setup Text</h3>
        <Button type="button" className="setup-add-btn" onClick={handleImportText}>Parse Into Form</Button>
       </div>
       <Form.Group className="setup-field setup-import-field">
        <Form.Label>Paste Template</Form.Label>
        <Form.Control
         as="textarea"
         rows={5}
         value={importText}
         onChange={e=>setImportText(e.target.value)}
         placeholder="Item:&#10;Weight Before Dehydration: lb.: oz:&#10;Market Price:"
        />
       </Form.Group>
      </div>:null}

      {runTab==="defaults"?<>
      <div className="setup-default-tab-list" role="tablist" aria-label="Default setup sections">
       <button type="button" role="tab" aria-selected={defaultTab==="setup"} className={`setup-default-tab${defaultTab==="setup"?" is-active":""}`} onClick={()=>setDefaultTab("setup")}>Setup</button>
       <button type="button" role="tab" aria-selected={defaultTab==="methods"} className={`setup-default-tab${defaultTab==="methods"?" is-active":""}`} onClick={()=>setDefaultTab("methods")}>Methods</button>
       <button type="button" role="tab" aria-selected={defaultTab==="costs"} className={`setup-default-tab${defaultTab==="costs"?" is-active":""}`} onClick={()=>setDefaultTab("costs")}>Weights &amp; Costs</button>
       <button type="button" role="tab" aria-selected={defaultTab==="instructions"} className={`setup-default-tab${defaultTab==="instructions"?" is-active":""}`} onClick={()=>setDefaultTab("instructions")}>Instructions &amp; Schedules</button>
      </div>

      <fieldset disabled={runMode} className="setup-default-fields">
      {defaultTab==="setup"?
      <div className="setup-section-card">
       <h3 className="setup-section-title">Setup Details</h3>

       <Row className="g-3">
        <Col md={4}>
         <Form.Group className="setup-field">
          <Form.Label>Item</Form.Label>
          <Form.Control value={form.item} onChange={e=>updateField(["item"],e.target.value)} required/>
         </Form.Group>
        </Col>

          <Col md={4}>
           <Form.Group className="setup-field">
            <Form.Label>Dehydrator</Form.Label>
            <SortedSelect
             value={form.dehydrator}
             onChange={e=>updateField(["dehydrator"],e.target.value)}
             options={dehydrators}
             getValue={item=>item._id}
             getLabel={item=>item.name||item.title||item.model||item._id}
             placeholder="Select dehydrator"
            />
           </Form.Group>
          </Col>
 
          <Col md={4}>
           <Form.Group className="setup-field">
            <Form.Label>Fuel Source</Form.Label>
            <SortedSelect
             value={form.fuelSource}
             onChange={e=>updateField(["fuelSource"],e.target.value)}
             options={fuelSources}
             getValue={item=>item._id}
             getLabel={item=>item.name||item.title||item.type||item._id}
             placeholder="Select fuel source"
            />
           </Form.Group>
          </Col>

        {!runMode?<Col md={3}>
         <Form.Group className="setup-check-field">
          <Form.Label>Status</Form.Label>
          <Form.Select value={form.status} onChange={e=>updateField(["status"],e.target.value)}>
           <option value="active">Active</option>
           <option value="inactive">Inactive</option>
           <option value="paused">Paused</option>
           <option value="completed">Completed</option>
           <option value="cancelled">Cancelled</option>
          </Form.Select>
         </Form.Group>
        </Col>:null}
       </Row>
      </div>
      :null}

      {defaultTab==="methods"?<>
      <div className="setup-section-card">
       <h3 className="setup-section-title">Dehydrator Method</h3>

       <Row className="g-3">
        <Col md={6}>
         <Form.Group className="setup-field">
          <Form.Label>Suggested Temperature Range</Form.Label>
          <Form.Control value={form.dehydrationMethods.dehydratorMethod.suggestedTemperatureRange} onChange={e=>updateField(["dehydrationMethods","dehydratorMethod","suggestedTemperatureRange"],e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group className="setup-field">
          <Form.Label>Estimated Duration</Form.Label>
          <Form.Control value={form.dehydrationMethods.dehydratorMethod.estimatedDuration} onChange={e=>updateField(["dehydrationMethods","dehydratorMethod","estimatedDuration"],e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={6}>
         <Row className="g-3">
          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Estimated Energy Consumption Min</Form.Label>
            <Form.Control type="number" step="any" value={form.dehydrationMethods.dehydratorMethod.estimatedEnergyConsumption.min} onChange={e=>updateField(["dehydrationMethods","dehydratorMethod","estimatedEnergyConsumption","min"],e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Estimated Energy Consumption Max</Form.Label>
            <Form.Control type="number" step="any" value={form.dehydrationMethods.dehydratorMethod.estimatedEnergyConsumption.max} onChange={e=>updateField(["dehydrationMethods","dehydratorMethod","estimatedEnergyConsumption","max"],e.target.value)}/>
           </Form.Group>
          </Col>
         </Row>
        </Col>

        <Col md={6}>
         <Row className="g-3">
          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Estimated Energy Cost Min</Form.Label>
            <Form.Control type="number" step="any" value={form.dehydrationMethods.dehydratorMethod.estimatedEnergyCost.min} onChange={e=>updateField(["dehydrationMethods","dehydratorMethod","estimatedEnergyCost","min"],e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Estimated Energy Cost Max</Form.Label>
            <Form.Control type="number" step="any" value={form.dehydrationMethods.dehydratorMethod.estimatedEnergyCost.max} onChange={e=>updateField(["dehydrationMethods","dehydratorMethod","estimatedEnergyCost","max"],e.target.value)}/>
           </Form.Group>
          </Col>
         </Row>
        </Col>

        <Col md={6}>
         <Row className="g-3">
          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Estimated End Min Date</Form.Label>
            <Form.Control type="date" value={form.dehydrationMethods.dehydratorMethod.estimatedEndDateTime.minDate} onChange={e=>updateField(["dehydrationMethods","dehydratorMethod","estimatedEndDateTime","minDate"],e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Estimated End Min Time</Form.Label>
            <Form.Control type="time" value={form.dehydrationMethods.dehydratorMethod.estimatedEndDateTime.minTime} onChange={e=>updateField(["dehydrationMethods","dehydratorMethod","estimatedEndDateTime","minTime"],e.target.value)}/>
           </Form.Group>
          </Col>
         </Row>
        </Col>

        <Col md={6}>
         <Row className="g-3">
          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Estimated End Max Date</Form.Label>
            <Form.Control type="date" value={form.dehydrationMethods.dehydratorMethod.estimatedEndDateTime.maxDate} onChange={e=>updateField(["dehydrationMethods","dehydratorMethod","estimatedEndDateTime","maxDate"],e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Estimated End Max Time</Form.Label>
            <Form.Control type="time" value={form.dehydrationMethods.dehydratorMethod.estimatedEndDateTime.maxTime} onChange={e=>updateField(["dehydrationMethods","dehydratorMethod","estimatedEndDateTime","maxTime"],e.target.value)}/>
           </Form.Group>
          </Col>
         </Row>
        </Col>
      </Row>
      </div>

      <div className="setup-section-card">
       <h3 className="setup-section-title">Oven Method</h3>

       <Row className="g-3">
        <Col md={6}>
         <Form.Group className="setup-field">
          <Form.Label>Temperature</Form.Label>
          <Form.Control value={form.dehydrationMethods.ovenMethod.temperature} onChange={e=>updateField(["dehydrationMethods","ovenMethod","temperature"],e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group className="setup-field">
          <Form.Label>Estimated Time</Form.Label>
          <Form.Control value={form.dehydrationMethods.ovenMethod.estimatedTime} onChange={e=>updateField(["dehydrationMethods","ovenMethod","estimatedTime"],e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={6}>
         <Row className="g-3">
          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Energy Consumption Min</Form.Label>
            <Form.Control type="number" step="any" value={form.dehydrationMethods.ovenMethod.energyConsumption.min} onChange={e=>updateField(["dehydrationMethods","ovenMethod","energyConsumption","min"],e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Energy Consumption Max</Form.Label>
            <Form.Control type="number" step="any" value={form.dehydrationMethods.ovenMethod.energyConsumption.max} onChange={e=>updateField(["dehydrationMethods","ovenMethod","energyConsumption","max"],e.target.value)}/>
           </Form.Group>
          </Col>
         </Row>
        </Col>

        <Col md={6}>
         <Row className="g-3">
          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Estimated Energy Cost Min</Form.Label>
            <Form.Control type="number" step="any" value={form.dehydrationMethods.ovenMethod.estimatedEnergyCost.min} onChange={e=>updateField(["dehydrationMethods","ovenMethod","estimatedEnergyCost","min"],e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Estimated Energy Cost Max</Form.Label>
            <Form.Control type="number" step="any" value={form.dehydrationMethods.ovenMethod.estimatedEnergyCost.max} onChange={e=>updateField(["dehydrationMethods","ovenMethod","estimatedEnergyCost","max"],e.target.value)}/>
           </Form.Group>
          </Col>
         </Row>
        </Col>

        <Col md={6}>
         <Row className="g-3">
          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Estimated End Min Date</Form.Label>
            <Form.Control type="date" value={form.dehydrationMethods.ovenMethod.estimatedEndDateTime.minDate} onChange={e=>updateField(["dehydrationMethods","ovenMethod","estimatedEndDateTime","minDate"],e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Estimated End Min Time</Form.Label>
            <Form.Control type="time" value={form.dehydrationMethods.ovenMethod.estimatedEndDateTime.minTime} onChange={e=>updateField(["dehydrationMethods","ovenMethod","estimatedEndDateTime","minTime"],e.target.value)}/>
           </Form.Group>
          </Col>
         </Row>
        </Col>

        <Col md={6}>
         <Row className="g-3">
          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Estimated End Max Date</Form.Label>
            <Form.Control type="date" value={form.dehydrationMethods.ovenMethod.estimatedEndDateTime.maxDate} onChange={e=>updateField(["dehydrationMethods","ovenMethod","estimatedEndDateTime","maxDate"],e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Estimated End Max Time</Form.Label>
            <Form.Control type="time" value={form.dehydrationMethods.ovenMethod.estimatedEndDateTime.maxTime} onChange={e=>updateField(["dehydrationMethods","ovenMethod","estimatedEndDateTime","maxTime"],e.target.value)}/>
           </Form.Group>
          </Col>
         </Row>
        </Col>
       </Row>
      </div>
      </>:null}

      {defaultTab==="costs"?<>
      <div className="setup-section-card">
       <h3 className="setup-section-title">Predicted Weight After Dehydration</h3>

       <Row className="g-3">
        <Col md={4}>
         <Form.Group className="setup-field">
          <Form.Label>Expected Weight Loss</Form.Label>
          <Form.Control type="number" step="any" value={form.predictedWeightAfterDehydration.expectedWeightLoss} onChange={e=>updateField(["predictedWeightAfterDehydration","expectedWeightLoss"],e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={4}>
         <Form.Group className="setup-field">
          <Form.Label>Predicted Weight</Form.Label>
          <Form.Control type="number" step="any" value={form.predictedWeightAfterDehydration.predictedWeight} onChange={e=>updateField(["predictedWeightAfterDehydration","predictedWeight"],e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={4}>
         <Row className="g-3">
          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Predicted Final Weight Min</Form.Label>
            <Form.Control type="number" step="any" value={form.predictedWeightAfterDehydration.predictedFinalWeight.min} onChange={e=>updateField(["predictedWeightAfterDehydration","predictedFinalWeight","min"],e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={6}>
           <Form.Group className="setup-field">
            <Form.Label>Predicted Final Weight Max</Form.Label>
            <Form.Control type="number" step="any" value={form.predictedWeightAfterDehydration.predictedFinalWeight.max} onChange={e=>updateField(["predictedWeightAfterDehydration","predictedFinalWeight","max"],e.target.value)}/>
           </Form.Group>
          </Col>
         </Row>
        </Col>
       </Row>
      </div>

      <div className="setup-section-card">
       <h3 className="setup-section-title">Market Price Calculation - Before Dehydration</h3>

       {["pounds","ounces","grams"].map(unit=>(
        <Row className="g-3 mb-2" key={unit}>
         <Col md={2}>
          <Form.Group className="setup-field">
           <Form.Label>{unit.charAt(0).toUpperCase()+unit.slice(1)}</Form.Label>
           <Form.Control value={unit==="pounds"?"lb":unit==="ounces"?"oz":"g"} readOnly/>
          </Form.Group>
         </Col>

         <Col md={3}>
          <Form.Group className="setup-field">
           <Form.Label>Weight</Form.Label>
           <Form.Control type="number" step="any" value={form.marketPriceCalculationDefaults.beforeDehydration[unit].weight} onChange={e=>updateField(["marketPriceCalculationDefaults","beforeDehydration",unit,"weight"],e.target.value)}/>
          </Form.Group>
         </Col>

         <Col md={3}>
          <Form.Group className="setup-field">
           <Form.Label>Price Per Unit</Form.Label>
           <Form.Control type="number" step="any" value={form.marketPriceCalculationDefaults.beforeDehydration[unit].pricePerUnit} onChange={e=>updateField(["marketPriceCalculationDefaults","beforeDehydration",unit,"pricePerUnit"],e.target.value)}/>
          </Form.Group>
         </Col>

         <Col md={4}>
          <Form.Group className="setup-field">
           <Form.Label>Total Price</Form.Label>
           <Form.Control type="number" step="any" value={form.marketPriceCalculationDefaults.beforeDehydration[unit].totalPrice} onChange={e=>updateField(["marketPriceCalculationDefaults","beforeDehydration",unit,"totalPrice"],e.target.value)}/>
          </Form.Group>
         </Col>
        </Row>
       ))}
      </div>
      </>:null}

      {defaultTab==="costs"?<>
      <div className="setup-section-card">
       <h3 className="setup-section-title">Market Price Calculation - After Dehydration</h3>

       {["pounds","ounces","grams"].map(unit=>(
        <Row className="g-3 mb-2" key={unit}>
         <Col md={2}>
          <Form.Group className="setup-field">
           <Form.Label>{unit.charAt(0).toUpperCase()+unit.slice(1)}</Form.Label>
           <Form.Control value={unit==="pounds"?"lb":unit==="ounces"?"oz":"g"} readOnly/>
          </Form.Group>
         </Col>

         <Col md={3}>
          <Form.Group className="setup-field">
           <Form.Label>Weight After</Form.Label>
           <Form.Control type="number" step="any" value={form.marketPriceCalculationDefaults.afterDehydration[unit].weightAfterDehydration} onChange={e=>updateField(["marketPriceCalculationDefaults","afterDehydration",unit,"weightAfterDehydration"],e.target.value)}/>
          </Form.Group>
         </Col>

         <Col md={3}>
          <Form.Group className="setup-field">
           <Form.Label>Price Per Unit</Form.Label>
           <Form.Control type="number" step="any" value={form.marketPriceCalculationDefaults.afterDehydration[unit].pricePerUnit} onChange={e=>updateField(["marketPriceCalculationDefaults","afterDehydration",unit,"pricePerUnit"],e.target.value)}/>
          </Form.Group>
         </Col>

         <Col md={4}>
          <Form.Group className="setup-field">
           <Form.Label>Total Price</Form.Label>
           <Form.Control type="number" step="any" value={form.marketPriceCalculationDefaults.afterDehydration[unit].totalPrice} onChange={e=>updateField(["marketPriceCalculationDefaults","afterDehydration",unit,"totalPrice"],e.target.value)}/>
          </Form.Group>
         </Col>
        </Row>
       ))}
      </div>

      <div className="setup-section-card">
       <h3 className="setup-section-title">Cost Per Unit Calculation</h3>

       <Row className="g-3">
        <Col md={4}>
         <Form.Group className="setup-field">
          <Form.Label>Total Cost</Form.Label>
          <Form.Control type="number" step="any" value={form.marketPriceCalculationDefaults.costPerUnitCalculation.totalCost} onChange={e=>updateField(["marketPriceCalculationDefaults","costPerUnitCalculation","totalCost"],e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={4}>
         <Form.Group className="setup-field">
          <Form.Label>Total Weight</Form.Label>
          <Form.Control type="number" step="any" value={form.marketPriceCalculationDefaults.costPerUnitCalculation.totalWeight} onChange={e=>updateField(["marketPriceCalculationDefaults","costPerUnitCalculation","totalWeight"],e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={4}>
         <Form.Group className="setup-field">
          <Form.Label>Cost Per Unit</Form.Label>
          <Form.Control type="number" step="any" value={form.marketPriceCalculationDefaults.costPerUnitCalculation.costPerUnit} onChange={e=>updateField(["marketPriceCalculationDefaults","costPerUnitCalculation","costPerUnit"],e.target.value)}/>
         </Form.Group>
        </Col>
       </Row>
      </div>

      </>:null}

      {defaultTab==="instructions"?<>
      <div className="setup-section-card">
       <div className="setup-section-header">
        <h3 className="setup-section-title mb-0">Preparation Instructions</h3>
         {!runMode?<Button type="button" className="setup-add-btn" onClick={()=>addArrayItem(["preparationInstructions"],createPrepItem)}>Add Step</Button>:null}
       </div>

       {form.preparationInstructions.map((row,index)=>(
        <div className="setup-inline-block" key={`prep-${index}`}>
         <Row className="g-3">
          <Col md={2}>
           <Form.Group className="setup-field">
            <Form.Label>Step</Form.Label>
            <Form.Control type="number" value={row.step} onChange={e=>updateArrayItem(["preparationInstructions"],index,"step",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={2}>
           <Form.Group className="setup-field">
            <Form.Label>Date</Form.Label>
            <Form.Control type="date" value={row.date} onChange={e=>updateArrayItem(["preparationInstructions"],index,"date",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={2}>
           <Form.Group className="setup-field">
            <Form.Label>Time</Form.Label>
            <Form.Control type="time" value={row.time} onChange={e=>updateArrayItem(["preparationInstructions"],index,"time",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={4}>
           <Form.Group className="setup-field">
            <Form.Label>Action</Form.Label>
            <Form.Control value={row.action} onChange={e=>updateArrayItem(["preparationInstructions"],index,"action",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={2} className="d-flex align-items-end">
           {!runMode?<Button type="button" variant="outline-danger" size="sm" className="setup-remove-btn" onClick={()=>removeArrayItem(["preparationInstructions"],index,createPrepItem)}>Remove</Button>:null}
          </Col>

          <Col md={12}>
           <Form.Group className="setup-field">
            <Form.Label>Preparation</Form.Label>
            <Form.Control as="textarea" rows={2} value={row.preparation} onChange={e=>updateArrayItem(["preparationInstructions"],index,"preparation",e.target.value)}/>
           </Form.Group>
          </Col>
         </Row>
        </div>
       ))}
      </div>

      <div className="setup-section-card">
       <div className="setup-section-header">
        <h3 className="setup-section-title mb-0">Default Dehydrator Schedule</h3>
          {!runMode?<Button type="button" className="setup-add-btn" onClick={()=>addArrayItem(["defaultSchedules","dehydratorSchedule"],createScheduleItem)}>Add Schedule Item</Button>:null}
       </div>

       {form.defaultSchedules.dehydratorSchedule.map((row,index)=>(
        <div className="setup-inline-block" key={`dehydrator-schedule-${index}`}>
         <Row className="g-3">
          <Col md={3}>
           <Form.Group className="setup-field">
            <Form.Label>Date</Form.Label>
            <Form.Control type="date" value={row.date} onChange={e=>updateArrayItem(["defaultSchedules","dehydratorSchedule"],index,"date",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={3}>
           <Form.Group className="setup-field">
            <Form.Label>Time</Form.Label>
            <Form.Control type="time" value={row.time} onChange={e=>updateArrayItem(["defaultSchedules","dehydratorSchedule"],index,"time",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={4}>
           <Form.Group className="setup-field">
            <Form.Label>Action</Form.Label>
            <Form.Control value={row.action} onChange={e=>updateArrayItem(["defaultSchedules","dehydratorSchedule"],index,"action",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={2} className="d-flex align-items-end">
             {!runMode?<Button type="button" variant="outline-danger" size="sm" className="setup-remove-btn" onClick={()=>removeArrayItem(["defaultSchedules","dehydratorSchedule"],index,createScheduleItem)}>Remove</Button>:null}
          </Col>
         </Row>
        </div>
       ))}
      </div>

      <div className="setup-section-card">
       <div className="setup-section-header">
        <h3 className="setup-section-title mb-0">Default Oven Schedule</h3>
          {!runMode?<Button type="button" className="setup-add-btn" onClick={()=>addArrayItem(["defaultSchedules","ovenSchedule"],createScheduleItem)}>Add Schedule Item</Button>:null}
       </div>

       {form.defaultSchedules.ovenSchedule.map((row,index)=>(
        <div className="setup-inline-block" key={`oven-schedule-${index}`}>
         <Row className="g-3">
          <Col md={3}>
           <Form.Group className="setup-field">
            <Form.Label>Date</Form.Label>
            <Form.Control type="date" value={row.date} onChange={e=>updateArrayItem(["defaultSchedules","ovenSchedule"],index,"date",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={3}>
           <Form.Group className="setup-field">
            <Form.Label>Time</Form.Label>
            <Form.Control type="time" value={row.time} onChange={e=>updateArrayItem(["defaultSchedules","ovenSchedule"],index,"time",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={4}>
           <Form.Group className="setup-field">
            <Form.Label>Action</Form.Label>
            <Form.Control value={row.action} onChange={e=>updateArrayItem(["defaultSchedules","ovenSchedule"],index,"action",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={2} className="d-flex align-items-end">
             {!runMode?<Button type="button" variant="outline-danger" size="sm" className="setup-remove-btn" onClick={()=>removeArrayItem(["defaultSchedules","ovenSchedule"],index,createScheduleItem)}>Remove</Button>:null}
          </Col>
         </Row>
        </div>
       ))}
      </div>

      <div className="setup-section-card">
       <h3 className="setup-section-title">Storage Instructions</h3>

       {form.storageInstructions.instructions.map((row,index)=>(
        <Row className="g-3 mb-2" key={`storage-${index}`}>
         <Col md={10}>
          <Form.Group className="setup-field">
           <Form.Label>{`Instruction ${index+1}`}</Form.Label>
           <Form.Control value={row} onChange={e=>updateStorageInstruction(index,e.target.value)}/>
          </Form.Group>
         </Col>

         <Col md={2} className="d-flex align-items-end">
             {!runMode?<Button type="button" variant="outline-danger" size="sm" className="setup-remove-btn" onClick={()=>removeStorageInstruction(index)}>Remove</Button>:null}
         </Col>
        </Row>
       ))}

       <div className="mb-3">
        {!runMode?<Button type="button" className="setup-add-btn" onClick={addStorageInstruction}>Add Storage Instruction</Button>:null}
       </div>

       <Row className="g-3">
        <Col md={4}>
         <Form.Group className="setup-field">
          <Form.Label>Room Temperature</Form.Label>
          <Form.Control value={form.storageInstructions.shelfLife.roomTemperature} onChange={e=>updateField(["storageInstructions","shelfLife","roomTemperature"],e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={4}>
         <Form.Group className="setup-field">
          <Form.Label>Freezer</Form.Label>
          <Form.Control value={form.storageInstructions.shelfLife.freezer} onChange={e=>updateField(["storageInstructions","shelfLife","freezer"],e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={4}>
         <Form.Group className="setup-field">
          <Form.Label>Powder</Form.Label>
          <Form.Control value={form.storageInstructions.shelfLife.powder} onChange={e=>updateField(["storageInstructions","shelfLife","powder"],e.target.value)}/>
         </Form.Group>
        </Col>
       </Row>
      </div>

      <div className="setup-section-card">
       <div className="setup-section-header">
        <h3 className="setup-section-title mb-0">Equivalents Table</h3>
         {!runMode?<Button type="button" className="setup-add-btn" onClick={()=>addArrayItem(["equivalentsTable"],createEquivalentRow)}>Add Equivalent</Button>:null}
       </div>

       {form.equivalentsTable.map((row,index)=>(
        <div className="setup-inline-block" key={`equivalent-${index}`}>
         <Row className="g-3">
          <Col md={4}>
           <Form.Group className="setup-field">
            <Form.Label>Fresh Amount</Form.Label>
            <Form.Control value={row.freshAmount} onChange={e=>updateArrayItem(["equivalentsTable"],index,"freshAmount",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={4}>
           <Form.Group className="setup-field">
            <Form.Label>Dried Amount</Form.Label>
            <Form.Control value={row.driedEquivalent} onChange={e=>updateArrayItem(["equivalentsTable"],index,"driedEquivalent",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={4} className="d-flex align-items-end">
           {!runMode?<Button type="button" variant="outline-danger" size="sm" className="setup-remove-btn" onClick={()=>removeArrayItem(["equivalentsTable"],index,createEquivalentRow)}>Remove</Button>:null}
          </Col>

          <Col md={4}>
           <Form.Group className="setup-field">
            <Form.Label>Equivalent lb</Form.Label>
            <Form.Control type="number" step="any" value={row.equivalentLb} onChange={e=>updateArrayItem(["equivalentsTable"],index,"equivalentLb",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={4}>
           <Form.Group className="setup-field">
            <Form.Label>Equivalent oz</Form.Label>
            <Form.Control type="number" step="any" value={row.equivalentOz} onChange={e=>updateArrayItem(["equivalentsTable"],index,"equivalentOz",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={4}>
           <Form.Group className="setup-field">
            <Form.Label>Equivalent grams</Form.Label>
            <Form.Control type="number" step="any" value={row.equivalentGrams} onChange={e=>updateArrayItem(["equivalentsTable"],index,"equivalentGrams",e.target.value)}/>
           </Form.Group>
          </Col>
         </Row>
        </div>
       ))}
      </div>

      </>:null}

      {defaultTab==="costs"?
      <div className="setup-section-card">
       <h3 className="setup-section-title">Total Cost Summary</h3>

       {form.totalCostSummary.map((row,index)=>(
        <div className="setup-inline-block" key={`total-cost-summary-${index}`}>
         <Row className="g-3">
          <Col md={3}>
           <Form.Group className="setup-field">
            <Form.Label>Method</Form.Label>
            <Form.Control value={row.method} onChange={e=>updateArrayItem(["totalCostSummary"],index,"method",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={2}>
           <Form.Group className="setup-field">
            <Form.Label>Wattage</Form.Label>
            <Form.Control type="number" step="any" value={row.wattage} onChange={e=>updateArrayItem(["totalCostSummary"],index,"wattage",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={2}>
           <Form.Group className="setup-field">
            <Form.Label>Energy Used Kwh</Form.Label>
            <Form.Control type="number" step="any" value={row.energyUsedKwh} onChange={e=>updateArrayItem(["totalCostSummary"],index,"energyUsedKwh",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={2}>
           <Form.Group className="setup-field">
            <Form.Label>Energy Cost</Form.Label>
            <Form.Control type="number" step="any" value={row.energyCost} onChange={e=>updateArrayItem(["totalCostSummary"],index,"energyCost",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={2}>
           <Form.Group className="setup-field">
            <Form.Label>Total Cost</Form.Label>
            <Form.Control type="number" step="any" value={row.totalCost} onChange={e=>updateArrayItem(["totalCostSummary"],index,"totalCost",e.target.value)}/>
           </Form.Group>
          </Col>

          <Col md={1} className="d-flex align-items-end">
           {!runMode?<Button type="button" variant="outline-danger" size="sm" className="setup-remove-btn" onClick={()=>removeArrayItem(["totalCostSummary"],index,createCostSummaryRow)}>Remove</Button>:null}
          </Col>
         </Row>
        </div>
       ))}

       {!runMode?<Button type="button" className="setup-add-btn" onClick={()=>addArrayItem(["totalCostSummary"],createCostSummaryRow)}>Add Cost Row</Button>:null}
      </div>
      :null}

      {defaultTab==="instructions"?
      <div className="setup-section-card">
       <h3 className="setup-section-title">Other Details</h3>

       <Row className="g-3">
        <Col md={6}>
         <Form.Group className="setup-field">
          <Form.Label>Rehydration Instructions</Form.Label>
          <Form.Control as="textarea" rows={4} value={form.rehydrationInstructions} onChange={e=>updateField(["rehydrationInstructions"],e.target.value)}/>
         </Form.Group>
        </Col>

        <Col md={6}>
         <Form.Group className="setup-field">
          <Form.Label>Final Notes</Form.Label>
          <Form.Control as="textarea" rows={4} value={form.finalNotes} onChange={e=>updateField(["finalNotes"],e.target.value)}/>
         </Form.Group>
        </Col>
       </Row>
      </div>
      :null}
      </fieldset>
      </>:null}
     </Form>
    }
   </Modal.Body>
  </Modal>
 );
}

export default DehydrationSetupForm;
