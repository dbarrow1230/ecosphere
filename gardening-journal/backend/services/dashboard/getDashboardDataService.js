import mongoose from "mongoose";
import Plant from "../../models/plants/plantModel.js";
import Planting from "../../models/plants/plantingModel.js";
import Garden from "../../models/gardens/gardenModel.js";
import GardenSection from "../../models/gardens/gardenSectionModel.js";
import HydroSystem from "../../models/hydroponics/hydroSystemModel.js";
import "../../models/reference/LocationTypeModel.js";
import Task from "../../models/tasks/taskModel.js";
import Seed from "../../models/seeds/seedModel.js";
import Supply from "../../models/supplies/supplyModel.js";
import "../../models/equipment/equipmentModel.js";
import "../../models/journal/dailyJournalModel.js";
import JournalEntry from "../../models/journal/journalEntryModel.js";
import Observation from "../../models/journal/observationModel.js";
import Harvest from "../../models/harvest/harvestModel.js";
import DiseaseLog from "../../models/diseases/diseaseLogModel.js";
import PestLog from "../../models/pests/pestLogModel.js";

const closedTaskStatuses=[
 "done",
 "Done",
 "complete",
 "Complete",
 "completed",
 "Completed",
 "closed",
 "Closed",
 "cancelled",
 "Cancelled",
 "canceled",
 "Canceled"
];
const closedIssueStatuses=[
 "resolved",
 "Resolved",
 "closed",
 "Closed",
 "complete",
 "Complete",
 "completed",
 "Completed",
 "lost",
 "Lost"
];

const getUserScopedQuery=(userId,field="createdBy")=>{
 if(!userId||!mongoose.Types.ObjectId.isValid(userId))return {};
 return {[field]:userId};
};

const getText=value=>{
 if(value===undefined||value===null)return "";
 if(typeof value==="string")return value;
 if(typeof value==="number")return String(value);

 if(Array.isArray(value)){
  return value.map(item=>getText(item)).filter(Boolean).join(", ");
 }

 if(typeof value==="object"){
  return value.name||
   value.title||
   value.label||
   value.commonName||
   value.plantName||
   value.scientificName||
   value.category||
   "";
 }

 return "";
};

const formatDate=value=>{
 if(!value)return "";

 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "";

 return date.toISOString().slice(0,10);
};

const getRecordStatus=item=>{
 if(item?.status)return String(item.status).trim().toLowerCase();
 if(item?.isActive===false)return "inactive";
 return "active";
};

const countBy=(items,getKey)=>{
 const counts={};

 items.forEach(item=>{
  const key=getKey(item)||"Not listed";
  counts[key]=(counts[key]||0)+1;
 });

 return Object.entries(counts)
  .map(([label,value])=>({label,value}))
  .sort((a,b)=>b.value-a.value||a.label.localeCompare(b.label));
};

const countStatusRecords=items=>{
 const counts={active:0,inactive:0,archived:0};

 items.forEach(item=>{
  const status=getRecordStatus(item);
  if(status==="archived")counts.archived+=1;
  else if(status==="inactive")counts.inactive+=1;
  else counts.active+=1;
 });

 return counts;
};

const isSameMonth=(dateValue,baseDate)=>{
 if(!dateValue)return false;
 const date=new Date(dateValue);
 if(Number.isNaN(date.getTime()))return false;
 return date.getFullYear()===baseDate.getFullYear()&&date.getMonth()===baseDate.getMonth();
};

const isOverdue=(dateValue,baseDate)=>{
 if(!dateValue)return false;
 const date=new Date(dateValue);
 if(Number.isNaN(date.getTime()))return false;
 return date < baseDate;
};

const getSupplyCategory=supply=>{
 return getText(supply.category)||
  getText(supply.type)||
  "Uncategorized";
};

const getSupplyCost=supply=>{
 const purchasePrice=Number(supply.purchasePrice||0);
 return Number.isFinite(purchasePrice) ? purchasePrice : 0;
};

