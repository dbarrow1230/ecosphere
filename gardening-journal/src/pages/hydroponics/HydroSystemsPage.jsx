/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import {useEffect,useMemo,useState} from "react";
import {Alert,Button,Card,Col,Form,InputGroup,Modal,Row,Spinner} from "react-bootstrap";
import {Activity,AlertTriangle,ArrowLeft,Droplets,Grip,Leaf,Pencil,Plus,Save,Thermometer,Trash2,Undo2} from "lucide-react";
import {Link,useNavigate,useSearchParams} from "react-router-dom";
import SortedList from "../../components/SortedList.jsx";
import SortedSelect from "../../components/SortedSelect.jsx";
import {sortItems} from "../../utils/sortItems.js";
import "../../styles/hydroSystems.css";

const systemTypes=[
 {value:"hydroponic",label:"Hydroponic"},
 {value:"aeroponic",label:"Aeroponic"},
 {value:"wall-garden",label:"Wall Garden"},
 {value:"aquaponic",label:"Aquaponic"},
 {value:"vertical",label:"Vertical"},
 {value:"kratky",label:"Kratky"},
 {value:"nft",label:"NFT"},
 {value:"dwc",label:"DWC"},
 {value:"ebb-flow",label:"Ebb and Flow"},
 {value:"other",label:"Other"}
];

const lightTypes=[
 {value:"",label:"Select light type"},
 {value:"led",label:"LED"},
 {value:"full-spectrum",label:"Full Spectrum"},
 {value:"white",label:"White"},
 {value:"red-blue",label:"Red / Blue"},
 {value:"warm-white",label:"Warm White"},
 {value:"cool-white",label:"Cool White"},
 {value:"sunlike",label:"Sunlike"},
 {value:"none",label:"None"},
 {value:"other",label:"Other"}
];

const normalizeLightType=value=>{
 const lightType=String(value||"").trim().toLowerCase();

 if(lightType==="led")return "led";
 if(lightType==="full spectrum"||lightType==="full_spectrum")return "full-spectrum";
 if(lightType==="red/blue"||lightType==="red blue"||lightType==="red_blue")return "red-blue";
 if(lightType==="warm white"||lightType==="warm_white")return "warm-white";
 if(lightType==="cool white"||lightType==="cool_white")return "cool-white";

 return lightType;
};

const defaultRunForm={
 name:"",
 systemType:"hydroponic",
 startedDate:"",
 notes:"",
 equipment:"",
 deviceName:"",
 brand:"",
 model:"",
 serialNumber:"",
 productUrl:"",
 location:"",
 podCount:12,
 reservoirCapacity:"",
 lightType:"",
 pumpType:"",
 waterLevel:"",
 phLevel:"",
 temperature:"",
 nutrientsLevel:"",
 lastReadingAt:"",
 deviceNotes:""
};

const defaultDeviceForm={
 equipment:"",
 name:"",
 systemType:"hydroponic",
 brand:"",
 model:"",
 serialNumber:"",
 productUrl:"",
 location:"",
 podCount:12,
 reservoirCapacity:"",
 lightType:"",
 pumpType:"",
 waterLevel:"",
 phLevel:"",
 temperature:"",
 nutrientsLevel:"",
 lastReadingAt:"",
 notes:""
};

const defaultLibraryDeviceForm={
 name:"",
 systemType:"hydroponic",
 brand:"",
 modelNumber:"",
 serialNumber:"",
 productUrl:"",
 location:"",
 podCount:12,
 reservoirCapacity:"",
 lightType:"",
 pumpType:"",
 notes:"",
 condition:"good"
};

const getObjectId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;

 if(typeof value==="object"){
  if(typeof value.$oid==="string")return value.$oid;
  if(typeof value._id==="string")return value._id;
  if(typeof value.id==="string")return value.id;
  if(typeof value._id?.$oid==="string")return value._id.$oid;
  if(typeof value.id?.$oid==="string")return value.id.$oid;
 }

 return "";
};

const getSystemTypeLabel=value=>{
 return systemTypes.find(item=>item.value===value)?.label||value||"System";
};

const getSeedName=seed=>{
 if(!seed)return "";
 if(typeof seed==="string")return seed;
 return seed.plantName||seed.name||seed.title||seed.label||"Unnamed Seed";
};

const getGrowthRateValue=growthRate=>{
 if(!growthRate)return "";
 if(typeof growthRate==="string")return growthRate;

 return getObjectId(growthRate)||growthRate.name||growthRate.title||growthRate.label||growthRate.rate||"";
};

const getGrowthRateLabel=growthRate=>{
 if(!growthRate)return "";
 if(typeof growthRate==="string")return growthRate;

 return growthRate.name||growthRate.title||growthRate.label||growthRate.rate||getObjectId(growthRate)||"";
};

const getSeedGrowthRate=seed=>{
 return seed?.growthInformation?.growthRate||seed?.growthRate||null;
};

const getSeedGrowthRateValue=seed=>{
 return String(getGrowthRateValue(getSeedGrowthRate(seed))||"").trim().toLowerCase();
};

const getSeedGrowthRateLabel=seed=>{
 return getGrowthRateLabel(getSeedGrowthRate(seed));
};

const getSeedMeta=seed=>{
 if(!seed||typeof seed==="string")return "";
 const species=seed.species?.commonName||seed.species?.botanicalName||seed.species?.name||"";
 const vendor=Array.isArray(seed.vendor) ? seed.vendor.map(item=>item.name||item.companyName).filter(Boolean).join(", ") : "";
 const growthRate=getSeedGrowthRateLabel(seed);
 return [species,growthRate,vendor].filter(Boolean).join(" • ");
};

const getSeedPhRange=seed=>{
 const value=String(seed?.growingConditionsAndRequirements?.phRequirements||"");
 const numbers=(value.match(/\d+(?:\.\d+)?/g)||[]).map(Number).filter(Number.isFinite);
 if(!numbers.length)return null;
 if(numbers.length===1)return {min:numbers[0],max:numbers[0]};
 return {min:Math.min(...numbers),max:Math.max(...numbers)};
};

const formatPhRange=range=>range?`${range.min}${range.min===range.max?"":`–${range.max}`} pH`:"Not recorded";

const getCompanionIds=seed=>new Set(
 (seed?.plantingInformation?.companionPlants||[]).map(getObjectId).filter(Boolean)
);

const getSeedCompatibility=(referenceSeed,candidate)=>{
 if(!referenceSeed||!candidate)return {tier:"unrated",score:0,reasons:[],warnings:[]};

 if(getObjectId(referenceSeed)===getObjectId(candidate)){
  return {
   tier:"reference",
   score:Infinity,
   reasons:["Selected starting seed"],
   warnings:["Use the ranked seeds below to fill the remaining pods"]
  };
 }

 const reasons=[];
 const warnings=[];
 let score=0;
 const referenceId=getObjectId(referenceSeed);
 const candidateId=getObjectId(candidate);
 const referenceGrowth=getSeedGrowthRateValue(referenceSeed);
 const candidateGrowth=getSeedGrowthRateValue(candidate);
 const referencePh=getSeedPhRange(referenceSeed);
 const candidatePh=getSeedPhRange(candidate);
 const explicitCompanions=getCompanionIds(referenceSeed).has(candidateId)||getCompanionIds(candidate).has(referenceId);

 if(explicitCompanions){
  score+=4;
  reasons.push("Explicitly listed as companion plants");
 }

 if(referenceGrowth&&candidateGrowth){
  if(referenceGrowth===candidateGrowth){
   score+=2;
   reasons.push(`Matching ${getSeedGrowthRateLabel(candidate)} growth rate`);
  }else{
   score-=2;
   warnings.push(`Growth rates differ: ${getSeedGrowthRateLabel(referenceSeed)} vs ${getSeedGrowthRateLabel(candidate)}`);
  }
 }else{
  warnings.push("Growth rate is not fully recorded");
 }

 if(referencePh&&candidatePh){
  const overlaps=referencePh.min<=candidatePh.max&&candidatePh.min<=referencePh.max;
  if(overlaps){
   score+=2;
   reasons.push(`Overlapping pH needs (${formatPhRange(candidatePh)})`);
  }else{
   score-=3;
   warnings.push(`pH needs do not overlap (${formatPhRange(referencePh)} vs ${formatPhRange(candidatePh)})`);
  }
 }else{
  warnings.push("pH requirements are not fully recorded");
 }

 if(candidate.plantingInformation?.hydroponicGrowth===true){
  score+=1;
  reasons.push("Marked for hydroponic growing");
 }else{
  warnings.push("Not marked as hydroponic-ready");
 }

 warnings.push("Structured nutrient-demand data is not recorded; verify EC/feed needs before sharing a reservoir");

 return {
  tier:score>=4?"match":score<0?"avoid":"review",
  score,
  reasons,
  warnings
 };
};

