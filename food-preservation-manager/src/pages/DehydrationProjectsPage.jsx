import {useMemo,useState,useEffect} from "react";
import {Row,Col,ListGroup,Button,Badge,Table,Modal,Spinner,Alert} from "react-bootstrap";
import DehydrationSetupForm from "./forms/DehydrationSetupForm.jsx";
import "../styles/dehyrdationSetup.css";

const formatMoney=value=>{
 const n=parseFloat(value?.$numberDecimal??value??0);
 return `$${Number.isNaN(n)?0:n.toFixed(2)}`;
};

const formatUnitMoney=value=>{
 const n=parseFloat(value?.$numberDecimal??value??0);
 if(Number.isNaN(n)) return "$0.00";
 if(Math.abs(n)>=1) return `$${n.toFixed(2)}`;
 return `$${n.toFixed(4).replace(/0+$/,"").replace(/\.$/,"")}`;
};

const formatRange=(min,max,suffix="")=>{
 const low=formatNumber(min);
 const high=formatNumber(max);
 const unit=suffix?` ${suffix}`:"";
 if(low===high) return `${low.toFixed(2)}${unit}`;
 return `${low.toFixed(2)}–${high.toFixed(2)}${unit}`;
};

const formatMoneyRange=(min,max)=>{
 const low=formatNumber(min);
 const high=formatNumber(max);
 if(low===high) return formatMoney(low);
 return `${formatMoney(low)}–${formatMoney(high)}`;
};

const formatNumber=value=>{
 const n=parseFloat(value?.$numberDecimal??value??0);
 return Number.isNaN(n)?0:n;
};

const formatDate=value=>{
 if(!value) return "";
 const date=new Date(value);
 if(Number.isNaN(date.getTime())) return "";
 return new Intl.DateTimeFormat("en-US",{
  month:"2-digit",
  day:"2-digit",
  year:"numeric",
  timeZone:"UTC"
 }).format(date);
};

const getMethodLabel=setup=>{
 const dehydratorMethod=setup?.dehydrationMethods?.dehydratorMethod;
 const ovenMethod=setup?.dehydrationMethods?.ovenMethod;

 const hasDehydratorMethod=
  dehydratorMethod?.suggestedTemperatureRange||
  dehydratorMethod?.estimatedDuration||
  formatNumber(dehydratorMethod?.estimatedEnergyConsumption?.min)>0||
  formatNumber(dehydratorMethod?.estimatedEnergyConsumption?.max)>0||
  formatNumber(dehydratorMethod?.estimatedEnergyCost?.min)>0||
  formatNumber(dehydratorMethod?.estimatedEnergyCost?.max)>0;

 const hasOvenMethod=
  ovenMethod?.temperature||
  ovenMethod?.estimatedTime||
  formatNumber(ovenMethod?.energyConsumption?.min)>0||
  formatNumber(ovenMethod?.energyConsumption?.max)>0||
  formatNumber(ovenMethod?.estimatedEnergyCost?.min)>0||
  formatNumber(ovenMethod?.estimatedEnergyCost?.max)>0;

 if(hasDehydratorMethod&&!hasOvenMethod) return "Dehydrator";
 if(hasOvenMethod&&!hasDehydratorMethod) return "Oven";
 if(hasDehydratorMethod&&hasOvenMethod) return "Dehydrator / Oven";
 return "Not Set";
};

const getSetupStatus=setup=>{
 const rawStatus=String(setup?.status||setup?.projectStatus||"").trim().toLowerCase();

 if(["active","inactive","paused","completed","cancelled"].includes(rawStatus)){
  return rawStatus;
 }

 if(setup?.isActive===true) return "active";
 if(setup?.isActive===false) return "inactive";
 return "inactive";
};

const getStatusVariant=status=>{
 if(status==="active") return "success";
 if(status==="paused") return "warning";
 if(status==="completed") return "primary";
 if(status==="cancelled") return "danger";
 return "secondary";
};

const STATUS_OPTIONS=["active","inactive","paused","completed","cancelled"];

const getProcessDate=setup=>{
 const rawDates=[
  ...(setup?.defaultSchedules?.dehydratorSchedule||[]).map(row=>row?.date),
  ...(setup?.defaultSchedules?.ovenSchedule||[]).map(row=>row?.date),
  setup?.dehydrationMethods?.dehydratorMethod?.estimatedEndDateTime?.minDate,
  setup?.dehydrationMethods?.dehydratorMethod?.estimatedEndDateTime?.maxDate,
  setup?.dehydrationMethods?.ovenMethod?.estimatedEndDateTime?.minDate,
  setup?.dehydrationMethods?.ovenMethod?.estimatedEndDateTime?.maxDate
 ];
 const dates=rawDates.filter(Boolean).map(value=>new Date(value)).filter(date=>!Number.isNaN(date.getTime()));
 if(dates.length) return new Date(Math.min(...dates.map(date=>date.getTime())));
 const created=new Date(setup?.createdAt);
 return Number.isNaN(created.getTime())?null:created;
};

const getRateValue=(rate,path)=>path.reduce((value,key)=>value?.[key],rate);

const getElectricityRateForDate=(rates,date)=>{
 if(!date) return null;
 const timestamp=date.getTime();
 const matches=rates.filter(rate=>{
  const start=new Date(rate?.billingStartDate).getTime();
  const end=new Date(rate?.billingEndDate).getTime();
  return !Number.isNaN(start)&&!Number.isNaN(end)&&timestamp>=start&&timestamp<=end;
 });
 const candidates=matches.length?matches:rates.filter(rate=>{
  const start=new Date(rate?.billingStartDate).getTime();
  return !Number.isNaN(start)&&start<=timestamp;
 });
 return [...candidates].sort((a,b)=>new Date(b.billingStartDate)-new Date(a.billingStartDate))[0]||null;
};

