from pathlib import Path

def edit(path,old,new):
 p=Path(path); s=p.read_text(encoding='utf-8'); assert old in s,(path,old); p.write_text(s.replace(old,new),encoding='utf-8')
# Shared definitions keep new forms and persisted fields aligned.
Path('src/pages/planning/planningResources.js').write_text('''const text=(name,label,extra={})=>({name,label,...extra});
const number=(name,label)=>text(name,label,{type:"number",min:0,step:"any"});
const date=(name,label)=>text(name,label,{type:"date"});
const notes=(name,label)=>text(name,label,{type:"textarea",md:12});
export const planningResources={
 budgets:{title:"Garden Budgets",description:"Plan quantities, unit costs, and allotted budgets. Total cost and remaining budget are calculated when saved.",fields:[text("name","Item",{required:true}),text("description","Description"),number("year","Year"),number("quantity","Quantity"),number("unitCost","Cost per item"),number("allottedBudget","Allotted budget"),text("currency","Currency",{defaultValue:"USD"})],columns:["name","year","quantity","unitCost","totalCost","allottedBudget","remainingBudget","currency"]},
 expenses:{title:"Garden Expenses",description:"Record purchases, vendors, warranties, and savings. Amount is quantity times unit price minus savings.",fields:[text("name","Item",{required:true}),date("purchaseDate","Purchase date"),text("vendor","Vendor"),text("warranty","Warranty"),number("quantity","Quantity"),number("unitCost","Price per item"),number("savedAmount","Amount saved"),text("currency","Currency",{defaultValue:"USD"}),notes("notes","Notes")],columns:["purchaseDate","name","vendor","warranty","quantity","unitCost","savedAmount","totalCost","currency"]},
 wishlist:{title:"Garden Wish List",description:"Plan what to buy, where to find it, and the expected cost.",fields:[text("name","Item",{required:true}),notes("description","Description"),number("quantity","Quantity"),text("vendor","Place to buy"),number("unitCost","Price per item"),text("warranty","Warranty"),text("currency","Currency",{defaultValue:"USD"}),text("purchased","Purchased",{type:"checkbox",checkLabel:"Purchased"})],columns:["name","description","quantity","vendor","unitCost","totalCost","warranty","purchased","currency"]},
 'crop-calendar':{title:"Crop Calendar",description:"Create local fruit and vegetable schedules. Enter month numbers (1-12), separated by commas; dates depend on your climate and variety.",fields:[text("name","Crop",{required:true}),text("cropType","Fruit or vegetable",{type:"select",options:[{value:"fruit",name:"Fruit"},{value:"vegetable",name:"Vegetable"},{value:"other",name:"Other"}]}),text("variety","Variety"),text("location","Location / climate"),text("sowMonths","Sow months",{type:"tags",placeholder:"1, 2, 3"}),text("plantMonths","Plant / transplant months",{type:"tags",placeholder:"3, 4, 5"}),text("harvestMonths","Harvest months",{type:"tags",placeholder:"6, 7, 8"}),notes("notes","Notes / source")],columns:["name","cropType","variety","location","sowMonths","plantMonths","harvestMonths"]},
 companions:{title:"Companion Planting Notes",description:"Record compatible and incompatible combinations, pest attraction or repelling, and the source of each observation.",fields:[text("name","Plant",{required:true}),text("companion","Companion plant",{required:true}),text("relationship","Relationship",{type:"select",options:[{value:"compatible",name:"Compatible"},{value:"incompatible",name:"Incompatible"},{value:"attractor",name:"Attractor"},{value:"repellent",name:"Repellent"}]}),text("source","Reference / observation source"),notes("notes","Reason and observations")],columns:["name","companion","relationship","source","notes"]}
};
const labels={name:"Item / crop",unitCost:"Unit cost",totalCost:"Total amount",allottedBudget:"Allotted budget",remainingBudget:"Remaining budget",savedAmount:"Savings",purchaseDate:"Purchase date",cropType:"Crop type",sowMonths:"Sow months",plantMonths:"Plant months",harvestMonths:"Harvest months"};
export const resourceColumns=config=>config.columns.map(key=>({key,label:labels[key]||key.charAt(0).toUpperCase()+key.slice(1)}));
''',encoding='utf-8')
Path('src/pages/planning/GardenPlanningPage.jsx').write_text('''import {Link,useParams} from "react-router-dom";
import ResourceCrudPage from "../../components/crud/ResourceCrudPage.jsx";
import {planningResources,resourceColumns} from "./planningResources.js";
export default function GardenPlanningPage(){
 const {resource}=useParams();
 const config=planningResources[resource];
 return <><nav className="container py-3 d-flex flex-wrap gap-3" aria-label="Garden planning">{Object.entries(planningResources).map(([key,value])=><Link key={key} to={`/planning/${key}`} aria-current={resource===key?"page":undefined}>{value.title}</Link>)}<Link to="/garden-reference">Worksheet references</Link></nav>{config?<ResourceCrudPage key={resource} title={config.title} kicker="Garden Planning" description={config.description} endpoint={`/api/garden-planning/${resource}`} fields={config.fields} columns={resourceColumns(config)}/>:<p className="container">Choose a planning page above.</p>}</>;
}
''',encoding='utf-8')
Path('src/pages/planning/GardenReferencePage.jsx').write_text('''import {Link} from "react-router-dom";
import {Card,Col,Container,Row} from "react-bootstrap";
import sources from "./worksheetSources.json";
const destinations={"Bed plan":"/gardens","COMPANION PLANTING":"/planning/companions","fruit calendar":"/planning/crop-calendar","garden expenses":"/planning/expenses","garden wish list":"/planning/wishlist","gardening budget (3)":"/planning/budgets","HARVEST LOG":"/harvest","Plant Card":"/plants","repellent inventory":"/supplies","seed inventory":"/seed-collections","Seed packet info":"/seeds","seeding log":"/plantings","soil AMENDMENT":"/fertilizer-applications","vegetable calendar":"/planning/crop-calendar"};
export default function GardenReferencePage(){return <Container className="py-4"><h1>Garden Worksheet References</h1><p>Your original garden worksheets and the matching digital pages. Blank worksheets are planning templates; add your own records using the linked forms.</p><Row className="g-3">{sources.map(source=><Col md={6} lg={4} key={source.url}><Card className="h-100"><Card.Body><h2 className="h5">{source.name}</h2><a href={source.url} target="_blank" rel="noreferrer">Open original {source.image?"guide":"worksheet"}</a>{destinations[source.name]&&<p className="mt-3 mb-0"><Link to={destinations[source.name]}>Open matching page and form</Link></p>}{source.image&&<><p className="mt-3">Microgreens growing conditions, harvest windows, and serving ideas from your supplied guide.</p><a href={source.url} target="_blank" rel="noreferrer"><img src={source.url} alt="Supplied microgreens growing guide" className="img-fluid" loading="lazy"/></a></>}</Card.Body></Card></Col>)}</Row></Container>;}
''',encoding='utf-8')
Path('backend/models/gardens/gardenPlanningModel.js').write_text('''import mongoose from "mongoose";
const {Schema}=mongoose;
const nonnegative={type:Number,min:0,default:0};
const schema=new Schema({
 kind:{type:String,required:true,enum:["budgets","expenses","wishlist","crop-calendar","companions"],index:true},
 name:{type:String,required:true,trim:true},description:String,notes:String,year:Number,
 quantity:nonnegative,unitCost:nonnegative,allottedBudget:nonnegative,savedAmount:nonnegative,
 totalCost:nonnegative,remainingBudget:Number,currency:{type:String,default:"USD"},
 purchaseDate:{type:Date,default:null},vendor:String,warranty:String,purchased:{type:Boolean,default:false},
 cropType:{type:String,enum:["fruit","vegetable","other",null]},variety:String,location:String,
 sowMonths:[{type:Number,min:1,max:12}],plantMonths:[{type:Number,min:1,max:12}],harvestMonths:[{type:Number,min:1,max:12}],
 companion:String,relationship:{type:String,enum:["compatible","incompatible","attractor","repellent",null]},source:String
},{timestamps:true,collection:"garden_planning"});
export default mongoose.models.GardenPlanning||mongoose.model("GardenPlanning",schema);
''',encoding='utf-8')
Path('backend/routes/gardens/gardenPlanningRoutes.js').write_text('''import express from "express";
import mongoose from "mongoose";
import GardenPlanning from "../../models/gardens/gardenPlanningModel.js";
const router=express.Router();
const kinds=new Set(["budgets","expenses","wishlist","crop-calendar","companions"]);
const fields=["name","description","notes","year","quantity","unitCost","allottedBudget","savedAmount","currency","purchaseDate","vendor","warranty","purchased","cropType","variety","location","sowMonths","plantMonths","harvestMonths","companion","relationship","source"];
export function normalizePlanningPayload(body,existing={}){
 const data=Object.fromEntries(fields.filter(key=>body[key]!==undefined).map(key=>[key,body[key]]));
 for(const key of ["quantity","unitCost","allottedBudget","savedAmount"]){
  if(data[key]!==undefined){data[key]=Number(data[key]);if(!Number.isFinite(data[key])||data[key]<0)throw new Error(`${key} must be a nonnegative number`);}
 }
 for(const key of ["sowMonths","plantMonths","harvestMonths"]){
  if(data[key]===undefined)continue;
  if(!Array.isArray(data[key]))throw new Error(`${key} must contain month numbers`);
  data[key]=[...new Set(data[key].map(Number))].sort((a,b)=>a-b);
  if(data[key].some(value=>!Number.isInteger(value)||value<1||value>12))throw new Error("Months must be whole numbers from 1 to 12");
 }
 if(data.purchaseDate==="")data.purchaseDate=null;
 const merged={...existing,...data};
 const gross=Number(merged.quantity||0)*Number(merged.unitCost||0);
 if(Number(merged.savedAmount||0)>gross)throw new Error("Savings cannot exceed purchase cost");
 data.totalCost=gross-Number(merged.savedAmount||0);
 data.remainingBudget=Number(merged.allottedBudget||0)-data.totalCost;
 if(!String(merged.name||"").trim())throw new Error("Item or crop name is required");
 return data;
}
router.use("/:kind",(req,res,next)=>kinds.has(req.params.kind)?next():res.status(404).json({message:"Unknown planning resource"}));
router.get("/:kind",async(req,res)=>{try{res.json(await GardenPlanning.find({kind:req.params.kind}).sort({createdAt:-1}));}catch(error){res.status(500).json({message:error.message});}});
router.post("/:kind",async(req,res)=>{try{const data=normalizePlanningPayload(req.body);res.status(201).json(await GardenPlanning.create({...data,kind:req.params.kind}));}catch(error){res.status(400).json({message:error.message});}});
router.param("id",(req,res,next,id)=>mongoose.isValidObjectId(id)?next():res.status(400).json({message:"Invalid record id"}));
router.put("/:kind/:id",async(req,res)=>{try{const record=await GardenPlanning.findOne({_id:req.params.id,kind:req.params.kind});if(!record)return res.status(404).json({message:"Record not found"});Object.assign(record,normalizePlanningPayload(req.body,record.toObject()));res.json(await record.save());}catch(error){res.status(400).json({message:error.message});}});
router.delete("/:kind/:id",async(req,res)=>{try{const record=await GardenPlanning.findOneAndDelete({_id:req.params.id,kind:req.params.kind});if(!record)return res.status(404).json({message:"Record not found"});res.json({message:"Record deleted"});}catch(error){res.status(500).json({message:error.message});}});
export default router;
''',encoding='utf-8')
edit('backend/server.js','import supplyRoutes from','import gardenPlanningRoutes from "./routes/gardens/gardenPlanningRoutes.js";\nimport supplyRoutes from')
edit('backend/server.js','app.use("/api/supplies",supplyRoutes);','app.use("/api/garden-planning",gardenPlanningRoutes);\napp.use("/api/supplies",supplyRoutes);')
edit('src/App.jsx','//reference','import GardenPlanningPage from "./pages/planning/GardenPlanningPage.jsx";\nimport GardenReferencePage from "./pages/planning/GardenReferencePage.jsx";\n\n//reference')
edit('src/App.jsx','<Route path="/supplies"','<Route path="/planning/:resource" element={<GardenPlanningPage/>}/>\n     <Route path="/garden-reference" element={<GardenReferencePage/>}/>\n     <Route path="/supplies"')
edit('src/components/Navigation.jsx','active={isActive("/hardiness-zones")','active={isActive("/garden-reference")||isActive("/hardiness-zones")')
edit('src/components/Navigation.jsx','<NavDropdown.Item as={NavLink} to="/hardiness-zones">','<NavDropdown.Item as={NavLink} to="/garden-reference">Garden Worksheets & Microgreens Guide</NavDropdown.Item>\n       <NavDropdown.Item as={NavLink} to="/hardiness-zones">')
edit('src/components/Navigation.jsx','active={isActive("/gardens")','active={isActive("/planning")||isActive("/gardens")')
edit('src/components/Navigation.jsx','<NavDropdown.Item as={NavLink} to="/gardens">','<NavDropdown.Item as={NavLink} to="/planning/budgets">Budget, Expenses & Wish List</NavDropdown.Item>\n         <NavDropdown.Item as={NavLink} to="/planning/crop-calendar">Fruit & Vegetable Calendar</NavDropdown.Item>\n         <NavDropdown.Item as={NavLink} to="/planning/companions">Companion Planting Notes</NavDropdown.Item>\n         <NavDropdown.Item as={NavLink} to="/gardens">')
# supplies: repellent inventory fields in existing page and storage
supply=[('solvesIssues','Solves issues'),('forPlants','For plants'),('instructions','Instructions and dosage'),('caution','Caution'),('bestBefore','Best before')]
for key,label in supply:
 edit('backend/models/supplies/supplyModel.js','\tbrand:',f'\t{key}:{{type:{"Date" if key=="bestBefore" else "String"},default:{"null" if key=="bestBefore" else chr(34)+chr(34)}}},\n\tbrand:')
 edit('backend/controllers/supplies/supplyController.js','const supply=new Supply({',f'const supply=new Supply({{\n{key}:req.body.{key}||{"null" if key=="bestBefore" else chr(34)+chr(34)},')
 edit('backend/controllers/supplies/supplyController.js','const updated=await supply.save();',f'if(req.body.{key}!==undefined)supply.{key}=req.body.{key}||{"null" if key=="bestBefore" else chr(34)+chr(34)};\nconst updated=await supply.save();')
 edit('src/pages/supplies/SuppliesPage.jsx',' {name:"description"',f' {{name:"{key}",label:"{label}",type:"{"date" if key=="bestBefore" else "textarea"}",md:6}},\n {{name:"description"')
