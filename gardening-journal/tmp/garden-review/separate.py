from pathlib import Path
import json
base=Path('.')
def write(path,text):
 p=Path(path);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text,encoding='utf-8')
def edit(path,old,new):
 p=Path(path);s=p.read_text(encoding='utf-8');assert old in s,(path,old);p.write_text(s.replace(old,new),encoding='utf-8')
resources=[
 dict(stem='gardenBudget',model='GardenBudget',page='GardenBudgetsPage',form='GardenBudgetForm',slug='garden-budgets',old='budgets',collection='garden_budgets',title='Garden Budgets',singular='Budget Item',description='Plan garden purchases and compare their estimated cost with the amount allotted.',fields=[('name','Item','text'),('description','Description','textarea'),('year','Budget year','number'),('quantity','Quantity','number'),('unitCost','Cost per item','money'),('allottedBudget','Allotted budget','money'),('currency','Currency','text')],columns=[('name','Item'),('year','Year'),('quantity','Quantity'),('unitCost','Unit cost'),('totalCost','Estimated total'),('allottedBudget','Allotted budget'),('remainingBudget','Remaining'),('currency','Currency')]),
 dict(stem='gardenExpense',model='GardenExpense',page='GardenExpensesPage',form='GardenExpenseForm',slug='garden-expenses',old='expenses',collection='garden_expenses',title='Garden Expenses',singular='Expense',description='Record actual purchases, vendors, warranties, and savings.',fields=[('name','Item','text'),('purchaseDate','Purchase date','date'),('vendor','Vendor','text'),('warranty','Warranty','text'),('quantity','Quantity','number'),('unitCost','Price per item','money'),('savedAmount','Amount saved','money'),('currency','Currency','text'),('notes','Notes','textarea')],columns=[('purchaseDate','Date'),('name','Item'),('vendor','Vendor'),('warranty','Warranty'),('quantity','Quantity'),('unitCost','Unit price'),('savedAmount','Saved'),('totalCost','Amount paid'),('currency','Currency')]),
 dict(stem='gardenWish',model='GardenWish',page='GardenWishListPage',form='GardenWishForm',slug='garden-wishlist',old='wishlist',collection='garden_wishlist',title='Garden Wish List',singular='Wish List Item',description='Keep a list of garden items to buy, sources, prices, and warranties.',fields=[('name','Item','text'),('description','Description','textarea'),('quantity','Quantity','number'),('vendor','Place to buy','text'),('unitCost','Price per item','money'),('warranty','Warranty','text'),('currency','Currency','text'),('purchased','Purchased','checkbox')],columns=[('name','Item'),('description','Description'),('quantity','Quantity'),('vendor','Place to buy'),('unitCost','Unit price'),('totalCost','Expected amount'),('warranty','Warranty'),('purchased','Purchased'),('currency','Currency')]),
 dict(stem='fruitCalendar',model='FruitCalendar',page='FruitCalendarPage',form='FruitCalendarForm',slug='fruit-calendar',old=None,collection='fruit_calendar',title='Fruit Calendar',singular='Fruit Schedule',description='Plan sowing, planting, and harvesting for each fruit variety in your climate.',calendar=True),
 dict(stem='vegetableCalendar',model='VegetableCalendar',page='VegetableCalendarPage',form='VegetableCalendarForm',slug='vegetable-calendar',old=None,collection='vegetable_calendar',title='Vegetable Calendar',singular='Vegetable Schedule',description='Plan sowing, planting, and harvesting for each vegetable variety in your climate.',calendar=True),
 dict(stem='companionPlanting',model='CompanionPlanting',page='CompanionPlantingPage',form='CompanionPlantingForm',slug='companion-planting',old='companions',collection='companion_planting',title='Companion Planting',singular='Companion Relationship',description='Record plant relationships, observed benefits, conflicts, and reference sources.',fields=[('name','Plant','text'),('companion','Companion plant','text'),('relationship','Relationship','select'),('source','Reference / observation source','text'),('notes','Reason and observations','textarea')],columns=[('name','Plant'),('companion','Companion plant'),('relationship','Relationship'),('source','Source'),('notes','Observations')])]