const getLatestRate=rates=>[...rates].sort((a,b)=>new Date(b.billingStartDate)-new Date(a.billingStartDate))[0]||null;

const getTotalElectricityRate=rate=>{
 if(!rate) return 0;
 const storedRate=formatNumber(getRateValue(rate,["supplyCharges","ratePerKwh"]))
  +formatNumber(getRateValue(rate,["deliveryCharges","deliveryRate"]))
  +formatNumber(getRateValue(rate,["deliveryCharges","systemBenefitCharge"]));
 return storedRate>1?storedRate/100:storedRate;
};

const getRatePeriodLabel=rate=>{
 if(!rate) return "No electricity rate found";
 const start=new Date(rate.billingStartDate);
 if(Number.isNaN(start.getTime())) return "Electricity rate period unavailable";
 return start.toLocaleDateString(undefined,{month:"long",year:"numeric"});
};

const getFuelRateForDate=(rates,fuelSource,date)=>{
 if(!fuelSource||!date) return null;
 const timestamp=date.getTime();
 const matches=rates.filter(rate=>{
  const account=rate?.fuelAccount;
  const sameType=account?.fuelType===fuelSource?.fuelType;
  const sameUnit=rate?.usageUnit===fuelSource?.unit;
  const start=new Date(rate?.billingStartDate).getTime();
  const end=new Date(rate?.billingEndDate).getTime();
  return sameType&&sameUnit&&!Number.isNaN(start)&&!Number.isNaN(end)&&timestamp>=start&&timestamp<=end;
 });
 return [...matches].sort((a,b)=>new Date(b.billingStartDate)-new Date(a.billingStartDate))[0]||null;
};

const getLatestFuelRate=(rates,fuelSource)=>[...rates].filter(rate=>{
 const account=rate?.fuelAccount;
 return account?.fuelType===fuelSource?.fuelType&&rate?.usageUnit===fuelSource?.unit;
}).sort((a,b)=>new Date(b.billingStartDate)-new Date(a.billingStartDate))[0]||null;

const kwhPerFuelUnit={
 "natural_gas:therms":29.3001,
 "natural_gas:ccf":30.4,
 "natural_gas:mcf":303.9,
 "propane:gallons":26.8,
 "propane:liters":7.08,
 "propane:kg":13.84,
 "propane:lb":6.28,
 "heating_oil:gallons":40.7,
 "diesel:gallons":40.7,
 "kerosene:gallons":39.7
};

const convertKwhToFuelUnit=(kwh,fuelType,unit)=>{
 const divisor=kwhPerFuelUnit[`${fuelType}:${unit}`];
 return divisor?kwh/divisor:kwh;
};

const getActualProcessCost=(setup,process,electricityRates,fuelRates)=>{
 if(!process||process?.status!=="completed") return null;
 const start=new Date(process?.itemDetails?.startDate);
 const completed=new Date(process?.actualResults?.completedDate);
 const finalWeightLb=formatNumber(process?.actualResults?.actualFinalWeight);
 const ingredientCost=formatNumber(process?.itemDetails?.totalCost);
 if(Number.isNaN(start.getTime())||Number.isNaN(completed.getTime())||completed<=start||finalWeightLb<=0) return null;
 const dehydratorUsed=(process?.processSchedules?.dehydratorSchedule||[]).length>0;
 const method=dehydratorUsed?"Dehydrator":"Oven";
 const summary=(setup?.totalCostSummary||[]).find(row=>String(row?.method).toLowerCase()===method.toLowerCase());
 const wattage=formatNumber(summary?.wattage);
 if(wattage<=0) return null;
 const runtimeHours=(completed.getTime()-start.getTime())/3600000;
 const energyKwh=(wattage/1000)*runtimeHours;
 const fuelSource=setup?.fuelSource&&typeof setup.fuelSource==="object"?setup.fuelSource:null;
 const usesFuel=method==="Oven"&&fuelSource&&fuelSource.fuelType!=="electricity";
 let usage=energyKwh;
 let usageUnit="kWh";
 let rate=0;
 let ratePeriod="";
 if(usesFuel){
  usageUnit=fuelSource.unit||"unit";
  usage=convertKwhToFuelUnit(energyKwh,fuelSource.fuelType,usageUnit);
  const historicalFuelRate=getFuelRateForDate(fuelRates,fuelSource,completed);
  rate=historicalFuelRate
   ?formatNumber(historicalFuelRate.ratePerUnit)+formatNumber(historicalFuelRate.deliveryRate)+formatNumber(historicalFuelRate.systemBenefitCharge)
   :formatNumber(fuelSource.defaultRatePerUnit);
  ratePeriod=historicalFuelRate?getRatePeriodLabel(historicalFuelRate):"Fuel source default rate";
 }else{
  const historicalElectricityRate=process?.electricityRate&&typeof process.electricityRate==="object"
   ?process.electricityRate
   :getElectricityRateForDate(electricityRates,completed);
  rate=getTotalElectricityRate(historicalElectricityRate);
  ratePeriod=getRatePeriodLabel(historicalElectricityRate);
 }
 if(rate<=0) return null;
 const energyCost=usage*rate;
 const totalCost=ingredientCost+energyCost;
 return{
  lb:totalCost/finalWeightLb,
  oz:totalCost/(finalWeightLb*16),
  g:totalCost/(finalWeightLb*453.59237),
  ingredientCost,
  energyCost,
  energyUsed:usage,
  energyUnit:usageUnit,
  finalWeightLb,
  method,
  rate,
  ratePeriod
 };
};