edit('src/pages/supplies/SuppliesPage.jsx',' {key:"unit",label:"Unit"}',' {key:"unit",label:"Unit"},\n {key:"bestBefore",label:"Best before"},\n {key:"caution",label:"Caution"}')
# bed plan environmental and layout information
bed=[('soilType','Soil type'),('drainage','Drainage'),('locationDescription','Location'),('sunExposure','Sun exposure (AM / noon / PM)'),('layoutPlan','Bed layout / planting plan')]
for key,label in bed:
 edit('backend/models/gardens/gardenSectionModel.js','name:{type:String',f'{key}:{{type:String,trim:true,default:""}},\nname:{{type:String')
 edit('backend/controllers/gardens/gardenSectionController.js','const section=new GardenSection({',f'const section=new GardenSection({{\n{key}:req.body.{key},')
 edit('backend/controllers/gardens/gardenSectionController.js','const updated=await section.save();',f'if(req.body.{key}!==undefined)section.{key}=req.body.{key};\nconst updated=await section.save();')
 edit('src/pages/gardens/GardenWorkspacePage.jsx','const initialSectionForm={',f'const initialSectionForm={{{key}:"",')
 edit('src/pages/gardens/GardenWorkspacePage.jsx','   name:section.name||"",',f'   {key}:section.{key}||"",\n   name:section.name||"",')
 edit('src/pages/gardens/GardenWorkspacePage.jsx','    name:sectionForm.name,',f'    {key}:sectionForm.{key},\n    name:sectionForm.name,')
 edit('src/pages/gardens/GardenWorkspacePage.jsx','<Col md={6}><Form.Group><Form.Label>Section name',f'<Col md={{6}}><Form.Group controlId="section-{key}"><Form.Label>{label}</Form.Label><Form.Control as="textarea" name="{key}" value={{sectionForm.{key}}} onChange={{handleSectionChange}}/></Form.Group></Col>\n      <Col md={{6}}><Form.Group><Form.Label>Section name')
edit('src/pages/gardens/GardenWorkspacePage.jsx','<div className="garden-section-actions">','<dl>{[["Soil",section.soilType],["Drainage",section.drainage],["Location",section.locationDescription],["Sun",section.sunExposure],["Plan",section.layoutPlan]].filter(([,value])=>value).map(([label,value])=><div key={label}><dt>{label}</dt><dd style={{whiteSpace:"pre-wrap"}}>{value}</dd></div>)}</dl>\n      <div className="garden-section-actions">')
# generic form labels and zero handling
edit('src/components/crud/ResourceCrudPage.jsx','value={value||""}','value={value??""}')
edit('src/components/crud/ResourceCrudPage.jsx','<Form.Group>','<Form.Group controlId={`resource-${field.name}`}>')