months='["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]'
for r in resources:
 if r.get('calendar'):
  r['fields']=[('name','Crop','text'),('variety','Variety','text'),('location','Location / climate','text'),('sowMonths','Sow','months'),('plantMonths','Plant / transplant','months'),('harvestMonths','Harvest','months'),('notes','Notes / source','textarea')]
 # independent schema, with only domain fields
 schema=[]
 for key,label,typ in r['fields']:
  if typ=='months': definition='[{type:Number,min:1,max:12}]'
  elif typ in ['number','money']: definition='{type:Number,min:0,default:'+('1' if key=='quantity' else 'null' if key=='year' else '0')+'}'
  elif typ=='checkbox':definition='{type:Boolean,default:false}'
  elif typ=='date':definition='{type:Date,default:null}'
  elif typ=='select':definition='{type:String,enum:["compatible","incompatible","attractor","repellent"],required:true}'
  else:definition='{type:String,trim:true,'+('required:true' if key in ['name','companion'] else 'default:"USD"' if key=='currency' else 'default:""')+'}'
  schema.append(f' {key}:{definition}')
 if r['old'] in ['budgets','expenses','wishlist']:
  schema.append(' totalCost:{type:Number,min:0,default:0}')
  if r['old']=='budgets':schema.append(' remainingBudget:{type:Number,default:0}')
  calc='\nschema.pre("validate",function(){\n this.totalCost=this.quantity*this.unitCost'+('-this.savedAmount' if r['old']=='expenses' else '')+';\n'+(' if(this.savedAmount>this.quantity*this.unitCost)this.invalidate("savedAmount","Savings cannot exceed purchase cost");\n' if r['old']=='expenses' else '')+(' this.remainingBudget=this.allottedBudget-this.totalCost;\n' if r['old']=='budgets' else '')+'});\n'
 else:calc=''
 write(f'backend/models/planning/{r["stem"]}Model.js','import mongoose from "mongoose";\n\nconst schema=new mongoose.Schema({\n'+',\n'.join(schema)+'\n},{timestamps:true,collection:"'+r['collection']+'"});\n'+calc+'\nexport default mongoose.models.'+r['model']+'||mongoose.model("'+r['model']+'",schema);\n')
 # each controller has a domain-specific whitelist and validation
 names=[f[0] for f in r['fields']]
 cleaning=''
 for key,label,typ in r['fields']:
  if typ=='months':cleaning+=f''' if(data.{key}!==undefined){{
  if(!Array.isArray(data.{key}))throw new Error("{label} months must be an array");
  data.{key}=[...new Set(data.{key}.map(Number))].sort((a,b)=>a-b);
  if(data.{key}.some(value=>!Number.isInteger(value)||value<1||value>12))throw new Error("Months must be whole numbers from 1 to 12");
 }}
'''
  elif typ=='date':cleaning+=f' if(data.{key}==="")data.{key}=null;\n'
  elif typ in ['number','money']:cleaning+=f''' if(data.{key}!==undefined){{
  data.{key}=data.{key}===""?{'null' if key=='year' else '0'}:Number(data.{key});
  if(data.{key}!==null&&(!Number.isFinite(data.{key})||data.{key}<0))throw new Error("{label} must be a nonnegative number");
 }}
'''
 write(f'backend/controllers/planning/{r["stem"]}Controller.js',f'''import {r['model']} from "../../models/planning/{r['stem']}Model.js";

export function sanitize{r['model']}(body){{
 const allowed={json.dumps(names)};
 const data=Object.fromEntries(allowed.filter(key=>body[key]!==undefined).map(key=>[key,body[key]]));
{cleaning} return data;
}}

export async function list(req,res){{
 try{{res.json(await {r['model']}.find({{}}).sort({{createdAt:-1}}));}}
 catch(error){{res.status(500).json({{message:error.message}});}}
}}

export async function create(req,res){{
 try{{res.status(201).json(await {r['model']}.create(sanitize{r['model']}(req.body)));}}
 catch(error){{res.status(400).json({{message:error.message}});}}
}}

export async function update(req,res){{
 try{{
  const record=await {r['model']}.findById(req.params.id);
  if(!record)return res.status(404).json({{message:"{r['singular']} not found"}});
  Object.assign(record,sanitize{r['model']}(req.body));
  res.json(await record.save());
 }}catch(error){{res.status(400).json({{message:error.message}});}}
}}

export async function remove(req,res){{
 try{{
  const record=await {r['model']}.findByIdAndDelete(req.params.id);
  if(!record)return res.status(404).json({{message:"{r['singular']} not found"}});
  res.json({{message:"{r['singular']} deleted"}});
 }}catch(error){{res.status(500).json({{message:error.message}});}}
}}
''')
 write(f'backend/routes/planning/{r["stem"]}Routes.js',f'''import express from "express";
import mongoose from "mongoose";
import {{list,create,update,remove}} from "../../controllers/planning/{r['stem']}Controller.js";

const router=express.Router();
router.param("id",(req,res,next,id)=>mongoose.isValidObjectId(id)?next():res.status(400).json({{message:"Invalid record id"}}));
router.get("/",list);
router.post("/",create);
router.put("/:id",update);
router.delete("/:id",remove);
export default router;
''')
 # fully separate form components, no generic field renderer
 controls=[]
 defaults={key:[] if typ=='months' else False if typ=='checkbox' else 1 if key=='quantity' else 'USD' if key=='currency' else 'compatible' if key=='relationship' else '' for key,label,typ in r['fields']}
 for key,label,typ in r['fields']:
  if typ=='months':
   controls.append(f'''    <Col xs={{12}}><fieldset className="calendar-month-choices"><legend>{label}</legend><div>{{months.map((month,index)=><Form.Check inline key={{month}} id="{r['slug']}-{key}-{{index}}" label={{month}} checked={{form.{key}.includes(index+1)}} onChange={{()=>toggleMonth("{key}",index+1)}}/>)}}</div></fieldset></Col>'''.replace('id="'+r['slug']+'-'+key+'-{index}"','id={`'+r['slug']+'-'+key+'-${index}`}'))
  elif typ=='checkbox': controls.append(f'    <Col md={{6}}><Form.Check id="{r["slug"]}-{key}" label="{label}" checked={{form.{key}}} onChange={{event=>setForm(previous=>({{...previous,{key}:event.target.checked}}))}}/></Col>')
  else:
   control=f'<Form.Control '+('as="textarea" rows={3}' if typ=='textarea' else 'type="'+('number' if typ in ['number','money'] else typ)+'"')+f' value={{form.{key}}} onChange={{event=>change("{key}",event.target.value)}}'+(' required' if key in ['name','companion'] else '')+(' min="0" step="'+('1' if key=='year' else 'any')+'"' if typ in ['number','money'] else '')+'/>'
   if typ=='select':control='<Form.Select value={form.relationship} onChange={event=>change("relationship",event.target.value)} required><option value="compatible">Compatible</option><option value="incompatible">Incompatible</option><option value="attractor">Attractor</option><option value="repellent">Repellent</option></Form.Select>'
   controls.append(f'    <Col md={{{12 if typ=="textarea" else 6}}}><Form.Group controlId="{r["slug"]}-{key}"><Form.Label>{label}</Form.Label>{control}</Form.Group></Col>')
 monthly=' const toggleMonth=(key,month)=>setForm(previous=>({...previous,[key]:previous[key].includes(month)?previous[key].filter(value=>value!==month):[...previous[key],month].sort((a,b)=>a-b)}));\n' if r.get('calendar') else ''
 normalizes=''
 for key,label,typ in r['fields']:
  normalizes+=f' {key}:'+ (f'(record?.{key}||[]).map(Number)' if typ=='months' else f'record?.{key}?.slice(0,10)||""' if typ=='date' else f'record?.{key}??defaults.{key}')+',\n'
 preview=''
 if r['old'] in ['budgets','expenses','wishlist']:
  preview='<p className="mt-3 fw-bold">'+('Amount paid' if r['old']=='expenses' else 'Estimated total')+': {((Number(form.quantity)||0)*(Number(form.unitCost)||0)'+('-(Number(form.savedAmount)||0)' if r['old']=='expenses' else '')+').toFixed(2)} {form.currency}</p>'
 write(f'src/pages/forms/planning/{r["form"]}.jsx',f'''import {{useState}} from "react";
import {{Alert,Button,Col,Form,Row}} from "react-bootstrap";

const defaults={json.dumps(defaults)};
{f'const months={months};' if r.get('calendar') else ''}
export default function {r['form']}({{record,onSave,onCancel,saving,error}}){{
 const [form,setForm]=useState(()=>({{
{normalizes} }}));
 const change=(key,value)=>setForm(previous=>({{...previous,[key]:value}}));
{monthly} const submit=event=>{{event.preventDefault();onSave(form);}};
 return <Form onSubmit={{submit}}>
  {{error&&<Alert variant="danger">{{error}}</Alert>}}
  <Row className="g-3">
{chr(10).join(controls)}
  </Row>
  {preview}
  <div className="d-flex gap-2 mt-3"><Button type="submit" disabled={{saving}}>{{saving?"Saving...":"Save {r['singular']}"}}</Button><Button type="button" variant="outline-secondary" onClick={{onCancel}} disabled={{saving}}>Cancel</Button></div>
 </Form>;
}}
'''.replace('false','false'))
 # domain page, own endpoint, CRUD state and form
 if r.get('calendar'):
  recordview='''<div className="crop-schedules">{rows.map(row=><Card key={row._id}><Card.Body><div className="d-flex justify-content-between flex-wrap gap-2"><div><h2 className="h4">{row.name}{row.variety?` · ${row.variety}`:""}</h2><p>{row.location||"Location not recorded"}</p></div><div className="d-flex gap-2 align-self-start"><Button size="sm" onClick={()=>open(row)}>Edit</Button><Button size="sm" variant="outline-danger" onClick={()=>remove(row)}>Delete</Button></div></div><Table responsive bordered className="crop-month-grid"><caption>Sowing, planting, and harvest months for {row.name}</caption><thead><tr><th scope="col">Activity</th>{months.map(month=><th scope="col" key={month}>{month}</th>)}</tr></thead><tbody>{[["sowMonths","Sow"],["plantMonths","Plant"],["harvestMonths","Harvest"]].map(([key,label])=><tr key={key}><th scope="row">{label}</th>{months.map((month,index)=><td key={month} className={row[key]?.includes(index+1)?`calendar-active calendar-${key}`:""}><span aria-label={`${month}: ${row[key]?.includes(index+1)?label:"not scheduled"}`}>{row[key]?.includes(index+1)?"●":"—"}</span></td>)}</tr>)}</tbody></Table>{row.notes&&<p>{row.notes}</p>}</Card.Body></Card>)}{!rows.length&&<Card body>{loading?"Loading schedules...":"No schedules yet. Add a crop to plan its months."}</Card>}</div>'''
 else:
  headings=''.join(f'<th scope="col">{label}</th>' for key,label in r['columns'])
  cells=''.join('<td>{'+(f'row.{key}?"Yes":"No"' if key=='purchased' else f'row.{key}?.slice(0,10)||"—"' if key=='purchaseDate' else f'Number(row.{key}||0).toFixed(2)' if key in ['unitCost','totalCost','savedAmount','allottedBudget','remainingBudget'] else f'row.{key}??"—"')+'}</td>' for key,label in r['columns'])
  recordview=f'''<Card><Card.Body><Table responsive hover><thead><tr>{headings}<th scope="col">Actions</th></tr></thead><tbody>{{rows.map(row=><tr key={{row._id}}>{cells}<td><div className="d-flex gap-2"><Button size="sm" onClick={{()=>open(row)}}>Edit</Button><Button size="sm" variant="outline-danger" onClick={{()=>remove(row)}}>Delete</Button></div></td></tr>)}}{{!rows.length&&<tr><td colSpan={{{len(r['columns'])+1}}}>{{loading?"Loading...":"No records yet."}}</td></tr>}}</tbody></Table></Card.Body></Card>'''
 write(f'src/pages/planning/{r["page"]}.jsx',f'''import {{useEffect,useState}} from "react";
import {{Alert,Button,Card,Modal,Table}} from "react-bootstrap";
import {r['form']} from "../forms/planning/{r['form']}.jsx";
import "./planning.css";

const endpoint="/api/{r['slug']}";
{f'const months={months};' if r.get('calendar') else ''}
export default function {r['page']}(){{
 const [rows,setRows]=useState([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [formError,setFormError]=useState("");
 const [notice,setNotice]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [editing,setEditing]=useState(null);
 async function load(){{
  setLoading(true);setError("");
  try{{const response=await fetch(endpoint);const data=await response.json();if(!response.ok)throw new Error(data.message||"Unable to load {r['title'].lower()}");setRows(data);}}
  catch(error){{setError(error.message);}}finally{{setLoading(false);}}
 }}
 useEffect(()=>{{load();}},[]);
 function open(record=null){{setEditing(record);setFormError("");setNotice("");setShowForm(true);}}
 async function save(values){{
  setSaving(true);setFormError("");
  try{{
   const response=await fetch(editing?`${{endpoint}}/${{editing._id}}`:endpoint,{{method:editing?"PUT":"POST",headers:{{"Content-Type":"application/json"}},body:JSON.stringify(values)}});
   const data=await response.json();if(!response.ok)throw new Error(data.message||"Unable to save {r['singular'].lower()}");
   setRows(previous=>editing?previous.map(row=>row._id===data._id?data:row):[data,...previous]);setShowForm(false);setNotice("{r['singular']} saved.");
  }}catch(error){{setFormError(error.message);}}finally{{setSaving(false);}}
 }}
 async function remove(record){{
  if(!window.confirm(`Delete ${{record.name}}?`))return;
  setError("");setNotice("");
  try{{const response=await fetch(`${{endpoint}}/${{record._id}}`,{{method:"DELETE"}});const data=await response.json();if(!response.ok)throw new Error(data.message||"Unable to delete record");setRows(previous=>previous.filter(row=>row._id!==record._id));setNotice("{r['singular']} deleted.");}}
  catch(error){{setError(error.message);}}
 }}
 return <section className="garden-planning-page">
  <header className="garden-planning-header"><div><h1>{r['title']}</h1><p>{r['description']}</p></div><div className="d-flex gap-2"><Button variant="outline-primary" onClick={{load}} disabled={{loading}}>Refresh</Button><Button onClick={{()=>open()}}>Add {r['singular']}</Button></div></header>
  {{error&&<Alert variant="danger">{{error}}</Alert>}}{{notice&&<Alert variant="success">{{notice}}</Alert>}}
  {recordview}
  <Modal show={{showForm}} onHide={{()=>!saving&&setShowForm(false)}} size="lg" centered backdrop="static"><Modal.Header closeButton={{!saving}}><Modal.Title>{{editing?"Edit":"Add"}} {r['singular']}</Modal.Title></Modal.Header><Modal.Body>{{showForm&&<{r['form']} key={{editing?._id||"new"}} record={{editing}} onSave={{save}} onCancel={{()=>setShowForm(false)}} saving={{saving}} error={{formError}}/>}}</Modal.Body></Modal>
 </section>;
}}
''')
write('src/pages/planning/planning.css','''.garden-planning-page{display:grid;gap:1rem;padding:1.5rem 2rem 2.5rem;color:var(--primary)}
.garden-planning-header{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:1.25rem;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--surface)}
.garden-planning-header h1{color:var(--primary);font-size:1.8rem}
.garden-planning-header p{margin-bottom:0;color:var(--primary)}
.garden-planning-page td{white-space:pre-wrap}
.crop-schedules{display:grid;gap:1rem}
.crop-month-grid{text-align:center;min-width:48rem}
.crop-month-grid th,.crop-month-grid td{text-align:center;padding:.5rem}
.crop-month-grid .calendar-active{font-weight:700;background:var(--primary);color:var(--text-inverse)}
.calendar-month-choices{border:1px solid var(--border);padding:.65rem;border-radius:var(--radius-sm)}
.calendar-month-choices legend{float:none;width:auto;font-size:1rem;font-weight:700;padding:0 .25rem}
.calendar-month-choices>div{display:flex;flex-wrap:wrap;gap:.4rem}
@media(max-width:768px){.garden-planning-page{padding:1rem}.garden-planning-header{align-items:start;flex-direction:column}}
''')
# registration and explicit navigation
edit('src/App.jsx','import GardenPlanningPage from "./pages/planning/GardenPlanningPage.jsx";', '\n'.join(f'import {r["page"]} from "./pages/planning/{r["page"]}.jsx";' for r in resources))
edit('src/App.jsx','<Route path="/planning/:resource" element={<GardenPlanningPage/>}/>', '\n     '.join(f'<Route path="/{r["slug"]}" element={{<{r["page"]}/>}}/>' for r in resources)+'\n     '+ '\n     '.join(f'<Route path="/planning/{r["old"]}" element={{<Navigate to="/{r["slug"]}" replace/>}}/>' for r in resources if r['old'])+'\n     <Route path="/planning/crop-calendar" element={<Navigate to="/vegetable-calendar" replace/>}/>')
edit('backend/server.js','import gardenPlanningRoutes from "./routes/gardens/gardenPlanningRoutes.js";', '\n'.join(f'import {r["stem"]}Routes from "./routes/planning/{r["stem"]}Routes.js";' for r in resources))
edit('backend/server.js','app.use("/api/garden-planning",gardenPlanningRoutes);','\n'.join(f'app.use("/api/{r["slug"]}",{r["stem"]}Routes);' for r in resources))
p=Path('src/components/Navigation.jsx');s=p.read_text();start=s.index('         <NavDropdown.Item as={NavLink} to="/planning/budgets">');end=s.index('         <NavDropdown.Item as={NavLink} to="/gardens">',start)
s=s[:start]+'\n'.join(f'         <NavDropdown.Item as={{NavLink}} to="/{r["slug"]}">{r["title"]}</NavDropdown.Item>' for r in resources)+'\n'+s[end:]
s=s.replace('isActive("/planning")','||'.join(f'isActive("/{r["slug"]}")' for r in resources));p.write_text(s)
p=Path('src/pages/planning/GardenReferencePage.jsx');s=p.read_text()
for r in resources:
 if r['old']:s=s.replace('/planning/'+r['old'],'/'+r['slug'])
s=s.replace('"fruit calendar":"/planning/crop-calendar"','"fruit calendar":"/fruit-calendar"').replace('"vegetable calendar":"/planning/crop-calendar"','"vegetable calendar":"/vegetable-calendar"');p.write_text(s)
# Remove only the superseded files authored in this chat.
for path in ['src/pages/planning/GardenPlanningPage.jsx','src/pages/planning/planningResources.js','backend/routes/gardens/gardenPlanningRoutes.js','backend/models/gardens/gardenPlanningModel.js']:
 Path(path).unlink()
write('tmp/garden-review/separate-resources.json',json.dumps(resources))