const mapSetupToBatch=(setup,electricityRates,fuelRates,processes)=>{
 const before=setup?.marketPriceCalculationDefaults?.beforeDehydration||{};
 const after=setup?.marketPriceCalculationDefaults?.afterDehydration||{};
 const dehydratorMethod=setup?.dehydrationMethods?.dehydratorMethod||{};
 const ovenMethod=setup?.dehydrationMethods?.ovenMethod||{};
 const status=getSetupStatus(setup);
 const processDate=getProcessDate(setup);
 const currentElectricityRate=getLatestRate(electricityRates);
 const currentTotalElectricityRate=getTotalElectricityRate(currentElectricityRate);
 const fuelSource=setup?.fuelSource&&typeof setup.fuelSource==="object"?setup.fuelSource:null;
 const fuelRate=getLatestFuelRate(fuelRates,fuelSource);
 const defaultFuelRate=formatNumber(fuelSource?.defaultRatePerUnit);
 const selectedFuelRate=fuelRate
  ?formatNumber(fuelRate?.ratePerUnit)+formatNumber(fuelRate?.deliveryRate)+formatNumber(fuelRate?.systemBenefitCharge)
  :defaultFuelRate;
 const dehydratorConsumptionMin=formatNumber(dehydratorMethod?.estimatedEnergyConsumption?.min);
 const dehydratorConsumptionMax=formatNumber(dehydratorMethod?.estimatedEnergyConsumption?.max);
 const ovenConsumptionMin=formatNumber(ovenMethod?.energyConsumption?.min);
 const ovenConsumptionMax=formatNumber(ovenMethod?.energyConsumption?.max);
 const ovenUsesFuel=!!fuelSource&&fuelSource.fuelType!=="electricity";
 const ovenUnit=ovenUsesFuel?(fuelSource.unit||"unit"):"kWh";
 const ovenUsageMin=ovenUsesFuel?convertKwhToFuelUnit(ovenConsumptionMin,fuelSource.fuelType,ovenUnit):ovenConsumptionMin;
 const ovenUsageMax=ovenUsesFuel?convertKwhToFuelUnit(ovenConsumptionMax,fuelSource.fuelType,ovenUnit):ovenConsumptionMax;
 const ovenRate=ovenUsesFuel?selectedFuelRate:currentTotalElectricityRate;
 const process=processes.find(row=>String(row?.dehydrationSetup?._id??row?.dehydrationSetup)===String(setup?._id))||null;
 const processRuns=processes.filter(row=>String(row?.dehydrationSetup?._id??row?.dehydrationSetup)===String(setup?._id));

 return{
  id:setup?._id,
  name:setup?.item||"Untitled Setup",
  processCode:setup?._id?.slice(-6)?.toUpperCase()||"",
  startDate:formatDate(process?.itemDetails?.startDate||processDate),
  method:getMethodLabel(setup),
  status,
  initialCost:{
   lb:before?.pounds?.pricePerUnit,
   oz:before?.ounces?.pricePerUnit,
   g:before?.grams?.pricePerUnit
  },
  afterCost:{
   lb:after?.pounds?.pricePerUnit,
   oz:after?.ounces?.pricePerUnit,
   g:after?.grams?.pricePerUnit
  },
  energyCost:{
   dehydrator:{
    consumptionMin:dehydratorMethod?.estimatedEnergyConsumption?.min,
    consumptionMax:dehydratorMethod?.estimatedEnergyConsumption?.max,
    costMin:currentTotalElectricityRate?dehydratorConsumptionMin*currentTotalElectricityRate:dehydratorMethod?.estimatedEnergyCost?.min,
    costMax:currentTotalElectricityRate?dehydratorConsumptionMax*currentTotalElectricityRate:dehydratorMethod?.estimatedEnergyCost?.max
   },
   oven:{
    consumptionMin:ovenUsageMin,
    consumptionMax:ovenUsageMax,
    consumptionUnit:ovenUnit,
    costMin:ovenUsesFuel?ovenUsageMin*ovenRate:(ovenRate?ovenUsageMin*ovenRate:ovenMethod?.estimatedEnergyCost?.min),
    costMax:ovenUsesFuel?ovenUsageMax*ovenRate:(ovenRate?ovenUsageMax*ovenRate:ovenMethod?.estimatedEnergyCost?.max)
   },
   ratePerKwh:currentTotalElectricityRate,
   ratePeriod:getRatePeriodLabel(currentElectricityRate),
   ovenRate:ovenRate,
   ovenRateUnit:ovenUnit,
   ovenRatePeriod:ovenUsesFuel?(fuelRate?getRatePeriodLabel(fuelRate):(defaultFuelRate>0?"Fuel source default rate":"No fuel rate found")):getRatePeriodLabel(currentElectricityRate),
   ovenUsesFuel
  },
  actualCost:getActualProcessCost(setup,process,electricityRates,fuelRates),
  processRuns,
  raw:setup
 };
};

const getAllItems=(data,electricityRates,fuelRates,processes)=>{
 const itemMap={};

 data.forEach(setup=>{
  const itemName=setup?.item||"Untitled Item";

  if(!itemMap[itemName]){
   itemMap[itemName]=[];
  }

  itemMap[itemName].push(mapSetupToBatch(setup,electricityRates,fuelRates,processes));
 });

 return itemMap;
};

const sumCostUnits=(batches,key)=>{
 return batches.reduce((acc,batch)=>{
  acc.lb+=(parseFloat(batch?.[key]?.lb?.$numberDecimal??batch?.[key]?.lb??0)||0);
  acc.oz+=(parseFloat(batch?.[key]?.oz?.$numberDecimal??batch?.[key]?.oz??0)||0);
  acc.g+=(parseFloat(batch?.[key]?.g?.$numberDecimal??batch?.[key]?.g??0)||0);
  return acc;
 },{lb:0,oz:0,g:0});
};

const sumEnergyCost=batches=>{
 return batches.reduce((acc,batch)=>{
  ["dehydrator","oven"].forEach(method=>{
   ["consumptionMin","consumptionMax","costMin","costMax"].forEach(field=>{
    acc[method][field]+=formatNumber(batch?.energyCost?.[method]?.[field]);
   });
  });
  return acc;
 },{
  dehydrator:{consumptionMin:0,consumptionMax:0,costMin:0,costMax:0},
  oven:{consumptionMin:0,consumptionMax:0,costMin:0,costMax:0}
 });
};