const getSupplyType=supply=>{
 const category=getSupplyCategory(supply).toLowerCase();
 const type=getText(supply.type).toLowerCase();
 const name=getText(supply.name).toLowerCase();

 return category.includes("seed")||type.includes("seed")||name.includes("seed") ? "seed" : "supply";
};

const mapSupplyCost=supply=>({
 _id:supply._id,
 type:getSupplyType(supply),
 category:getSupplyCategory(supply),
 cost:getSupplyCost(supply),
 date:supply.purchaseDate||supply.createdAt
});

const mapSupplyItem=supply=>({
 _id:supply._id,
 name:getText(supply.name)||"Garden supply",
 category:getSupplyCategory(supply),
 quantity:supply.quantity,
 unit:supply.unit||"",
 vendor:getText(supply.vendor),
 location:getText(supply.location)
});

const mapTaskItem=task=>({
 _id:task._id,
 title:task.name||task.title||"Garden task",
 name:task.name||task.title||"Garden task",
 status:task.status||"",
 priority:task.priority||"",
 dueDate:formatDate(task.dueDate),
 taskDate:formatDate(task.dueDate),
 category:getText(task.category),
 section:getText(task.section)
});

const mapJournalItem=entry=>({
 _id:entry._id,
 title:entry.title||entry.entryType||"Journal entry",
 name:entry.title||entry.entryType||"Journal entry",
 entry:entry.entry||"",
 entryDate:formatDate(entry.entryDate||entry.createdAt),
 date:formatDate(entry.entryDate||entry.createdAt),
 entryType:entry.entryType||"",
 outcome:entry.outcome||"",
 maintenanceType:entry.maintenanceType||"",
 durationMinutes:entry.durationMinutes||0,
 followUpDate:formatDate(entry.followUpDate),
 tags:Array.isArray(entry.tags)?entry.tags:[],
 garden:getText(entry.garden),
 gardenSection:getText(entry.gardenSection),
 plant:getText(entry.planting),
 seed:getText(entry.seed),
 plantRecord:getText(entry.plant),
 hydroSystem:getText(entry.hydroSystem),
 equipment:getText(entry.equipment),
 category:entry.entryType||getText(entry.dailyJournal)||"Garden Journal"
});

const mapDiseaseIssue=log=>({
 _id:log._id,
 name:getText(log.disease)||"Disease issue",
 issue:getText(log.disease)||"Disease issue",
 status:log.status||"Needs review",
 severity:getText(log.severityHistory?.[log.severityHistory.length-1]?.severity),
 location:getText(log.planting?.garden)||"Garden",
 dateObserved:formatDate(log.dateObserved)
});

const mapPestIssue=log=>({
 _id:log._id,
 name:getText(log.pest)||"Pest issue",
 issue:getText(log.pest)||"Pest issue",
 status:log.status||"Needs review",
 severity:getText(log.severityHistory?.[log.severityHistory.length-1]?.severity),
 location:getText(log.planting?.garden)||"Garden",
 dateObserved:formatDate(log.dateObserved)
});

const mapDeadPlantingLifecycle=planting=>({
 _id:planting._id,
 name:getText(planting.seed)||getText(planting.plant)||planting.instanceName||"Dead plant instance",
 status:"Dead",
 reason:getText(planting.failureReason)||"Not listed",
 location:getText(planting.garden)||planting.location||"Garden",
 date:formatDate(planting.plantedDate||planting.createdAt),
 reportingDate:formatDate(planting.plantedDate||planting.createdAt),
 plantedDate:formatDate(planting.plantedDate||planting.createdAt)
});

const mapGrowingInstanceItem=planting=>({
 _id:planting._id,
 name:planting.instanceName||getText(planting.seed)||getText(planting.plant)||"Growing instance",
 source:getText(planting.seed)||getText(planting.plant)||"Not listed",
 status:planting.status||"active",
 date:formatDate(planting.plantedDate||planting.createdAt),
 reportingDate:formatDate(planting.plantedDate||planting.createdAt),
 plantedDate:formatDate(planting.plantedDate||planting.createdAt),
 expectedHarvestDate:formatDate(planting.expectedHarvestDate),
 endDate:formatDate(planting.endDate),
 deathDate:formatDate(planting.deathDate),
 location:getText(planting.garden)||planting.location||"Garden"
});