const getEquipmentLabel=equipment=>{
 if(!equipment)return "";
 if(typeof equipment==="string")return equipment;
 return [equipment.name,equipment.brand,equipment.modelNumber||equipment.model].filter(Boolean).join(" • ")||"Equipment";
};

const getEquipmentDeviceValues=equipment=>({
 equipment:getObjectId(equipment),
 name:equipment?.name||"",
 deviceName:equipment?.name||"",
 systemType:equipment?.systemType||"hydroponic",
 brand:equipment?.brand||"",
 model:equipment?.modelNumber||equipment?.model||"",
 serialNumber:equipment?.serialNumber||"",
 productUrl:equipment?.productUrl||"",
 location:equipment?.location||"",
 podCount:Number(equipment?.podCount)||12,
 reservoirCapacity:equipment?.reservoirCapacity||"",
 lightType:normalizeLightType(equipment?.lightType),
 pumpType:equipment?.pumpType||"",
 notes:equipment?.notes||"",
 deviceNotes:equipment?.notes||""
});

const getVendorLabel=vendor=>{
 if(!vendor)return "";
 if(typeof vendor==="string")return vendor;
 return vendor.name||vendor.companyName||vendor.title||"Equipment Vendor";
};

const formatDateForInput=value=>{
 if(!value)return "";
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "";
 return date.toISOString().slice(0,10);
};

const formatDisplayDate=value=>{
 const inputDate=formatDateForInput(value);
 if(!inputDate)return "Not started";
 const [year,month,day]=inputDate.split("-");
 return `${month}/${day}/${year}`;
};

const buildPods=(podCount,currentPods=[])=>{
 const count=Number(podCount||0);
 const podMap=new Map((Array.isArray(currentPods)?currentPods:[]).map(pod=>[Number(pod.position),pod]));

 return Array.from({length:count},(_,index)=>{
  const position=index+1;
  const current=podMap.get(position)||{};

  return {
   position,
   label:current.label||`Pod ${position}`,
   seed:current.seed||null,
   plantedDate:current.plantedDate||null,
   notes:current.notes||""
  };
 });
};