function CostTable({title,data,note}){
 return(
  <div className="dehydration-table-block">
   <div className="dehydration-table-title">{title}</div>
   <div className="table-responsive">
    <Table bordered hover className="mb-0 dehydration-project-table">
     <thead>
      <tr>
       <th>Per lb</th>
       <th>Per oz</th>
       <th>Per g</th>
      </tr>
     </thead>
     <tbody>
      <tr>
       <td>{formatUnitMoney(data?.lb)}</td>
       <td>{formatUnitMoney(data?.oz)}</td>
       <td>{formatUnitMoney(data?.g)}</td>
      </tr>
      {note?<tr><td colSpan={3}>{note}</td></tr>:null}
     </tbody>
    </Table>
   </div>
  </div>
 );
}

function EnergyCostTable({data}){
 return(
  <div className="dehydration-table-block">
   <div className="dehydration-table-title">Estimated Energy Use and Cost</div>
   <div className="table-responsive">
    <Table bordered hover className="mb-0 dehydration-project-table">
     <thead>
      <tr>
       <th>Method</th>
       <th>Energy Used</th>
       <th>Energy Cost</th>
      </tr>
      <tr>
       <th colSpan={3}>Dehydrator rate: {data?.ratePeriod||"No electricity rate found"} · {formatUnitMoney(data?.ratePerKwh)} per kWh</th>
      </tr>
     </thead>
     <tbody>
      <tr>
       <td>Dehydrator</td>
       <td>{formatRange(data?.dehydrator?.consumptionMin,data?.dehydrator?.consumptionMax,"kWh")}</td>
       <td>{formatMoneyRange(data?.dehydrator?.costMin,data?.dehydrator?.costMax)}</td>
      </tr>
      <tr>
       <td>Oven</td>
       <td>{formatRange(data?.oven?.consumptionMin,data?.oven?.consumptionMax,data?.oven?.consumptionUnit||"kWh")}</td>
       <td>{formatMoneyRange(data?.oven?.costMin,data?.oven?.costMax)}</td>
      </tr>
      <tr>
       <td colSpan={3}>Oven rate: {data?.ovenRatePeriod||"No rate found"} · {formatUnitMoney(data?.ovenRate)} per {data?.ovenRateUnit||"kWh"}</td>
      </tr>
     </tbody>
    </Table>
   </div>
  </div>
 );
}