const mapHarvestItem=harvest=>{
 const planting=harvest.planting||{};
 const crop=getText(planting.plant)||getText(planting.seed)||"Harvest";
 const amount=harvest.harvestAmount||{};
 const quantity=amount.lb||amount.oz||amount.g||harvest.usableAmount||harvest.wasteAmount||"Recorded";
 const unit=amount.lb ? "lb" : amount.oz ? "oz" : amount.g ? "g" : "";

 return {
  _id:harvest._id,
  crop,
  name:crop,
  plantName:crop,
  quantity,
  unit,
  harvestDate:formatDate(harvest.harvestDate||harvest.createdAt),
  date:formatDate(harvest.harvestDate||harvest.createdAt),
  garden:getText(planting.garden)||"Garden harvest"
 };
};

const classifyEnvironmentObservation=observation=>{
 const text=[
  observation.name,
  observation.observationType,
  observation.details,
  ...(Array.isArray(observation.tags)?observation.tags:[])
 ].map(value=>String(value||"").toLowerCase()).join(" ");

 if(text.includes("moisture")||text.includes("water")||text.includes("humidity")||text.includes("soil"))
 {
  return "Moisture";
 }

 if(text.includes("light")||text.includes("sun")||text.includes("shade"))
 {
  return "Ambient Light";
 }

 if(text.includes("temp")||text.includes("heat")||text.includes("cold")||text.includes("frost"))
 {
  return "Temperature";
 }

 return "Garden Conditions";
};

const mapEnvironmentItem=observation=>({
 _id:observation._id,
 label:classifyEnvironmentObservation(observation),
 value:observation.name||observation.observationType||"Observation logged",
 helper:observation.details||getText(observation.planting)||getText(observation.garden)||getText(observation.gardenSection)||"Garden observation",
 observedAt:formatDate(observation.observedAt||observation.createdAt),
 garden:getText(observation.garden),
 planting:getText(observation.planting)
});