const normalizeDevice=device=>{
 return {
  _id:getObjectId(device)||`local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  equipment:device?.equipment||null,
  name:device?.name||"Hydro Device",
  systemType:device?.systemType||"hydroponic",
  brand:device?.brand||"",
  model:device?.model||"",
  serialNumber:device?.serialNumber||"",
  productUrl:device?.productUrl||"",
  location:device?.location||"",
  podCount:Number(device?.podCount||0),
  reservoirCapacity:device?.reservoirCapacity||"",
  lightType:normalizeLightType(device?.lightType),
  pumpType:device?.pumpType||"",
  waterLevel:device?.waterLevel??"",
  phLevel:device?.phLevel??"",
  temperature:device?.temperature??"",
  nutrientsLevel:device?.nutrientsLevel??"",
  lastReadingAt:formatDateForInput(device?.lastReadingAt),
  notes:device?.notes||"",
  pods:buildPods(device?.podCount,device?.pods)
 };
};

const normalizeRunDevices=run=>{
 if(Array.isArray(run?.devices)&&run.devices.length){
  return run.devices.map(normalizeDevice);
 }

 if(run?.podCount){
  return [
   normalizeDevice({
    _id:"legacy-device",
    name:run.name,
    systemType:run.systemType,
 brand:run.brand,
 model:run.model,
 serialNumber:run.serialNumber,
    productUrl:run.productUrl,
    location:run.location,
    podCount:run.podCount,
    reservoirCapacity:run.reservoirCapacity,
   lightType:normalizeLightType(run.lightType),
    pumpType:run.pumpType,
    notes:run.notes,
    pods:run.pods
   })
  ];
 }

 return [];
};

const serializeDevice=device=>({
 _id:String(device._id||"").startsWith("local-") ? undefined : device._id,
 equipment:getObjectId(device.equipment)||null,
 name:device.name,
 systemType:device.systemType,
 brand:device.brand,
 model:device.model,
 serialNumber:device.serialNumber,
 productUrl:device.productUrl,
 location:device.location,
 podCount:device.podCount,
 reservoirCapacity:device.reservoirCapacity,
 lightType:normalizeLightType(device.lightType),
 pumpType:device.pumpType,
 waterLevel:device.waterLevel===""?null:Number(device.waterLevel),
 phLevel:device.phLevel===""?null:Number(device.phLevel),
 temperature:device.temperature===""?null:Number(device.temperature),
 nutrientsLevel:device.nutrientsLevel===""?null:Number(device.nutrientsLevel),
 lastReadingAt:device.lastReadingAt||null,
 notes:device.notes,
 pods:(device.pods||[]).map(pod=>({
  position:pod.position,
  label:pod.label,
  seed:getObjectId(pod.seed)||null,
  plantedDate:pod.plantedDate||null,
  notes:pod.notes||""
 }))
});

const getNumberValue=(...values)=>{
 for(const value of values){
  if(value===""||value===null||value===undefined)continue;
  const number=Number(value);
  if(Number.isFinite(number))return number;
 }

 return null;
};

const formatMetric=(value,suffix="",emptyText="Not logged")=>{
 const number=getNumberValue(value);
 if(number===null)return emptyText;
 return `${number}${suffix}`;
};

const getFilledPodCount=devices=>{
 return devices.reduce((total,device)=>{
  return total+(device.pods||[]).filter(pod=>getObjectId(pod.seed)).length;
 },0);
};

const getAverageMetric=(devices,keys)=>{
 const values=devices
  .map(device=>getNumberValue(...keys.map(key=>device?.[key])))
  .filter(value=>value!==null);

 if(!values.length)return null;

 return Math.round((values.reduce((total,value)=>total+value,0)/values.length+Number.EPSILON)*10)/10;
};

const getHydroAlertItems=(run,devices)=>{
 const filledPods=getFilledPodCount(devices);
 const totalPods=devices.reduce((total,device)=>total+Number(device.podCount||0),0);
 const phLevel=getAverageMetric(devices,["phLevel","ph","waterPh"]);
 const waterLevel=getAverageMetric(devices,["waterLevel","waterPercent","reservoirLevel"]);
 const alerts=[];

 if(!run?.startedDate){
  alerts.push({label:"Run start date not set",detail:"Add the date this run started so reports and dashboard filters work correctly.",tone:"warning"});
 }

 if(!devices.length){
  alerts.push({label:"No devices in this run",detail:"Add the iDoo, wall garden, aero unit, or other device used for this run.",tone:"danger"});
 }

 if(totalPods&&filledPods<totalPods){
  alerts.push({label:`${totalPods-filledPods} pods still open`,detail:"Drag matching-growth-rate seeds into the remaining pods.",tone:"info"});
 }

 if(phLevel!==null&&(phLevel<5.5||phLevel>6.8)){
  alerts.push({label:"pH outside common hydro range",detail:`Current pH average is ${phLevel}.`,tone:"danger"});
 }

 if(waterLevel!==null&&waterLevel<35){
  alerts.push({label:"Low water level",detail:`Average reservoir reading is ${waterLevel}%.`,tone:"danger"});
 }

 if(!alerts.length){
  alerts.push({label:"Run looks ready",detail:"Pods, dates, and device records are in good shape.",tone:"success"});
 }

 return alerts.slice(0,4);
};

const getHydroActivityItems=(run,devices)=>{
 const podActivities=devices.flatMap(device=>{
  return (device.pods||[])
   .filter(pod=>getObjectId(pod.seed))
   .map(pod=>({
    title:`${getSeedName(pod.seed)} placed in ${device.name}`,
    meta:`Pod ${pod.position} • Started ${formatDisplayDate(pod.plantedDate||run?.startedDate)}`
   }));
 });

 return [
  run?.startedDate?{title:"Run started",meta:formatDisplayDate(run.startedDate)}:null,
  ...podActivities
 ].filter(Boolean).slice(0,5);
};

const getHydroChartPoints=devices=>{
 const filledPods=getFilledPodCount(devices);
 const totalPods=devices.reduce((total,device)=>total+Number(device.podCount||0),0);
 const base=totalPods ? Math.max(12,Math.round((filledPods/totalPods)*100)) : 12;

 return [
  Math.max(8,base-22),
  Math.max(12,base-14),
  Math.max(16,base-9),
  Math.max(20,base-4),
  Math.min(100,base),
  Math.min(100,base+7)
 ];
};

const buildHydroChartPolyline=points=>{
 const max=Math.max(...points,100);
 return points.map((point,index)=>{
  const x=12+index*31;
  const y=102-((point/max)*72);
  return `${x},${y}`;
 }).join(" ");
};

export default function HydroSystemsPage({user}){
 const navigate=useNavigate();
 const [searchParams]=useSearchParams();
 const gardenId=searchParams.get("garden")||"";
 const requestedRunId=searchParams.get("run")||"";
 const returnTo=searchParams.get("returnTo")||(gardenId?`/gardens/${gardenId}`:"");
 const [runs,setRuns]=useState([]);
 const [seeds,setSeeds]=useState([]);
 const [equipment,setEquipment]=useState([]);
 const [selectedType,setSelectedType]=useState("hydroponic");
 const [selectedGrowthRate,setSelectedGrowthRate]=useState("all");
 const [selectedMatchSeedId,setSelectedMatchSeedId]=useState("");
 const [selectedRunId,setSelectedRunId]=useState("");
 const [devices,setDevices]=useState([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [showRunModal,setShowRunModal]=useState(false);
 const [showRunEditModal,setShowRunEditModal]=useState(false);
 const [showDeviceModal,setShowDeviceModal]=useState(false);
 const [showLibraryDeviceModal,setShowLibraryDeviceModal]=useState(false);
 const [libraryDeviceTarget,setLibraryDeviceTarget]=useState("run");
 const [editingDeviceId,setEditingDeviceId]=useState("");
 const [runForm,setRunForm]=useState(defaultRunForm);
 const [deviceForm,setDeviceForm]=useState(defaultDeviceForm);
 const [libraryDeviceForm,setLibraryDeviceForm]=useState(defaultLibraryDeviceForm);

 const selectedRun=useMemo(()=>{
  return runs.find(run=>getObjectId(run)===selectedRunId)||null;
 },[runs,selectedRunId]);

 const filteredRuns=useMemo(()=>{
  return runs.filter(run=>selectedType==="all"||run.systemType===selectedType||normalizeRunDevices(run).some(device=>device.systemType===selectedType));
 },[runs,selectedType]);

 const sortedSeeds=useMemo(()=>{
  return sortItems(seeds,getSeedName);
 },[seeds]);

 const growthRateOptions=useMemo(()=>{
  const optionMap=new Map();

  sortedSeeds.forEach(seed=>{
   const value=getSeedGrowthRateValue(seed);
   const label=getSeedGrowthRateLabel(seed);

   if(value&&label&&!optionMap.has(value)){
    optionMap.set(value,{value,label});
   }
  });

  return sortItems([...optionMap.values()],item=>item.label);
 },[sortedSeeds]);

 const assignedSeedIds=useMemo(()=>{
  return new Set(
   devices
    .flatMap(device=>device.pods||[])
    .map(pod=>getObjectId(pod.seed))
    .filter(Boolean)
  );
 },[devices]);

 const selectedMatchSeed=useMemo(()=>{
  return sortedSeeds.find(seed=>getObjectId(seed)===selectedMatchSeedId)||null;
 },[sortedSeeds,selectedMatchSeedId]);

 const availableSeedMatches=useMemo(()=>{
  const tierOrder={reference:0,match:1,review:2,avoid:3,unrated:4};
  return sortedSeeds.filter(seed=>{
   const seedId=getObjectId(seed);
   const growthRateMatches=selectedGrowthRate==="all"||getSeedGrowthRateValue(seed)===selectedGrowthRate;

   return !assignedSeedIds.has(seedId)&&growthRateMatches&&seedId!==selectedMatchSeedId;
  }).map(seed=>({
   seed,
   compatibility:getSeedCompatibility(selectedMatchSeed,seed)
  })).sort((a,b)=>{
   const tierDifference=tierOrder[a.compatibility.tier]-tierOrder[b.compatibility.tier];
   if(tierDifference)return tierDifference;
   return getSeedName(a.seed).localeCompare(getSeedName(b.seed));
  });
 },[sortedSeeds,assignedSeedIds,selectedGrowthRate,selectedMatchSeed,selectedMatchSeedId]);

 const totalPods=useMemo(()=>{
  return devices.reduce((total,device)=>total+Number(device.podCount||0),0);
 },[devices]);

 useEffect(()=>{
  let ignore=false;

  const loadData=async()=>{
   try{
    setLoading(true);
    setError("");

    const [systemsRes,seedsRes,equipmentRes]=await Promise.all([
     fetch(gardenId?`/api/hydro-systems?garden=${gardenId}`:"/api/hydro-systems"),
     fetch("/api/seeds"),
     fetch("/api/equipment")
    ]);

    const systemsData=await systemsRes.json().catch(()=>[]);
    const seedsData=await seedsRes.json().catch(()=>[]);
    const equipmentData=await equipmentRes.json().catch(()=>[]);

    if(!systemsRes.ok)throw new Error(systemsData.message||"Failed to load hydro runs");
    if(!seedsRes.ok)throw new Error(seedsData.message||"Failed to load seeds");
    if(!equipmentRes.ok)throw new Error(equipmentData.message||"Failed to load equipment");

    if(ignore)return;

    const nextRuns=Array.isArray(systemsData) ? systemsData : [];
    const nextSeeds=Array.isArray(seedsData) ? seedsData : [];
    const nextEquipment=Array.isArray(equipmentData) ? equipmentData : [];

    setRuns(nextRuns);
    setSeeds(nextSeeds);
    setEquipment(nextEquipment);

    if(nextRuns.length){
     const preferred=nextRuns.find(run=>getObjectId(run)===requestedRunId)||nextRuns.find(run=>run.systemType===selectedType)||nextRuns[0];
     setSelectedRunId(getObjectId(preferred));
    }
   }catch(err){
    if(!ignore)setError(err.message||"Failed to load hydroponic runs");
   }finally{
    if(!ignore)setLoading(false);
   }
  };

  loadData();

  return()=>{
   ignore=true;
  };
 },[]);

 useEffect(()=>{
  if(!selectedRun){
   setDevices([]);
   setSelectedMatchSeedId("");
   setSelectedGrowthRate("all");
   return;
  }

  setDevices(normalizeRunDevices(selectedRun));
  setSelectedMatchSeedId("");
  setSelectedGrowthRate("all");
 },[selectedRun]);

 useEffect(()=>{
  if(selectedMatchSeedId)return;
  const firstPlacedSeed=devices.flatMap(device=>device.pods||[]).find(pod=>getObjectId(pod.seed))?.seed;
  if(firstPlacedSeed){
   setSelectedMatchSeedId(getObjectId(firstPlacedSeed));
   setSelectedGrowthRate(getSeedGrowthRateValue(firstPlacedSeed)||"all");
  }
 },[devices,selectedMatchSeedId]);

 useEffect(()=>{
  if(!filteredRuns.length){
   setSelectedRunId("");
   return;
  }

  if(!filteredRuns.some(run=>getObjectId(run)===selectedRunId)){
   setSelectedRunId(getObjectId(filteredRuns[0]));
  }
 },[filteredRuns,selectedRunId]);

 const handleRunFormChange=e=>{
  const {name,value,type}=e.target;
  setRunForm(prev=>{
   if(name==="equipment"){
    const selectedEquipment=equipment.find(item=>getObjectId(item)===value);
    return selectedEquipment?{...prev,...getEquipmentDeviceValues(selectedEquipment)}:{...prev,equipment:""};
   }

   return {...prev,[name]:type==="number" ? Number(value) : value};
  });
 };

 const handleDeviceFormChange=e=>{
  const {name,value,type}=e.target;
  setDeviceForm(prev=>{
   if(name==="equipment"){
    const selectedEquipment=equipment.find(item=>getObjectId(item)===value);
    return selectedEquipment?{...prev,...getEquipmentDeviceValues(selectedEquipment)}:{...prev,equipment:""};
   }

   return {...prev,[name]:type==="number" ? Number(value) : value};
  });
 };

 const handleLibraryDeviceFormChange=e=>{
  const {name,value,type}=e.target;
  setLibraryDeviceForm(prev=>({...prev,[name]:type==="number"?Number(value):value}));
 };

 const openAddLibraryDevice=target=>{
  setLibraryDeviceTarget(target);
  setLibraryDeviceForm({
   ...defaultLibraryDeviceForm,
   systemType:target==="run"?runForm.systemType:deviceForm.systemType
  });
  if(target==="run")setShowRunModal(false);
  else setShowDeviceModal(false);
  setShowLibraryDeviceModal(true);
 };

 const closeLibraryDeviceModal=()=>{
  setShowLibraryDeviceModal(false);
  if(libraryDeviceTarget==="run")setShowRunModal(true);
  else setShowDeviceModal(true);
 };

 const handleCreateLibraryDevice=async e=>{
  e.preventDefault();
  try{
   setSaving(true);
   setError("");
   const res=await fetch("/api/equipment",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({...libraryDeviceForm,createdBy:getObjectId(user)})
   });
   const data=await res.json().catch(()=>({}));
   if(!res.ok)throw new Error(data.message||"Failed to save device");

   setEquipment(prev=>sortItems([...prev,data],getEquipmentLabel));
   const values=getEquipmentDeviceValues(data);
   if(libraryDeviceTarget==="run")setRunForm(prev=>({...prev,...values}));
   else setDeviceForm(prev=>({...prev,...values}));
   setShowLibraryDeviceModal(false);
   if(libraryDeviceTarget==="run")setShowRunModal(true);
   else setShowDeviceModal(true);
   setSuccess(`${data.name} was added to the device list.`);
  }catch(err){
   setError(err.message||"Failed to save device");
  }finally{
   setSaving(false);
  }
 };

 const handleMatchSeedChange=e=>{
  const seedId=e.target.value;
  const seed=sortedSeeds.find(item=>getObjectId(item)===seedId);
  setSelectedMatchSeedId(seedId);
  setSelectedGrowthRate(seed?getSeedGrowthRateValue(seed)||"all":"all");
 };

 const openAddRunModal=()=>{
  const systemType=selectedType==="all" ? "hydroponic" : selectedType;
  setRunForm({
   ...defaultRunForm,
   systemType,
   startedDate:formatDateForInput(new Date())
  });
  setShowRunModal(true);
 };

const openAddDeviceModal=()=>{
  setEditingDeviceId("");
  setDeviceForm({
   ...defaultDeviceForm,
   systemType:selectedRun?.systemType||(selectedType==="all" ? "hydroponic" : selectedType)
  });
  setShowDeviceModal(true);
 };

 const openEditRunModal=()=>{
  if(!selectedRun)return;

  setRunForm({
   ...defaultRunForm,
   name:selectedRun.name||"",
   systemType:selectedRun.systemType||"hydroponic",
   startedDate:formatDateForInput(selectedRun.startedDate),
   notes:selectedRun.notes||""
  });
  setShowRunEditModal(true);
 };

 const openEditDeviceModal=device=>{
  setEditingDeviceId(device._id);
  setDeviceForm({
   equipment:getObjectId(device.equipment),
   name:device.name||"",
   systemType:device.systemType||"hydroponic",
   brand:device.brand||"",
   model:device.model||"",
   serialNumber:device.serialNumber||"",
   productUrl:device.productUrl||"",
   location:device.location||"",
   podCount:device.podCount||0,
   reservoirCapacity:device.reservoirCapacity||"",
   lightType:normalizeLightType(device.lightType),
   pumpType:device.pumpType||"",
   waterLevel:device.waterLevel??"",
   phLevel:device.phLevel??"",
   temperature:device.temperature??"",
   nutrientsLevel:device.nutrientsLevel??"",
   lastReadingAt:formatDateForInput(device.lastReadingAt),
   notes:device.notes||""
  });
  setShowDeviceModal(true);
 };

 const handleCreateRun=async e=>{
  e.preventDefault();

  try{
   setSaving(true);
   setError("");
   setSuccess("");

   const payload={
    name:runForm.name,
    garden:gardenId||null,
    systemType:runForm.systemType,
    startedDate:runForm.startedDate,
    notes:runForm.notes,
    createdBy:getObjectId(user),
    devices:[
     {
      name:runForm.deviceName||runForm.name,
      systemType:runForm.systemType,
      equipment:runForm.equipment||null,
      brand:runForm.brand,
      model:runForm.model,
      serialNumber:runForm.serialNumber,
      productUrl:runForm.productUrl,
      location:runForm.location,
      podCount:runForm.podCount,
      reservoirCapacity:runForm.reservoirCapacity,
      lightType:normalizeLightType(runForm.lightType),
      pumpType:runForm.pumpType,
      waterLevel:runForm.waterLevel===""?null:Number(runForm.waterLevel),
      phLevel:runForm.phLevel===""?null:Number(runForm.phLevel),
      temperature:runForm.temperature===""?null:Number(runForm.temperature),
      nutrientsLevel:runForm.nutrientsLevel===""?null:Number(runForm.nutrientsLevel),
      lastReadingAt:runForm.lastReadingAt||null,
      notes:runForm.deviceNotes
     }
    ]
   };

   const res=await fetch("/api/hydro-systems",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to create hydro run");

   setRuns(prev=>sortItems([...prev,data],item=>item.name||""));
   setSelectedType(data.systemType||"hydroponic");
   setSelectedRunId(getObjectId(data));
   setShowRunModal(false);
   setSuccess(`${data.name} was added.`);
   if(returnTo)navigate(returnTo);
  }catch(err){
   setError(err.message||"Failed to create hydro run");
  }finally{
   setSaving(false);
  }
 };

 const handleAddDevice=async e=>{
  e.preventDefault();
  if(!selectedRun)return;

  const nextDevices=[
   ...devices,
   normalizeDevice({
    ...deviceForm,
    pods:[]
   })
  ];

  await saveDevices(nextDevices,`${deviceForm.name} was added to this run.`);
  setShowDeviceModal(false);
 };

 const handleEditRun=async e=>{
  e.preventDefault();
  if(!selectedRun)return;

  try{
   setSaving(true);
   setError("");
   setSuccess("");

   const payload={
    ...selectedRun,
   name:runForm.name,
   systemType:runForm.systemType,
   startedDate:runForm.startedDate||null,
   lightType:normalizeLightType(selectedRun.lightType),
   notes:runForm.notes,
    devices:devices.map(device=>serializeDevice(device))
   };

   const res=await fetch(`/api/hydro-systems/${getObjectId(selectedRun)}`,{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to update hydro run");

   setRuns(prev=>prev.map(run=>getObjectId(run)===getObjectId(data) ? data : run));
   setSelectedType(data.systemType||"hydroponic");
   setSelectedRunId(getObjectId(data));
   setDevices(normalizeRunDevices(data));
   setShowRunEditModal(false);
   setSuccess(`${data.name} was updated.`);
  }catch(err){
   setError(err.message||"Failed to update hydro run");
  }finally{
   setSaving(false);
  }
 };

 const handleDeleteRun=async()=>{
  if(!selectedRun)return;
  const runName=selectedRun.name||"this hydro run";
  if(!window.confirm(`Delete ${runName}? This permanently removes the run, devices, and pod assignments.`))return;

  try{
   setSaving(true);
   setError("");
   setSuccess("");

   const runId=getObjectId(selectedRun);
   const res=await fetch(`/api/hydro-systems/${runId}`,{method:"DELETE"});
   const data=await res.json().catch(()=>({}));
   if(!res.ok)throw new Error(data.message||"Failed to delete hydro run");

   const remainingRuns=runs.filter(run=>getObjectId(run)!==runId);
   const nextRun=remainingRuns.find(run=>selectedType==="all"||run.systemType===selectedType)||remainingRuns[0]||null;

   setRuns(remainingRuns);
   setSelectedRunId(getObjectId(nextRun));
   setDevices(nextRun?normalizeRunDevices(nextRun):[]);
   setSelectedMatchSeedId("");
   setSelectedGrowthRate("all");
   setSuccess(`${runName} was deleted.`);
  }catch(err){
   setError(err.message||"Failed to delete hydro run");
  }finally{
   setSaving(false);
  }
 };

 const handleSaveDevice=async e=>{
  e.preventDefault();
  if(!selectedRun)return;

  const existing=devices.find(device=>device._id===editingDeviceId);
  const nextDevice=normalizeDevice({
   ...existing,
   ...deviceForm,
   _id:editingDeviceId||undefined,
   equipment:equipment.find(item=>getObjectId(item)===deviceForm.equipment)||deviceForm.equipment||null,
   pods:buildPods(deviceForm.podCount,existing?.pods||[])
  });

  const nextDevices=editingDeviceId
   ?devices.map(device=>device._id===editingDeviceId ? nextDevice : device)
   :[...devices,nextDevice];

  await saveDevices(nextDevices,`${nextDevice.name} was saved.`);
  setEditingDeviceId("");
  setShowDeviceModal(false);
 };

 const handleDragStart=(e,seed)=>{
  e.dataTransfer.setData("application/x-seed-id",getObjectId(seed));
  e.dataTransfer.effectAllowed="copy";
 };

 const handlePodDrop=(e,deviceId,podPosition)=>{
  e.preventDefault();

  const seedId=e.dataTransfer.getData("application/x-seed-id");
  const seed=seeds.find(item=>getObjectId(item)===seedId);

  if(!seed)return;
  if(!selectedMatchSeedId){
   setSelectedMatchSeedId(seedId);
   setSelectedGrowthRate(getSeedGrowthRateValue(seed)||"all");
  }

  setDevices(prev=>prev.map(device=>device._id===deviceId ? {
   ...device,
   pods:device.pods.map(pod=>pod.position===podPosition ? {
    ...pod,
    seed,
    plantedDate:pod.plantedDate||formatDateForInput(selectedRun?.startedDate)||formatDateForInput(new Date())
   } : pod)
  } : device));
 };

 const updatePodDate=(deviceId,position,value)=>{
  setDevices(prev=>prev.map(device=>device._id===deviceId ? {
   ...device,
   pods:device.pods.map(pod=>pod.position===position ? {...pod,plantedDate:value||null} : pod)
  } : device));
 };

 const clearPod=(deviceId,position)=>{
  setDevices(prev=>prev.map(device=>device._id===deviceId ? {
   ...device,
   pods:device.pods.map(pod=>pod.position===position ? {...pod,seed:null,plantedDate:null,notes:""} : pod)
  } : device));
 };

 const clearAllPods=()=>{
  setDevices(prev=>prev.map(device=>({
   ...device,
   pods:device.pods.map(pod=>({...pod,seed:null,plantedDate:null,notes:""}))
  })));
 };

 const resetPods=()=>{
  setDevices(normalizeRunDevices(selectedRun));
 };

 const removeDevice=deviceId=>{
  setDevices(prev=>prev.filter(device=>device._id!==deviceId));
 };

 const saveDevices=async(nextDevices=devices,message="Pod assignments saved.")=>{
  if(!selectedRun)return;

  try{
   setSaving(true);
   setError("");
   setSuccess("");

   const payload={
    devices:nextDevices.map(serializeDevice)
   };

   const res=await fetch(`/api/hydro-systems/${getObjectId(selectedRun)}/pods`,{
    method:"PATCH",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json().catch(()=>({}));

   if(!res.ok)throw new Error(data.message||"Failed to save hydro run");

   setRuns(prev=>prev.map(run=>getObjectId(run)===getObjectId(data) ? data : run));
   setSelectedRunId(getObjectId(data));
   setDevices(normalizeRunDevices(data));
   setSuccess(message);
  }catch(err){
   setError(err.message||"Failed to save hydro run");
  }finally{
   setSaving(false);
  }
 };

 return(
 <section className="hydro-page">
   {returnTo&&<Button as={Link} to={returnTo} variant="link" className="hydro-garden-back"><ArrowLeft size={16}/> Back to Garden</Button>}
   <header className="hydro-header">
    <div>
     <p className="hydro-kicker">Hydroponic Systems</p>
     <h1>Hydro Runs, Devices & Seed Placement</h1>
     <p>Create one growing run, add every device in that run, then drag seeds into each device pod.</p>
    </div>

    <Button type="button" onClick={openAddRunModal} className="hydro-add-button">
     <Plus size={18}/>
     Add Run
    </Button>
   </header>

   {error&&(
    <Alert variant="danger" dismissible onClose={()=>setError("")}>{error}</Alert>
   )}

   {success&&(
    <Alert variant="success" dismissible onClose={()=>setSuccess("")}>{success}</Alert>
   )}

   {loading ? (
    <div className="hydro-loading">
     <Spinner animation="border" size="sm"/>
     Loading hydro runs...
    </div>
   ) : (
    <>
    <HydroOverviewDashboard
     selectedRun={selectedRun}
     devices={devices}
     totalPods={totalPods}
    />

    <div className="hydro-grid">
     <aside className="hydro-sidebar">
      <Card className="hydro-card">
       <Card.Header>System Type</Card.Header>
       <Card.Body>
        <SortedSelect
         value={selectedType}
         onChange={e=>setSelectedType(e.target.value)}
         options={[{value:"all",label:"All Systems"},...systemTypes]}
         getValue={item=>item.value}
         getLabel={item=>item.label}
         includePlaceholder={false}
        />
       </Card.Body>
      </Card>

      <Card className="hydro-card">
       <Card.Header>Runs</Card.Header>
       <Card.Body>
        <SortedList
         items={filteredRuns}
         getKey={item=>getObjectId(item)}
         getLabel={item=>item.name||""}
         className="hydro-system-list"
         renderItem={run=>(
          <button
           type="button"
           className={`hydro-system-button${getObjectId(run)===selectedRunId?" active":""}`}
           onClick={()=>setSelectedRunId(getObjectId(run))}
          >
           <span className="hydro-system-name">{run.name}</span>
           <span className="hydro-system-meta">
            {getSystemTypeLabel(run.systemType)} • {normalizeRunDevices(run).length} devices • {run.podCount||0} pods
           </span>
           <span className="hydro-system-meta">
            Started: {formatDisplayDate(run.startedDate)}
           </span>
          </button>
         )}
        >
         <div className="hydro-empty">No runs for this system type yet.</div>
        </SortedList>
       </Card.Body>
      </Card>
     </aside>

     <main className="hydro-board">
      <Card className="hydro-card hydro-device-card">
       <Card.Body>
        {selectedRun ? (
         <>
          <div className="hydro-device-head">
           <div>
            <p className="hydro-kicker">{getSystemTypeLabel(selectedRun.systemType)}</p>
            <h2>{selectedRun.name}</h2>
            <p className="hydro-started-date">Started: {formatDisplayDate(selectedRun.startedDate)}</p>
           </div>

           <div className="hydro-device-stats">
            <span>{totalPods}</span>
            <small>Pods</small>
           </div>
          </div>

          <div className="hydro-toolbar">
           <Button type="button" variant="outline-primary" size="sm" onClick={openAddDeviceModal}>
            <Plus size={16}/>
            Add Device To Run
           </Button>

           <Button type="button" variant="outline-primary" size="sm" onClick={openEditRunModal}>
            <Pencil size={16}/>
            Edit Run
           </Button>

           <Button type="button" variant="outline-danger" size="sm" onClick={handleDeleteRun} disabled={saving}>
            <Trash2 size={16}/>
            Delete Run
           </Button>

           <Button type="button" variant="outline-secondary" size="sm" onClick={resetPods}>
            <Undo2 size={16}/>
            Reset
           </Button>

           <Button type="button" variant="outline-danger" size="sm" onClick={clearAllPods}>
            <Trash2 size={16}/>
            Clear Pods
           </Button>

           <Button type="button" size="sm" onClick={()=>saveDevices()} disabled={saving||!devices.length}>
            <Save size={16}/>
            {saving?"Saving...":"Save Run Layout"}
           </Button>
          </div>

          <div className="hydro-device-stack">
           {devices.map(device=>(
            <section key={device._id} className="hydro-device-section">
             <div className="hydro-device-section-head">
              <div>
               <p className="hydro-kicker">{getSystemTypeLabel(device.systemType)}</p>
               <h3>{device.name}</h3>
               <p>{[getEquipmentLabel(device.equipment),getVendorLabel(device.equipment?.vendor),device.brand,device.model,device.serialNumber?`Serial ${device.serialNumber}`:"",device.location].filter(Boolean).join(" • ")||"No device details listed."}</p>
              </div>

              <div className="hydro-device-actions">
               {device.productUrl&&(
               <a href={device.productUrl} target="_blank" rel="noreferrer" className="hydro-product-link">
                Product Link
               </a>
              )}
              <Button type="button" variant="outline-primary" size="sm" onClick={()=>openEditDeviceModal(device)}>
               <Pencil size={15}/>
               Edit Device
              </Button>
              <span>{device.podCount} pods</span>
               {devices.length>1&&(
                <Button type="button" variant="outline-danger" size="sm" onClick={()=>removeDevice(device._id)}>
                 Remove
                </Button>
               )}
              </div>
             </div>

             <div className="hydro-pod-grid">
              {device.pods.map(pod=>(
               <div
                key={pod.position}
                className={`hydro-pod${pod.seed?" filled":""}`}
                onDragOver={e=>e.preventDefault()}
                onDrop={e=>handlePodDrop(e,device._id,pod.position)}
               >
                <div className="hydro-pod-number">{pod.position}</div>

                {pod.seed ? (
                 <div className="hydro-pod-seed">
                  <Leaf size={18}/>
                  <strong>{getSeedName(pod.seed)}</strong>
                  <span>{getSeedMeta(pod.seed)||"Assigned seed"}</span>
                  <label className="hydro-pod-date">
                   <small>Started</small>
                   <input
                    type="date"
                    value={formatDateForInput(pod.plantedDate)}
                    onChange={e=>updatePodDate(device._id,pod.position,e.target.value)}
                   />
                  </label>
                  <button type="button" onClick={()=>clearPod(device._id,pod.position)}>Clear</button>
                 </div>
                ) : (
                 <div className="hydro-pod-empty">
                  <Droplets size={20}/>
                  Drop seed here
                 </div>
                )}
               </div>
              ))}
             </div>
            </section>
           ))}
          </div>
         </>
        ) : (
         <div className="hydro-empty hydro-empty-large">
          Add or select a run to start assigning seeds to pods.
         </div>
        )}
       </Card.Body>
      </Card>
     </main>

     <aside className="hydro-seed-tray">
     <Card className="hydro-card">
       <Card.Header>Seeds</Card.Header>
       <Card.Body>
        <div className="hydro-seed-filter">
         <label htmlFor="hydro-match-seed">Match Against Seed</label>
         <SortedSelect
          id="hydro-match-seed"
          value={selectedMatchSeedId}
          onChange={handleMatchSeedChange}
          options={sortedSeeds}
          getValue={seed=>getObjectId(seed)}
          getLabel={getSeedName}
          placeholder="Select the first seed"
         />
         {selectedMatchSeed?(
          <div
           className="hydro-match-reference is-draggable"
           draggable
           onDragStart={e=>handleDragStart(e,selectedMatchSeed)}
           title="Drag this seed to a pod"
          >
           <span className="hydro-match-reference-title">
            <Grip size={16}/>
            <strong>{getSeedName(selectedMatchSeed)}</strong>
           </span>
           <span>Growth: {getSeedGrowthRateLabel(selectedMatchSeed)||"Not recorded"}</span>
           <span>pH: {formatPhRange(getSeedPhRange(selectedMatchSeed))}</span>
           <span>Nutrients/EC: Not recorded</span>
           <small>Drag this starting seed to a pod.</small>
          </div>
         ):(
          <small>Select a seed to see which seeds are safer to share this reservoir.</small>
         )}

         <label htmlFor="hydro-growth-rate-filter">Growth Rate</label>
         <SortedSelect
          id="hydro-growth-rate-filter"
          value={selectedGrowthRate}
          onChange={e=>setSelectedGrowthRate(e.target.value)}
          options={[{value:"all",label:"All Growth Rates"},...growthRateOptions]}
          getValue={item=>item.value}
          getLabel={item=>item.label}
          includePlaceholder={false}
         />
         <small>
          {selectedGrowthRate==="all"
           ?"Showing all unassigned seeds."
           :`Showing unassigned seeds marked ${growthRateOptions.find(item=>item.value===selectedGrowthRate)?.label||"this growth rate"}.`}
         </small>
        </div>

        <div className="hydro-seed-list">
         {availableSeedMatches.length ? availableSeedMatches.map(({seed,compatibility})=>(
          <div
           key={getObjectId(seed)}
           className={`hydro-seed-chip compatibility-${compatibility.tier}`}
           draggable
           onDragStart={e=>handleDragStart(e,seed)}
          >
           <Grip size={16}/>
           <span>
            <span className="hydro-seed-chip-title">
             <strong>{getSeedName(seed)}</strong>
             {selectedMatchSeed&&(
              <em className={`hydro-compatibility-badge ${compatibility.tier}`}>
               {compatibility.tier==="reference"?"Starting Seed":compatibility.tier==="match"?"Strong Match":compatibility.tier==="avoid"?"Avoid":"Review"}
              </em>
             )}
            </span>
            <small>Growth: {getSeedGrowthRateLabel(seed)||"Not recorded"}</small>
            <small>pH: {formatPhRange(getSeedPhRange(seed))}</small>
            <small>Nutrients/EC: Not recorded</small>
           </span>
          </div>
         )) : (
          <div className="hydro-empty">No unassigned seeds match the selected filters.</div>
         )}
        </div>
       </Card.Body>
      </Card>
     </aside>
    </div>
    </>
   )}

   <RunModal
    show={showRunModal}
    saving={saving}
    formData={runForm}
   equipment={equipment}
   onChange={handleRunFormChange}
   onAddNewDevice={()=>openAddLibraryDevice("run")}
   onSubmit={handleCreateRun}
   onHide={()=>setShowRunModal(false)}
   />

   <RunEditModal
    show={showRunEditModal}
    saving={saving}
    formData={runForm}
    onChange={handleRunFormChange}
    onSubmit={handleEditRun}
    onHide={()=>setShowRunEditModal(false)}
   />

   <DeviceModal
    show={showDeviceModal}
    saving={saving}
    formData={deviceForm}
    equipment={equipment}
    editing={!!editingDeviceId}
    onChange={handleDeviceFormChange}
    onAddNewDevice={()=>openAddLibraryDevice("device")}
    onSubmit={editingDeviceId?handleSaveDevice:handleAddDevice}
    onHide={()=>{
     setEditingDeviceId("");
     setShowDeviceModal(false);
    }}
   />

   <NewLibraryDeviceModal
    show={showLibraryDeviceModal}
    saving={saving}
    formData={libraryDeviceForm}
    onChange={handleLibraryDeviceFormChange}
    onSubmit={handleCreateLibraryDevice}
    onHide={closeLibraryDeviceModal}
   />
  </section>
 );
}

function HydroOverviewDashboard({selectedRun,devices=[],totalPods=0}){
 const filledPods=getFilledPodCount(devices);
 const waterLevel=getAverageMetric(devices,["waterLevel","waterPercent","reservoirLevel"]);
 const phLevel=getAverageMetric(devices,["phLevel","ph","waterPh"]);
 const temperature=getAverageMetric(devices,["temperature","temperatureC","waterTemperature"]);
 const alerts=getHydroAlertItems(selectedRun,devices);
 const activities=getHydroActivityItems(selectedRun,devices);
 const chartPoints=getHydroChartPoints(devices);
 const chartLine=buildHydroChartPolyline(chartPoints);
 const plantedPercent=totalPods ? Math.round((filledPods/totalPods)*100) : 0;

 return(
  <section className="hydro-overview">
   <div className="hydro-overview-hero">
    <div className="hydro-overview-copy">
     <p className="hydro-kicker">Run Overview</p>
     <h2>{selectedRun?.name||"Select a hydro run"}</h2>
     <p>
      {selectedRun
       ?`Started ${formatDisplayDate(selectedRun.startedDate)} • ${devices.length} device${devices.length===1?"":"s"} • ${filledPods}/${totalPods||0} pods planted`
       :"Choose a run to see sensor readings, alerts, pod activity, and active containers."}
     </p>
    </div>

    <div className="hydro-overview-metrics">
     <MetricTile label="Water" value={formatMetric(waterLevel,"%")} icon={<Droplets size={18}/>}/>
     <MetricTile label="pH Level" value={formatMetric(phLevel," pH")} icon={<Activity size={18}/>}/>
     <MetricTile label="Temperature" value={formatMetric(temperature,"°F")} icon={<Thermometer size={18}/>}/>
     <MetricTile label="Pods Planted" value={`${plantedPercent}%`} icon={<Leaf size={18}/>}/>
    </div>
   </div>

   <div className="hydro-overview-panels">
    <article className="hydro-overview-panel hydro-analytics-panel">
     <div className="hydro-panel-head">
      <h3>Growth Analytics</h3>
      <span>{filledPods}/{totalPods||0} pods</span>
     </div>

     <svg className="hydro-mini-chart" viewBox="0 0 190 120" role="img" aria-label="Hydro growth trend">
      <path d="M12 102 H178 M12 78 H178 M12 54 H178 M12 30 H178" className="hydro-chart-grid"/>
      <polyline points={chartLine} className="hydro-chart-line"/>
      <circle cx="136" cy="47" r="5" className="hydro-chart-dot"/>
     </svg>

     <div className="hydro-analytics-foot">
      <span>Seeded pods</span>
      <strong>{plantedPercent}%</strong>
     </div>
    </article>

    <article className="hydro-overview-panel hydro-alert-panel">
     <div className="hydro-panel-head">
      <h3>Critical Alerts</h3>
      <span>{alerts.length}</span>
     </div>

     <div className="hydro-alert-list">
      {alerts.map((alert,index)=>(
       <div key={`${alert.label}-${index}`} className={`hydro-alert-item ${alert.tone}`}>
        <AlertTriangle size={17}/>
        <span>
         <strong>{alert.label}</strong>
         <small>{alert.detail}</small>
        </span>
       </div>
      ))}
     </div>
    </article>

    <article className="hydro-overview-panel hydro-activity-panel">
     <div className="hydro-panel-head">
      <h3>Activity Overview</h3>
      <span>{activities.length}</span>
     </div>

     <div className="hydro-activity-list">
      {activities.length ? activities.map((activity,index)=>(
       <div key={`${activity.title}-${index}`} className="hydro-activity-item">
        <span className="hydro-activity-dot"/>
        <span>
         <strong>{activity.title}</strong>
         <small>{activity.meta}</small>
        </span>
       </div>
      )) : (
       <div className="hydro-empty">No run activity logged yet.</div>
      )}
     </div>
    </article>
   </div>

   <article className="hydro-containers-panel">
    <div className="hydro-panel-head">
     <h3>Active Containers</h3>
     <span>{devices.length} devices</span>
    </div>

    <div className="hydro-container-table">
     <div className="hydro-container-row hydro-container-head">
      <span>Device</span>
      <span>Health</span>
      <span>Water</span>
      <span>pH</span>
      <span>Nutrients</span>
      <span>Temp</span>
      <span>Pods</span>
     </div>

     {devices.length ? devices.map(device=>{
      const deviceFilled=(device.pods||[]).filter(pod=>getObjectId(pod.seed)).length;
      return(
       <div key={device._id} className="hydro-container-row">
        <span>
         <strong>{device.name}</strong>
         <small>{device.location||getEquipmentLabel(device.equipment)||"No location listed"}</small>
        </span>
        <span>Active</span>
        <span>{formatMetric(getNumberValue(device.waterLevel,device.waterPercent,device.reservoirLevel),"%")}</span>
        <span>{formatMetric(getNumberValue(device.phLevel,device.ph,device.waterPh),"")}</span>
        <span>{formatMetric(getNumberValue(device.nutrientsLevel,device.nutrients,device.ecLevel),"%")}</span>
        <span>{formatMetric(getNumberValue(device.temperature,device.temperatureC,device.waterTemperature),"°F")}</span>
        <span>{deviceFilled}/{device.podCount||0}</span>
       </div>
      );
     }) : (
      <div className="hydro-empty">No devices have been added to this run.</div>
     )}
    </div>
   </article>
  </section>
 );
}

function MetricTile({label,value,icon}){
 return(
  <div className="hydro-metric-tile">
   <span>{icon}</span>
   <small>{label}</small>
   <strong>{value}</strong>
  </div>
 );
}

function DeviceFields({formData,onChange,equipment=[],includeRunFields=false,onAddNewDevice}){
 return(
  <Row className="g-3">
   {includeRunFields&&(
    <>
     <Col md={8}>
      <InputGroup>
       <InputGroup.Text>Run Name</InputGroup.Text>
       <Form.Control name="name" value={formData.name} onChange={onChange} required placeholder="Spring hydro run"/>
      </InputGroup>
     </Col>

     <Col md={4}>
      <InputGroup>
       <InputGroup.Text>Started</InputGroup.Text>
       <Form.Control type="date" name="startedDate" value={formData.startedDate} onChange={onChange}/>
      </InputGroup>
     </Col>
    </>
   )}

   <Col md={12}>
    <InputGroup>
     <InputGroup.Text>Device</InputGroup.Text>
     <SortedSelect
      name="equipment"
      value={formData.equipment||""}
      onChange={onChange}
      options={equipment}
      getValue={item=>getObjectId(item)}
      getLabel={getEquipmentLabel}
      placeholder="Select an existing device"
      required
     />
     <Button type="button" variant="outline-primary" onClick={onAddNewDevice}>
      <Plus size={16}/> New Device
     </Button>
    </InputGroup>
   </Col>

   <Col md={8}>
    <InputGroup>
     <InputGroup.Text>Device Name</InputGroup.Text>
     <Form.Control name={includeRunFields?"deviceName":"name"} value={includeRunFields?formData.deviceName:formData.name} readOnly placeholder="Select a device above"/>
    </InputGroup>
   </Col>

   <Col md={4}>
    <InputGroup>
     <InputGroup.Text>Pods</InputGroup.Text>
     <Form.Control type="number" min="1" name="podCount" value={formData.podCount} onChange={onChange} required/>
    </InputGroup>
   </Col>

   <Col md={6}>
    <InputGroup>
     <InputGroup.Text>Type</InputGroup.Text>
     <SortedSelect
      name="systemType"
      value={formData.systemType}
      onChange={onChange}
      options={systemTypes}
      getValue={item=>item.value}
      getLabel={item=>item.label}
      includePlaceholder={false}
     />
    </InputGroup>
   </Col>

   <Col md={3}>
    <InputGroup>
     <InputGroup.Text>Brand</InputGroup.Text>
     <Form.Control name="brand" value={formData.brand} onChange={onChange} placeholder="iDoo"/>
    </InputGroup>
   </Col>

   <Col md={3}>
    <InputGroup>
     <InputGroup.Text>Model</InputGroup.Text>
     <Form.Control name="model" value={formData.model} onChange={onChange}/>
    </InputGroup>
   </Col>

   <Col md={6}>
    <InputGroup>
     <InputGroup.Text>Serial #</InputGroup.Text>
     <Form.Control name="serialNumber" value={formData.serialNumber} onChange={onChange}/>
    </InputGroup>
   </Col>

   <Col md={12}>
    <InputGroup>
     <InputGroup.Text>Product URL</InputGroup.Text>
     <Form.Control name="productUrl" value={formData.productUrl} onChange={onChange} placeholder="https://www.amazon.com/dp/B08DLMRKHM"/>
    </InputGroup>
   </Col>

   <Col md={6}>
    <InputGroup>
     <InputGroup.Text>Location</InputGroup.Text>
     <Form.Control name="location" value={formData.location} onChange={onChange} placeholder="Kitchen counter, grow shelf, wall garden"/>
    </InputGroup>
   </Col>

   <Col md={6}>
    <InputGroup>
     <InputGroup.Text>Reservoir</InputGroup.Text>
     <Form.Control name="reservoirCapacity" value={formData.reservoirCapacity} onChange={onChange}/>
    </InputGroup>
   </Col>

   <Col md={6}>
    <InputGroup>
     <InputGroup.Text>Light</InputGroup.Text>
     <SortedSelect
      name="lightType"
      value={formData.lightType||""}
      onChange={onChange}
      options={lightTypes}
      getValue={item=>item.value}
      getLabel={item=>item.label}
      includePlaceholder={false}
     />
    </InputGroup>
   </Col>

   <Col md={6}>
    <InputGroup>
     <InputGroup.Text>Pump</InputGroup.Text>
     <Form.Control name="pumpType" value={formData.pumpType} onChange={onChange}/>
    </InputGroup>
   </Col>

   <Col md={12}>
    <div className="hydro-reading-heading">Current readings for this run</div>
   </Col>

   <Col md={3}><InputGroup><InputGroup.Text>Water %</InputGroup.Text><Form.Control type="number" min="0" max="100" step="0.1" name="waterLevel" value={formData.waterLevel} onChange={onChange}/></InputGroup></Col>
   <Col md={3}><InputGroup><InputGroup.Text>pH</InputGroup.Text><Form.Control type="number" min="0" max="14" step="0.1" name="phLevel" value={formData.phLevel} onChange={onChange}/></InputGroup></Col>
   <Col md={3}><InputGroup><InputGroup.Text>Temp °F</InputGroup.Text><Form.Control type="number" step="0.1" name="temperature" value={formData.temperature} onChange={onChange}/></InputGroup></Col>
   <Col md={3}><InputGroup><InputGroup.Text>Nutrients %</InputGroup.Text><Form.Control type="number" min="0" max="100" step="0.1" name="nutrientsLevel" value={formData.nutrientsLevel} onChange={onChange}/></InputGroup></Col>
   <Col md={6}><InputGroup><InputGroup.Text>Reading Date</InputGroup.Text><Form.Control type="date" name="lastReadingAt" value={formData.lastReadingAt} onChange={onChange}/></InputGroup></Col>

   <Col md={12}>
    <InputGroup>
     <InputGroup.Text>Notes</InputGroup.Text>
     <Form.Control as="textarea" rows={3} name={includeRunFields?"deviceNotes":"notes"} value={includeRunFields?formData.deviceNotes:formData.notes} onChange={onChange}/>
    </InputGroup>
   </Col>

   {includeRunFields&&(
    <Col md={12}>
     <InputGroup>
      <InputGroup.Text>Run Notes</InputGroup.Text>
      <Form.Control as="textarea" rows={2} name="notes" value={formData.notes} onChange={onChange}/>
     </InputGroup>
    </Col>
   )}
  </Row>
 );
}

function RunModal({show,saving,formData,equipment,onChange,onAddNewDevice,onSubmit,onHide}){
 return(
  <Modal show={show} onHide={onHide} centered size="lg">
   <Form onSubmit={onSubmit}>
    <Modal.Header closeButton>
     <Modal.Title>Add Hydro Run</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <DeviceFields formData={formData} equipment={equipment} onChange={onChange} onAddNewDevice={onAddNewDevice} includeRunFields/>
    </Modal.Body>

    <Modal.Footer>
     <Button type="button" variant="outline-secondary" onClick={onHide}>Cancel</Button>
     <Button type="submit" disabled={saving}>{saving?"Saving...":"Save Run"}</Button>
    </Modal.Footer>
   </Form>
  </Modal>
 );
}

function RunEditModal({show,saving,formData,onChange,onSubmit,onHide}){
 return(
  <Modal show={show} onHide={onHide} centered size="lg">
   <Form onSubmit={onSubmit}>
    <Modal.Header closeButton>
     <Modal.Title>Edit Hydro Run</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <Row className="g-3">
      <Col md={8}>
       <InputGroup>
        <InputGroup.Text>Run Name</InputGroup.Text>
        <Form.Control name="name" value={formData.name} onChange={onChange} required/>
       </InputGroup>
      </Col>

      <Col md={4}>
       <InputGroup>
        <InputGroup.Text>Started</InputGroup.Text>
        <Form.Control type="date" name="startedDate" value={formData.startedDate} onChange={onChange}/>
       </InputGroup>
      </Col>

      <Col md={6}>
       <InputGroup>
        <InputGroup.Text>Type</InputGroup.Text>
        <SortedSelect
         name="systemType"
         value={formData.systemType}
         onChange={onChange}
         options={systemTypes}
         getValue={item=>item.value}
         getLabel={item=>item.label}
         includePlaceholder={false}
        />
       </InputGroup>
      </Col>

      <Col md={12}>
       <InputGroup>
        <InputGroup.Text>Notes</InputGroup.Text>
        <Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={onChange}/>
       </InputGroup>
      </Col>
     </Row>
    </Modal.Body>

    <Modal.Footer>
     <Button type="button" variant="outline-secondary" onClick={onHide}>Cancel</Button>
     <Button type="submit" disabled={saving}>{saving?"Saving...":"Save Run"}</Button>
    </Modal.Footer>
   </Form>
  </Modal>
 );
}

function DeviceModal({show,saving,formData,equipment,editing,onChange,onAddNewDevice,onSubmit,onHide}){
 return(
  <Modal show={show} onHide={onHide} centered size="lg">
   <Form onSubmit={onSubmit}>
    <Modal.Header closeButton>
     <Modal.Title>{editing?"Edit Device":"Add Device To Run"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <DeviceFields formData={formData} equipment={equipment} onChange={onChange} onAddNewDevice={onAddNewDevice}/>
    </Modal.Body>

    <Modal.Footer>
     <Button type="button" variant="outline-secondary" onClick={onHide}>Cancel</Button>
     <Button type="submit" disabled={saving}>{saving?"Saving...":editing?"Save Device":"Add Device"}</Button>
    </Modal.Footer>
   </Form>
  </Modal>
 );
}

function NewLibraryDeviceModal({show,saving,formData,onChange,onSubmit,onHide}){
 return(
  <Modal show={show} onHide={onHide} centered size="lg">
   <Form onSubmit={onSubmit}>
    <Modal.Header closeButton>
     <Modal.Title>Add New Device</Modal.Title>
    </Modal.Header>

    <Modal.Body>
     <Alert variant="info">This device will be saved to your equipment list and selected for the current hydro run.</Alert>
     <Row className="g-3">
      <Col md={8}><InputGroup><InputGroup.Text>Device Name</InputGroup.Text><Form.Control name="name" value={formData.name} onChange={onChange} required placeholder="iDoo 12 Pod Kit"/></InputGroup></Col>
      <Col md={4}><InputGroup><InputGroup.Text>Pods</InputGroup.Text><Form.Control type="number" min="1" name="podCount" value={formData.podCount} onChange={onChange} required/></InputGroup></Col>
      <Col md={6}><InputGroup><InputGroup.Text>Type</InputGroup.Text><SortedSelect name="systemType" value={formData.systemType} onChange={onChange} options={systemTypes} getValue={item=>item.value} getLabel={item=>item.label} includePlaceholder={false}/></InputGroup></Col>
      <Col md={3}><InputGroup><InputGroup.Text>Brand</InputGroup.Text><Form.Control name="brand" value={formData.brand} onChange={onChange}/></InputGroup></Col>
      <Col md={3}><InputGroup><InputGroup.Text>Model</InputGroup.Text><Form.Control name="modelNumber" value={formData.modelNumber} onChange={onChange}/></InputGroup></Col>
      <Col md={6}><InputGroup><InputGroup.Text>Serial #</InputGroup.Text><Form.Control name="serialNumber" value={formData.serialNumber} onChange={onChange}/></InputGroup></Col>
      <Col md={6}><InputGroup><InputGroup.Text>Location</InputGroup.Text><Form.Control name="location" value={formData.location} onChange={onChange}/></InputGroup></Col>
      <Col md={12}><InputGroup><InputGroup.Text>Product URL</InputGroup.Text><Form.Control type="url" name="productUrl" value={formData.productUrl} onChange={onChange}/></InputGroup></Col>
      <Col md={6}><InputGroup><InputGroup.Text>Reservoir</InputGroup.Text><Form.Control name="reservoirCapacity" value={formData.reservoirCapacity} onChange={onChange}/></InputGroup></Col>
      <Col md={6}><InputGroup><InputGroup.Text>Light</InputGroup.Text><SortedSelect name="lightType" value={formData.lightType} onChange={onChange} options={lightTypes} getValue={item=>item.value} getLabel={item=>item.label} includePlaceholder={false}/></InputGroup></Col>
      <Col md={6}><InputGroup><InputGroup.Text>Pump</InputGroup.Text><Form.Control name="pumpType" value={formData.pumpType} onChange={onChange}/></InputGroup></Col>
      <Col md={12}><InputGroup><InputGroup.Text>Notes</InputGroup.Text><Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={onChange}/></InputGroup></Col>
     </Row>
    </Modal.Body>

    <Modal.Footer>
     <Button type="button" variant="outline-secondary" onClick={onHide}>Cancel</Button>
     <Button type="submit" disabled={saving}><Save size={16}/>{saving?"Saving...":"Save New Device"}</Button>
    </Modal.Footer>
   </Form>
  </Modal>
 );
}