export default function DehydrationProjectsPage(){
 const [data,setData]=useState([]);
 const [electricityRates,setElectricityRates]=useState([]);
 const [fuelRates,setFuelRates]=useState([]);
 const [processes,setProcesses]=useState([]);
 const [selectedItem,setSelectedItem]=useState("");
 const [selectedBatchId,setSelectedBatchId]=useState("");
 const [showBatchModal,setShowBatchModal]=useState(false);
 const [showSetupModal,setShowSetupModal]=useState(false);
 const [showRunModal,setShowRunModal]=useState(false);
 const [editRunId,setEditRunId]=useState("");
 const [editSetupId,setEditSetupId]=useState("");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [selectedStatus,setSelectedStatus]=useState("active");
 const [deleteLoading,setDeleteLoading]=useState(false);

 const loadSetups=async()=>{
  setLoading(true);
  setError("");

  try{
   const [res,ratesRes,fuelRatesRes,processesRes]=await Promise.all([
    fetch("/api/dehydration-setups"),
    fetch("/api/electricity-rates"),
    fetch("/api/fuel-rates"),
    fetch("/api/dehydration-processes")
   ]);
   const [payload,ratesPayload,fuelRatesPayload,processesPayload]=await Promise.all([res.json(),ratesRes.json(),fuelRatesRes.json(),processesRes.json()]);

   if(!res.ok){
    throw new Error(payload?.message||"Failed to load dehydration setups");
   }

   const rows=Array.isArray(payload?.data)?payload.data:Array.isArray(payload)?payload:[];
   setData(rows);
   setElectricityRates(ratesRes.ok?(Array.isArray(ratesPayload)?ratesPayload:[]):[]);
   setFuelRates(fuelRatesRes.ok?(Array.isArray(fuelRatesPayload?.fuelRates)?fuelRatesPayload.fuelRates:[]):[]);
   setProcesses(processesRes.ok&&Array.isArray(processesPayload)?processesPayload:[]);
  }catch(err){
   setError(err.message||"Failed to load dehydration setups");
   setData([]);
   setElectricityRates([]);
   setFuelRates([]);
   setProcesses([]);
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  const timer=window.setTimeout(()=>{
   loadSetups();
  },0);

  return()=>window.clearTimeout(timer);
 },[]);

 const allItemsData=useMemo(()=>getAllItems(data,electricityRates,fuelRates,processes),[data,electricityRates,fuelRates,processes]);

 const projectStatusCounts=useMemo(()=>{
  return data.reduce((acc,setup)=>{
   const status=getSetupStatus(setup);
   acc[status]=(acc[status]||0)+1;
   return acc;
  },{active:0,inactive:0,paused:0,completed:0,cancelled:0});
 },[data]);

 const itemNames=useMemo(()=>Object.keys(allItemsData).filter(item=>{
  if(!selectedStatus) return true;
  return (allItemsData[item]||[]).some(batch=>batch.status===selectedStatus);
 }),[allItemsData,selectedStatus]);
 const effectiveSelectedItem=useMemo(()=>{
  if(itemNames.includes(selectedItem))return selectedItem;
  return itemNames[0]||"";
 },[itemNames,selectedItem]);

 const selectedBatches=useMemo(()=>{
  if(!effectiveSelectedItem) return [];
  return (allItemsData[effectiveSelectedItem]||[]).filter(batch=>!selectedStatus||batch.status===selectedStatus);
 },[allItemsData,effectiveSelectedItem,selectedStatus]);

 const effectiveSelectedBatchId=useMemo(()=>{
  if(selectedBatches.some(batch=>String(batch.id)===String(selectedBatchId)))return String(selectedBatchId);
  return selectedBatches[0]?.id?String(selectedBatches[0].id):"";
 },[selectedBatches,selectedBatchId]);

 const selectedBatch=effectiveSelectedBatchId?selectedBatches.find(batch=>String(batch.id)===String(effectiveSelectedBatchId))||null:null;

 const initialCostData=selectedBatch?selectedBatch.initialCost:sumCostUnits(selectedBatches,"initialCost");
 const afterCostData=selectedBatch?(selectedBatch.actualCost||selectedBatch.afterCost):sumCostUnits(selectedBatches,"afterCost");
 const energyCostData=selectedBatch?selectedBatch.energyCost:sumEnergyCost(selectedBatches);
 const actualCostNote=selectedBatch?.actualCost
  ?`${selectedBatch.actualCost.method}: ${formatRange(selectedBatch.actualCost.energyUsed,selectedBatch.actualCost.energyUsed,selectedBatch.actualCost.energyUnit)} at ${formatUnitMoney(selectedBatch.actualCost.rate)} per ${selectedBatch.actualCost.energyUnit} (${selectedBatch.actualCost.ratePeriod}); ingredient ${formatMoney(selectedBatch.actualCost.ingredientCost)} + energy ${formatMoney(selectedBatch.actualCost.energyCost)}.`
  :"No completed process with actual runtime and final weight is recorded.";

 const handleSaved=async savedSetup=>{
  await loadSetups();
  setShowSetupModal(false);

  if(savedSetup?._id){
   setEditSetupId(savedSetup._id);
   setSelectedItem(savedSetup.item||"");
   setSelectedBatchId(savedSetup._id);
  }else{
   setEditSetupId("");
  }
 };

 const handleDelete=async id=>{
  if(!id||deleteLoading) return;
  const confirmed=window.confirm("Delete this dehydration project?");
  if(!confirmed) return;

  setDeleteLoading(true);
  setError("");

  try{
   const res=await fetch(`/api/dehydration-setups/${id}`,{method:"DELETE"});
   const payload=await res.json().catch(()=>null);

   if(!res.ok){
    throw new Error(payload?.message||"Failed to delete dehydration project");
   }

   if(String(effectiveSelectedBatchId)===String(id)){
    setSelectedBatchId("");
   }

   await loadSetups();
  }catch(err){
   setError(err.message||"Failed to delete dehydration project");
  }finally{
   setDeleteLoading(false);
  }
 };


 if(loading){
  return(
   <div className="container-fluid py-4">
    <div className="d-flex justify-content-center align-items-center" style={{minHeight:"40vh"}}>
     <Spinner animation="border"/>
    </div>
   </div>
  );
 }

 return(
  <div className="container-fluid py-3 dehydration-projects-page">
   <div className="dehydration-project-toolbar mb-3">
    <Row className="g-3 align-items-center">
     <Col lg={4}>
      <div className="dehydration-toolbar-title-wrap">
       <h4 className="mb-1">Dehydration Projects</h4>
       <div className="text-muted">{data.length} total setup{data.length===1?"":"s"}</div>
      </div>
     </Col>

     <Col lg={5}>
      <div className="dehydration-toolbar-filters">
       {STATUS_OPTIONS.map(status=>(
        <Button
         key={status}
         type="button"
         variant={selectedStatus===status?"primary":"outline-secondary"}
         size="sm"
         className="dehydration-filter-check"
         onClick={()=>setSelectedStatus(status)}
        >
         <span className="text-capitalize">{status}</span>
         <Badge bg={getStatusVariant(status)}>{projectStatusCounts[status]||0}</Badge>
        </Button>
       ))}
       <Button type="button" variant="outline-secondary" size="sm" className="dehydration-filter-clear" onClick={()=>setSelectedStatus("")}>Clear</Button>
      </div>
     </Col>

     <Col lg={3}>
      <div className="dehydration-toolbar-actions">
       <Button
        type="button"
        onClick={()=>{
         setEditSetupId("");
         setShowSetupModal(true);
        }}
       >
        Add New Project
       </Button>
      </div>
     </Col>
    </Row>
   </div>

   {error?
    <Row className="g-3 mb-3">
     <Col xs={12}>
      <Alert variant="danger" className="mb-0">{error}</Alert>
     </Col>
    </Row>
   :null}

   <Row className="g-3 dehydration-main-layout">
    <Col xl={3} lg={4}>
     <div className="dehydration-panel">
      <div className="dehydration-panel-header">
       <h5 className="mb-0">Items</h5>
       <Badge bg="secondary">{itemNames.length}</Badge>
      </div>

      <div className="dehydration-scroll-list">
       <ListGroup variant="flush">
        {itemNames.length?itemNames.map(item=>{
         const activeCount=(allItemsData[item]||[])
          .filter(batch=>!selectedStatus||batch.status===selectedStatus)
          .reduce((count,batch)=>count+Math.max(batch.processRuns?.length||0,1),0);

         return(
          <ListGroup.Item
           key={item}
           action
           active={effectiveSelectedItem===item}
           onClick={()=>{
            setSelectedItem(item);
            setSelectedBatchId("");
           }}
           className="dehydration-list-item d-flex justify-content-between align-items-center"
          >
           <span className="text-truncate">{item}</span>
           <Badge bg={effectiveSelectedItem===item?"light":"secondary"} text={effectiveSelectedItem===item?"dark":"light"}>
            {activeCount}
           </Badge>
          </ListGroup.Item>
         );
        }):(
         <ListGroup.Item className="dehydration-empty-state">No items</ListGroup.Item>
        )}
       </ListGroup>
      </div>
     </div>
    </Col>

    <Col xl={5} lg={8}>
     <div className="dehydration-panel">
      <div className="dehydration-panel-header">
       <div>
        <h5 className="mb-0">{effectiveSelectedItem||"Projects"}</h5>
        <div className="small text-muted">Filtered project list</div>
       </div>
       <Badge bg="secondary">{selectedBatches.length}</Badge>
      </div>

      <div className="dehydration-scroll-list">
       {selectedBatches.length?selectedBatches.map(batch=>(
        <div
         className={`dehydration-project-row ${effectiveSelectedBatchId===String(batch.id)?"is-selected":""}`}
         key={batch.id}
         onClick={()=>setSelectedBatchId(String(batch.id))}
         onDoubleClick={()=>{
          setSelectedBatchId(String(batch.id));
          setShowBatchModal(true);
         }}
        >
         <div className="dehydration-project-main">
          <div className="dehydration-project-top">
           <h6 className="mb-0">{batch.name}</h6>
           <Badge bg={getStatusVariant(batch.status)} className="text-capitalize">{batch.status}</Badge>
          </div>

          <div className="dehydration-project-meta">
           <span><strong>Code:</strong> {batch.processCode||"—"}</span>
           <span><strong>Method:</strong> {batch.method}</span>
           <span><strong>Process Date:</strong> {batch.startDate||"—"}</span>
          </div>
          <div className="dehydration-run-list">
           {batch.processRuns?.length?batch.processRuns.map((run,index)=>(
            <div className="dehydration-run-row" key={run._id}>
             <strong>{run.batchName||run.finalNotes?.replace(/^Batch:\s*/i,"")||`Run ${index+1}`}</strong>
             <span>{formatDate(run?.itemDetails?.startDate)||"No date"}</span>
             <span className="text-capitalize">{run.status}</span>
             <Button type="button" size="sm" variant="outline-primary" onClick={event=>{event.stopPropagation();setSelectedBatchId(String(batch.id));setEditRunId(run._id);setShowRunModal(true);}}>Edit Run</Button>
            </div>
           )):<div className="dehydration-run-empty">No runs recorded.</div>}
          </div>
         </div>

         <div className="dehydration-project-actions">
          <Button
           type="button"
           size="sm"
           variant="outline-secondary"
           onClick={e=>{
            e.stopPropagation();
            setSelectedBatchId(String(batch.id));
            setShowBatchModal(true);
           }}
          >
           View / Print
          </Button>
         <Button
           type="button"
           size="sm"
           variant="outline-success"
           onClick={e=>{
            e.stopPropagation();
            setSelectedBatchId(String(batch.id));
            setEditRunId("");
            setShowRunModal(true);
           }}
          >
           Add Run
          </Button>

          <Button
           type="button"
           size="sm"
           variant="outline-primary"
           onClick={e=>{
            e.stopPropagation();
            setEditSetupId(batch.id);
            setShowSetupModal(true);
           }}
          >
           Edit
          </Button>

          <Button
           type="button"
           size="sm"
           variant="outline-danger"
           onClick={e=>{
            e.stopPropagation();
            handleDelete(batch.id);
           }}
           disabled={deleteLoading}
          >
           Delete
          </Button>
         </div>
        </div>
       )):(
        <div className="dehydration-empty-state">No projects for this item with the selected filters.</div>
       )}
      </div>
     </div>
    </Col>

    <Col xl={4} lg={12}>
     <div className="dehydration-tables-wrap">
      <CostTable title="Initial Cost per Unit" data={initialCostData}/>
      <CostTable title={selectedBatch?.actualCost?"Actual Final Cost per Unit":"Estimated After Dehydration Cost per Unit"} data={afterCostData} note={actualCostNote}/>
      <EnergyCostTable data={energyCostData}/>
     </div>
    </Col>
   </Row>

   <Modal
    show={showBatchModal}
    onHide={()=>setShowBatchModal(false)}
    size="xl"
    centered
    backdrop={false}
    dialogClassName="batch-details-modal project-print-modal"
    contentClassName="batch-details-modal-content"
   >
    <Modal.Header closeButton className="project-print-actions">
     <Modal.Title>{selectedBatch?.name||"Project Details"}</Modal.Title>
     <Button type="button" className="project-print-button" onClick={()=>{
      const printable=document.querySelector(".project-print-document");
      if(!printable)return;
      const printWindow=window.open("","_blank","width=1000,height=800");
      if(!printWindow)return;
      printWindow.document.open();
      printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${selectedBatch?.name||"Project Details"}</title><style>@page{margin:0.5in}html,body{margin:0;padding:0;background:#fff;color:#000;font-family:Arial,sans-serif}body{font-size:11pt}.project-print-document{width:100%;margin:0;padding:0}.project-print-header{margin-bottom:18px}.project-print-header h1{margin:0 0 10px;font-size:22pt}.project-print-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0}.project-print-summary div{break-inside:avoid}.project-print-summary dt{font-weight:700}.project-print-summary dd{margin:2px 0 0}.project-print-section{display:block;margin:0 0 18px;break-inside:auto}.project-print-section h2{font-size:15pt;margin:0 0 8px}.project-print-section h3,.project-print-run h3{font-size:12pt;margin:10px 0 6px}.project-print-run{break-inside:auto;margin-bottom:14px}.project-print-methods{display:grid;grid-template-columns:1fr 1fr;gap:12px}.project-print-methods>div{break-inside:avoid}table{width:100%;border-collapse:collapse;margin:6px 0 12px}thead{display:table-header-group}tr{break-inside:avoid}th,td{border:1px solid #777;padding:5px;text-align:left;vertical-align:top}ol,ul{margin:6px 0 12px;padding-left:22px}li{margin-bottom:4px;break-inside:avoid}.project-print-notes{white-space:pre-wrap}</style></head><body>${printable.outerHTML}</body></html>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.onload=()=>{
       printWindow.print();
       printWindow.close();
      };
     }}>Print</Button>
    </Modal.Header>

    <Modal.Body>
     {selectedBatch?<ProjectDocument batch={selectedBatch}/>:null}
    </Modal.Body>
   </Modal>

   <DehydrationSetupForm
    show={showSetupModal}
    onHide={()=>{
     setShowSetupModal(false);
     setEditSetupId("");
    }}
    setupId={editSetupId}
    onSaved={handleSaved}
   />
   <DehydrationSetupForm
    show={showRunModal}
    onHide={()=>{setShowRunModal(false);setEditRunId("");}}
    setupId={selectedBatch?.id||""}
    runId={editRunId}
    runMode
    onSaved={async()=>{
     await loadSetups();
     setShowRunModal(false);
     setEditRunId("");
    }}
   />
  </div>
 );
}