const buildStats=({
 plants,
 seeds,
 gardens,
 gardenSections,
 hydroSystems,
 tasks,
 harvests,
 issueCount,
 deadPlantingCount,
 today,
 nextThirtyDays
})=>{
 const plantStatus=countStatusRecords(plants);
 const seedStatus=countStatusRecords(seeds);
 const openTasks=tasks.filter(task=>task.isActive!==false&&!closedTaskStatuses.includes(task.status));
 const overdueTasks=openTasks.filter(task=>isOverdue(task.dueDate,today));
 const dueSoonTasks=openTasks.filter(task=>{
  if(!task.dueDate)return false;
  const dueDate=new Date(task.dueDate);
  return dueDate>=today&&dueDate<=nextThirtyDays;
 });
 const monthlyHarvests=harvests.filter(harvest=>isSameMonth(harvest.harvestDate||harvest.createdAt,today));
 const activeGardens=gardens.filter(garden=>garden.isActive!==false);
 const activeGardenSections=gardenSections.filter(section=>section.isActive!==false);
 const activeHydroSystems=hydroSystems.filter(system=>system.isActive!==false);
 const activeGardenTotal=activeGardens.length+activeGardenSections.length+activeHydroSystems.length;
 const gardenBreakdown=[
  {label:"Gardens",value:activeGardens.length},
  ...countBy(activeGardenSections,section=>getText(section.type)||"Garden Section"),
  ...countBy(activeHydroSystems,system=>getText(system.systemType)||"Hydro System")
 ].filter(item=>item.value>0);
 const harvestCropBreakdown=countBy(monthlyHarvests,harvest=>{
  const planting=harvest.planting||{};
  return getText(planting.plant)||getText(planting.seed)||"Harvest";
 }).slice(0,4);

 return [
  {
   label:"Plant Records",
   value:plants.length,
   breakdown:[
    {label:"Active",value:plantStatus.active,variant:"success"},
    {label:"Inactive",value:plantStatus.inactive,variant:"warning"},
    {label:"Archived",value:plantStatus.archived,variant:"danger"}
   ]
  },
  {
   label:"Growing Spaces",
   value:activeGardenTotal,
   breakdown:gardenBreakdown.length?gardenBreakdown:[{label:"No active spaces",value:0}]
  },
  {
   label:"Open Tasks",
   value:openTasks.length,
   breakdown:[
    {label:"Overdue",value:overdueTasks.length,variant:"danger"},
    {label:"Due 30 days",value:dueSoonTasks.length,variant:"warning"},
    ...countBy(openTasks,task=>task.status||"Pending").slice(0,3)
   ]
  },
  {
   label:"Harvests This Month",
   value:monthlyHarvests.length,
   breakdown:harvestCropBreakdown.length?harvestCropBreakdown:[{label:"No harvests this month",value:0}]
  },
  {
   label:"Issues",
   value:issueCount,
   breakdown:[
    {label:"Open plant issues",value:issueCount,variant:issueCount?"danger":"success"}
   ]
  },
  {
   label:"Plant Deaths",
   value:deadPlantingCount,
   breakdown:[
    {label:"Dead instances",value:deadPlantingCount,variant:deadPlantingCount?"danger":"success"}
   ]
  },
  {
   label:"Seed Records",
   value:seeds.length,
   breakdown:[
    {label:"Active",value:seedStatus.active,variant:"success"},
    {label:"Inactive",value:seedStatus.inactive,variant:"warning"},
    {label:"Archived",value:seedStatus.archived,variant:"danger"}
   ]
  }
 ];
};