const cleanPrintableNotes=value=>String(value||"")
 .split(/\r?\n/)
 .map(line=>line.trim().replace(/^(?:Date|Start Time):\s*(?=[A-Za-z ]+:)/i,""))
 .filter(Boolean)
 .filter(line=>!/^Cost\/(?:oz|lb|g)\s*=/i.test(line))
 .filter(line=>!/^Cost Per (?:Ounce|Pound|Gram|Unit)\s*:\s*(?:Pending)?\s*$/i.test(line))
 .filter(line=>!/^actual runtime and final measured weight\s*$/i.test(line))
 .filter(line=>!/^(?:(?:Date|Start Time|Cost Per Unit|Cost Per Ounce|Cost Per Pound|Cost Per Gram)\s*:\s*)+$/i.test(line))
 .filter(line=>!/^(?:Dehydrator|Oven)$/i.test(line))
 .join("\n");

function ProjectDocument({batch}){
 const setup=batch?.raw||{};
 const dehydrator=setup?.dehydrationMethods?.dehydratorMethod||{};
 const oven=setup?.dehydrationMethods?.ovenMethod||{};
 const predicted=setup?.predictedWeightAfterDehydration||{};
 const schedules=setup?.defaultSchedules||{};
 const preparation=setup?.preparationInstructions||[];
 const storage=setup?.storageInstructions||{};
 const equivalents=setup?.equivalentsTable||[];
 const priceDefaults=setup?.marketPriceCalculationDefaults||{};
 const printableNotes=cleanPrintableNotes(setup.finalNotes);
 const costs=setup?.totalCostSummary||[];
 const runs=batch?.processRuns||[];
 return(
  <article className="project-print-document">
   <header className="project-print-header">
    <h1>{batch?.name||"Dehydration Project"}</h1>
    <dl className="project-print-summary">
     <div><dt>Status</dt><dd className="text-capitalize">{batch?.status||"—"}</dd></div>
     <div><dt>Method</dt><dd>{batch?.method||"—"}</dd></div>
     <div><dt>Process Date</dt><dd>{batch?.startDate||"—"}</dd></div>
   </dl>
   </header>

   {runs.length?<section className="project-print-section"><h2>Actual Run Inputs</h2>{runs.map((run,index)=>{
    const operational=run.operationalData||{};
    const item=run.itemDetails||{};
    const actual=run.actualResults||{};
    const runSchedules=run.processSchedules||{};
    const notes=operational.intervalNotes||[];
    const runNotes=cleanPrintableNotes(run.finalNotes);
    return <section className="project-print-run" key={run._id||`print-run-${index}`}>
     <h3>{batch?.name||run.batchName||`Run ${index+1}`}</h3>
     <dl className="project-print-summary">
      <div><dt>Input Weight</dt><dd>{formatNumber(item.weightBeforeDehydration?.pounds)||0} lb · {formatNumber(item.weightBeforeDehydration?.ounces)||0} oz</dd></div>
      <div><dt>Ingredient Cost</dt><dd>{formatMoney(item.totalCost)}</dd></div>
      <div><dt>Start Date</dt><dd>{formatDate(operational.startDate||item.startDate)||"—"}</dd></div>
      <div><dt>Start Time</dt><dd>{operational.startTime||"—"}</dd></div>
      <div><dt>Method</dt><dd className="text-capitalize">{run.method||"—"}</dd></div>
      <div><dt>Status</dt><dd className="text-capitalize">{run.status||"—"}</dd></div>
      <div><dt>Trays</dt><dd>{operational.trayCount??"—"}</dd></div>
      <div><dt>Actual Temperature</dt><dd>{operational.actualTemperature||"—"}</dd></div>
      <div><dt>End Date</dt><dd>{formatDate(operational.endDate||actual.completedDate)||"—"}</dd></div>
      <div><dt>End Time</dt><dd>{operational.endTime||"—"}</dd></div>
      <div><dt>Final Weight</dt><dd>{formatNumber(actual.actualFinalWeight)||"—"}</dd></div>
     </dl>
     {notes.length?<><h4>Timed Notes</h4><table><thead><tr><th>Date</th><th>Time</th><th>Observation or Action</th></tr></thead><tbody>{notes.map((note,noteIndex)=><tr key={`print-note-${index}-${noteIndex}`}><td>{formatDate(note.date)||"—"}</td><td>{note.time||"—"}</td><td>{note.note||"—"}</td></tr>)}</tbody></table></>:null}
     {([...(runSchedules.dehydratorSchedule||[]),...(runSchedules.ovenSchedule||[])]).length?<><h4>Actual Schedule</h4><table><thead><tr><th>Method</th><th>Date</th><th>Time</th><th>Action</th></tr></thead><tbody>{(runSchedules.dehydratorSchedule||[]).map((row,rowIndex)=><tr key={`print-run-d-${index}-${rowIndex}`}><td>Dehydrator</td><td>{formatDate(row.date)||"—"}</td><td>{row.time||"—"}</td><td>{row.action||"—"}</td></tr>)}{(runSchedules.ovenSchedule||[]).map((row,rowIndex)=><tr key={`print-run-o-${index}-${rowIndex}`}><td>Oven</td><td>{formatDate(row.date)||"—"}</td><td>{row.time||"—"}</td><td>{row.action||"—"}</td></tr>)}</tbody></table></>:null}
     {runNotes?<><h4>Final Notes</h4><p className="project-print-notes">{runNotes}</p></>:null}
    </section>;
   })}</section>:null}

   <section className="project-print-section">
    <h2>Dehydration Methods</h2>
    <div className="project-print-methods">
     <div><h3>Dehydrator</h3><p><strong>Temperature:</strong> {dehydrator.suggestedTemperatureRange||"—"}</p><p><strong>Duration:</strong> {dehydrator.estimatedDuration||"—"}</p><p><strong>Energy:</strong> {formatRange(dehydrator.estimatedEnergyConsumption?.min,dehydrator.estimatedEnergyConsumption?.max,"kWh")}</p></div>
     <div><h3>Oven</h3><p><strong>Temperature:</strong> {oven.temperature||"—"}</p><p><strong>Duration:</strong> {oven.estimatedTime||"—"}</p><p><strong>Energy:</strong> {formatRange(oven.energyConsumption?.min,oven.energyConsumption?.max,"kWh")}</p></div>
    </div>
   </section>

   <section className="project-print-section">
    <h2>Predicted Result</h2>
    <p><strong>Expected weight reduction:</strong> {formatNumber(predicted.expectedWeightLoss)}%</p>
    <p><strong>Final weight range:</strong> {formatRange(predicted.predictedFinalWeight?.min,predicted.predictedFinalWeight?.max,"g")}</p>
   </section>

   <section className="project-print-section">
    <h2>Default Weights and Costs</h2>
    <table><thead><tr><th>Stage</th><th>Unit</th><th>Weight</th><th>Cost per Unit</th><th>Total Cost</th></tr></thead><tbody>
     {[["Before","pounds","lb"],["Before","ounces","oz"],["Before","grams","g"]].map(([stage,key,unit])=>{const row=priceDefaults.beforeDehydration?.[key]||{};return <tr key={`print-before-${key}`}><td>{stage}</td><td>{unit}</td><td>{formatNumber(row.weight)||"—"}</td><td>{formatMoney(row.pricePerUnit)}</td><td>{formatMoney(row.totalPrice)}</td></tr>;})}
     {[["After","pounds","lb"],["After","ounces","oz"],["After","grams","g"]].map(([stage,key,unit])=>{const row=priceDefaults.afterDehydration?.[key]||{};return <tr key={`print-after-${key}`}><td>{stage}</td><td>{unit}</td><td>{formatNumber(row.weightAfterDehydration)||"—"}</td><td>{formatMoney(row.pricePerUnit)}</td><td>{formatMoney(row.totalPrice)}</td></tr>;})}
    </tbody></table>
   </section>

   {preparation.length?<section className="project-print-section">
    <h2>Preparation Instructions</h2>
    <ol>{preparation.map((row,index)=><li key={`print-prep-${index}`}><span>{row.preparation||row.action||"—"}</span>{row.date||row.time?<small>{[formatDate(row.date),row.time].filter(Boolean).join(" · ")}</small>:null}</li>)}</ol>
   </section>:null}

   {([...(schedules.dehydratorSchedule||[]),...(schedules.ovenSchedule||[])]).length?<section className="project-print-section">
    <h2>Schedule</h2>
    <table><thead><tr><th>Method</th><th>Date</th><th>Time</th><th>Action</th></tr></thead><tbody>
     {(schedules.dehydratorSchedule||[]).map((row,index)=><tr key={`print-d-${index}`}><td>Dehydrator</td><td>{formatDate(row.date)||"—"}</td><td>{row.time||"—"}</td><td>{row.action||"—"}</td></tr>)}
     {(schedules.ovenSchedule||[]).map((row,index)=><tr key={`print-o-${index}`}><td>Oven</td><td>{formatDate(row.date)||"—"}</td><td>{row.time||"—"}</td><td>{row.action||"—"}</td></tr>)}
    </tbody></table>
   </section>:null}

   {storage.instructions?.length?<section className="project-print-section"><h2>Storage Instructions</h2><ul>{storage.instructions.map((line,index)=><li key={`print-storage-${index}`}>{line}</li>)}</ul></section>:null}
   {setup.rehydrationInstructions?<section className="project-print-section"><h2>Rehydration Instructions</h2><p>{setup.rehydrationInstructions}</p></section>:null}

   {equivalents.length?<section className="project-print-section"><h2>Equivalents</h2><table><thead><tr><th>Fresh Amount</th><th>Dried Equivalent</th><th>lb</th><th>oz</th><th>g</th></tr></thead><tbody>{equivalents.map((row,index)=><tr key={`print-equivalent-${index}`}><td>{row.freshAmount||"—"}</td><td>{row.driedEquivalent||"—"}</td><td>{formatNumber(row.equivalentLb)||"—"}</td><td>{formatNumber(row.equivalentOz)||"—"}</td><td>{formatNumber(row.equivalentGrams)||"—"}</td></tr>)}</tbody></table></section>:null}
   {costs.length?<section className="project-print-section"><h2>Cost Summary</h2><table><thead><tr><th>Method</th><th>Wattage</th><th>Energy Used</th><th>Energy Cost</th><th>Total Cost</th></tr></thead><tbody>{costs.map((row,index)=><tr key={`print-cost-${index}`}><td>{row.method||"—"}</td><td>{formatNumber(row.wattage)}</td><td>{formatNumber(row.energyUsedKwh)} kWh</td><td>{formatMoney(row.energyCost)}</td><td>{formatMoney(row.totalCost)}</td></tr>)}</tbody></table></section>:null}

   {printableNotes?<section className="project-print-section"><h2>Notes</h2><p className="project-print-notes">{printableNotes}</p></section>:null}
  </article>
 );
}