const getDashboardDataService=async({userId=null,reportDate=new Date()}={})=>{
 const today=reportDate instanceof Date&&!Number.isNaN(reportDate.getTime())?reportDate:new Date();
 const nextThirtyDays=new Date(today);
 nextThirtyDays.setDate(nextThirtyDays.getDate()+30);
 const createdByQuery=getUserScopedQuery(userId);
 const userQuery=getUserScopedQuery(userId,"user");
 const taskQuery={
  isActive:{$ne:false},
  status:{$nin:closedTaskStatuses},
  $or:[
   {dueDate:{$gte:today,$lte:nextThirtyDays}},
   {dueDate:null}
  ]
 };

 const [
  plants,
  gardens,
  gardenSections,
  hydroSystems,
  diseaseIssueCount,
  pestIssueCount,
  deadPlantingCount,
  seeds,
  supplies,
  lowSupplies,
  missingSupplies,
  tasks,
  journalEntries,
  harvests,
  diseaseLogs,
  pestLogs,
  deadPlantings,
  growingInstances,
  environmentObservations
 ]=await Promise.all([
  Plant.find(createdByQuery).populate("type").lean(),
  Garden.find(createdByQuery).lean(),
  GardenSection.find(createdByQuery).populate("type").lean(),
  HydroSystem.find(createdByQuery).lean(),
  DiseaseLog.countDocuments({...userQuery,status:{$nin:closedIssueStatuses}}),
  PestLog.countDocuments({...createdByQuery,isActive:{$ne:false},status:{$nin:closedIssueStatuses}}),
  Planting.countDocuments({...createdByQuery,status:"dead",isActive:{$ne:false}}),
  Seed.find(userQuery).lean(),
  Supply.find(createdByQuery)
   .populate("category")
   .populate("vendor")
   .sort({purchaseDate:-1,createdAt:-1})
   .limit(80)
   .lean(),
  Supply.find({...createdByQuery,quantity:{$gt:0,$lte:2}})
   .populate("category")
   .populate("vendor")
   .sort({quantity:1,name:1})
   .limit(8)
   .lean(),
  Supply.find({...createdByQuery,$or:[{quantity:{$lte:0}},{quantity:null}]})
   .populate("category")
   .populate("vendor")
   .sort({name:1})
   .limit(8)
   .lean(),
  Task.find(taskQuery)
   .sort({dueDate:1,priority:-1,createdAt:-1})
   .limit(8)
   .lean(),
  JournalEntry.find({...createdByQuery,isActive:{$ne:false}})
   .populate("dailyJournal")
   .populate({
    path:"planting",
    populate:[
     {path:"seed",model:"Seed"},
     {path:"plant",model:"Plant"},
     {path:"garden",model:"Garden"},
     {path:"gardenSection",model:"GardenSection"}
    ]
   })
   .populate("seed")
   .populate("plant")
   .populate("garden")
   .populate("gardenSection")
   .populate("hydroSystem")
   .populate("equipment")
   .sort({entryDate:-1,createdAt:-1})
   .limit(8)
   .lean(),
  Harvest.find({...createdByQuery,isActive:{$ne:false}})
   .populate({
    path:"planting",
    populate:[
     {path:"plant",model:"Plant"},
     {path:"seed",model:"Seed"},
     {path:"garden",model:"Garden"}
    ]
   })
   .sort({harvestDate:-1,createdAt:-1})
   .limit(8)
   .lean(),
  DiseaseLog.find({...userQuery,status:{$nin:closedIssueStatuses}})
   .populate("disease")
   .populate({
    path:"planting",
    populate:{path:"garden",model:"Garden"}
   })
   .sort({dateObserved:-1,createdAt:-1})
   .limit(4)
   .lean(),
  PestLog.find({...createdByQuery,isActive:{$ne:false},status:{$nin:closedIssueStatuses}})
   .populate("pest")
   .populate({
    path:"planting",
    populate:{path:"garden",model:"Garden"}
   })
   .sort({dateObserved:-1,createdAt:-1})
   .limit(4)
   .lean(),
  Planting.find({...createdByQuery,status:"dead",isActive:{$ne:false}})
   .populate("seed")
   .populate("plant")
   .populate("garden")
   .sort({deathDate:-1,updatedAt:-1})
   .limit(4)
   .lean(),
  Planting.find({...createdByQuery,isActive:{$ne:false}})
   .populate("seed")
   .populate("plant")
   .populate("garden")
   .sort({plantedDate:-1,createdAt:-1})
   .limit(80)
   .lean(),
  Observation.find({...createdByQuery,isActive:{$ne:false}})
   .populate("garden")
   .populate("gardenSection")
   .populate("planting")
   .sort({observedAt:-1,createdAt:-1})
   .limit(24)
   .lean()
 ]);

 const categoryCosts=supplies
  .map(mapSupplyCost)
  .filter(item=>item.cost>0);

 const issueCount=diseaseIssueCount+pestIssueCount;

 return {
  stats:buildStats({
   plants,
   seeds,
   gardens,
   gardenSections,
   hydroSystems,
   tasks,
   harvests,
   issueCount,
   deadPlantingCount,
   today,
   nextThirtyDays
  }),
  lowStockItems:lowSupplies.map(mapSupplyItem),
  expiringItems:tasks.map(mapTaskItem),
  recentItems:supplies.slice(0,8).map(mapSupplyItem),
  missingItems:missingSupplies.map(mapSupplyItem),
  categoryCosts,
  gardenTasks:tasks.map(mapTaskItem),
  recentJournalEntries:journalEntries.map(mapJournalItem),
  plantHealthItems:[
   ...diseaseLogs.map(mapDiseaseIssue),
   ...pestLogs.map(mapPestIssue)
  ],
  plantLifecycleItems:deadPlantings.map(mapDeadPlantingLifecycle),
  growingInstanceItems:growingInstances.map(mapGrowingInstanceItem),
  harvestItems:harvests.map(mapHarvestItem),
  environmentItems:environmentObservations.map(mapEnvironmentItem)
 };
};

export default getDashboardDataService;
