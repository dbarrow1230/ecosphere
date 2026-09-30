import {useEffect,useMemo,useState} from "react";
import {Alert,Badge,Button,Card,Col,Container,Form,Modal,Row,Spinner,Table} from "react-bootstrap";
import {BookUp,CheckCircle2,FileText,Pencil,Search} from "lucide-react";
import RecipeForm from "../forms/recipes/RecipeForm.jsx";
import {getObjectId,loadCurrentBusiness} from "../../utils/currentBusiness.js";
import "../../styles/RecipeBookImport.css";

const rows=data=>Array.isArray(data)?data:Array.isArray(data?.data)?data.data:Array.isArray(data?.vendors)?data.vendors:Array.isArray(data?.ingredients)?data.ingredients:Array.isArray(data?.vendorIngredientPrices)?data.vendorIngredientPrices:[];
const emptyLookups={businesses:[],categories:[],cuisines:[],courses:[],mealTypes:[],dietaries:[],allergens:[],ingredients:[],imperialUnits:[],metricUnits:[],vendors:[],vendorIngredientPrices:[]};
const normalize=value=>String(value||"").trim().toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const matchId=(items,value)=>items.find(item=>normalize(item.name||item.legalName)===normalize(value))?._id||"";
const numberFrom=value=>{
 const text=String(value||"").replace(/[~≈]/g,"").trim();
 const mixed=/^(\d+)\s+([¼½¾⅓⅔⅛⅜⅝⅞]|\d+\/\d+)/.exec(text);const simple=/^([¼½¾⅓⅔⅛⅜⅝⅞]|\d+(?:\.\d+)?|\d+\/\d+)/.exec(text);
 const fraction=part=>({"¼":.25,"½":.5,"¾":.75,"⅓":1/3,"⅔":2/3,"⅛":.125,"⅜":.375,"⅝":.625,"⅞":.875}[part]??(part.includes("/")?Number(part.split("/")[0])/Number(part.split("/")[1]):Number(part)));
 return mixed?Number(mixed[1])+fraction(mixed[2]):simple?fraction(simple[1]):null;
};
const unitId=(items,value)=>{const text=String(value||"").toLowerCase();return items.find(item=>{const symbol=String(item.symbol||"").toLowerCase();const name=String(item.name||"").toLowerCase();return(symbol&&new RegExp(`(?:^|\\s)${symbol.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}(?:\\s|$)`).test(text))||(name&&text.includes(name));})?._id||"";};
const prepareQuantity=(source,imperialUnits,metricUnits)=>({...source,imperialQuantity:numberFrom(source?.imperialDisplay),imperialUnit:unitId(imperialUnits,source?.imperialDisplay),metricQuantity:numberFrom(source?.metricDisplay),metricUnit:unitId(metricUnits,source?.metricDisplay)});
const statusVariant=status=>status==="imported"?"success":status==="duplicate"?"warning":status==="error"?"danger":"secondary";

const prepareDraft=(source,lookups,business)=>{const primaryCuisine=matchId(lookups.cuisines,source.cuisine),primaryCourse=matchId(lookups.courses,source.course),primaryCategory=matchId(lookups.categories,source.category);return({
 ...source,business,image:"",cuisines:[primaryCuisine].filter(Boolean),courses:[primaryCourse].filter(Boolean),mealType:matchId(lookups.mealTypes,source.mealType),categories:[primaryCategory].filter(Boolean),primaryCuisine,primaryCourse,primaryCategory,
 yield:prepareQuantity(source.yield,lookups.imperialUnits,lookups.metricUnits),servingSize:prepareQuantity(source.servingSize,lookups.imperialUnits,lookups.metricUnits),
 sourceCuisine:source.cuisine||"",sourceCourse:source.course||"",sourceMealType:source.mealType||"",sourceCategory:source.category||"",
 dietaryConsiderations:(source.dietaryConsiderations||[]).map(value=>matchId(lookups.dietaries,value)).filter(Boolean),unmatchedDietaries:(source.dietaryConsiderations||[]).filter(value=>!matchId(lookups.dietaries,value)),allergens:(source.allergens||[]).map(value=>matchId(lookups.allergens,value)).filter(Boolean),
 ingredients:(source.ingredients||[]).map(item=>({...item,sourceName:item.name||item.sourceName||"",ingredient:matchId(lookups.ingredients,item.name||item.sourceName),imperialQuantity:numberFrom(item.imperialDisplay),imperialUnit:unitId(lookups.imperialUnits,item.imperialDisplay),metricQuantity:numberFrom(item.metricDisplay),metricUnit:unitId(lookups.metricUnits,item.metricDisplay),vendor:"",vendorIngredientPrice:"",unitCost:0,totalCost:0,vendorPackCost:0,vendorPackImperialDisplay:"",vendorPackMetricDisplay:""})),
 warnings:source.warnings||[],reviewed:false
});};

const unresolved=draft=>[
 ...(!draft.business?["Business"]:[]),...(!draft.cuisines?.length?[`Cuisine${draft.sourceCuisine?` (${draft.sourceCuisine})`:""}`]:[]),...(!draft.courses?.length?[`Course${draft.sourceCourse?` (${draft.sourceCourse})`:""}`]:[]),...(!draft.categories?.length?[`Category${draft.sourceCategory?` (${draft.sourceCategory})`:""}`]:[]),
 ...((draft.ingredients||[]).filter(item=>!item.ingredient||!item.vendor||!item.vendorIngredientPrice).length?[`${draft.ingredients.filter(item=>!item.ingredient||!item.vendor||!item.vendorIngredientPrice).length} vendor-linked ingredients`]:[])
];

export default function RecipeBookImport(){
 const [lookups,setLookups]=useState(emptyLookups);
 const [business,setBusiness]=useState("");
 const [file,setFile]=useState(null);
 const [recipes,setRecipes]=useState([]);
 const [selected,setSelected]=useState(new Set());
 const [query,setQuery]=useState("");
 const [parsing,setParsing]=useState(false);
 const [importing,setImporting]=useState(false);
 const [loadingLookups,setLoadingLookups]=useState(true);
 const [error,setError]=useState("");
 const [parseSummary,setParseSummary]=useState(null);
 const [results,setResults]=useState([]);
 const [editIndex,setEditIndex]=useState(null);

 useEffect(()=>{
  const fetchRows=async url=>{const response=await fetch(url);const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(data?.message||`Failed to load ${url}.`);return rows(data);};
  Promise.all([loadCurrentBusiness(),fetchRows("/api/categories"),fetchRows("/api/cuisines"),fetchRows("/api/courses"),fetchRows("/api/meal-types"),fetchRows("/api/dietaries"),fetchRows("/api/allergens"),fetchRows("/api/ingredients"),fetchRows("/api/imperial-units"),fetchRows("/api/metric-units"),fetchRows("/api/vendors"),fetchRows("/api/vendor-ingredient-prices")])
   .then(([currentBusiness,categories,cuisines,courses,mealTypes,dietaries,allergens,ingredients,imperialUnits,metricUnits,vendors,vendorIngredientPrices])=>{const businesses=[currentBusiness];setLookups({businesses,categories,cuisines,courses,mealTypes,dietaries,allergens,ingredients,imperialUnits,metricUnits,vendors,vendorIngredientPrices});setBusiness(getObjectId(currentBusiness));})
   .catch(err=>setError(err.message)).finally(()=>setLoadingLookups(false));
 },[]);

 useEffect(()=>{if(business)setRecipes(current=>current.map(recipe=>({...recipe,business})));},[business]);

 const visible=useMemo(()=>{const search=query.trim().toLowerCase();return recipes.map((recipe,index)=>({recipe,index})).filter(({recipe})=>!search||[recipe.name,recipe.sourceCuisine,recipe.sourceCourse,recipe.sourceCategory].some(value=>String(value||"").toLowerCase().includes(search)));},[recipes,query]);

 const parse=async()=>{
  if(!file){setError("Choose a Word .docx recipe book first.");return;}
  try{
   setParsing(true);setError("");setResults([]);
   const body=new FormData();body.append("file",file);
   const response=await fetch("/api/recipe-import/parse",{method:"POST",body});const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Failed to parse recipe book.");
   const drafts=(data.recipes||[]).map(recipe=>prepareDraft(recipe,lookups,business));setRecipes(drafts);setParseSummary(data.summary||null);setSelected(new Set(drafts.map((_,index)=>index)));
  }catch(err){setError(err.message);}finally{setParsing(false);}
 };

 const toggle=index=>setSelected(current=>{const next=new Set(current);if(next.has(index))next.delete(index);else next.add(index);return next;});
 const selectVisible=()=>setSelected(current=>{const next=new Set(current);visible.forEach(({index})=>next.add(index));return next;});
 const clearVisible=()=>setSelected(current=>{const next=new Set(current);visible.forEach(({index})=>next.delete(index));return next;});
 const saveDraft=payload=>{setRecipes(current=>current.map((recipe,index)=>index===editIndex?{...recipe,...payload,reviewed:true}:recipe));setEditIndex(null);};
 const createLookup=async(type,payload)=>{
  const body=typeof payload==="string"?{name:payload}:payload;
  const name=body?.name;
  if(type==="ingredients")throw new Error("Ingredients must be created with a vendor offering on the Vendor Ingredients page.");
  const response=await fetch(`/api/${type}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const data=await response.json().catch(()=>null);if(!response.ok)throw new Error(data?.message||`Failed to create ${name}.`);
  const singular={categories:"category",cuisines:"cuisine",courses:"course","meal-types":"mealType",dietaries:"dietary",allergens:"allergen"}[type];
  const record=data?.[singular]||data?.data||data;
  const lookupKey={categories:"categories",cuisines:"cuisines",courses:"courses","meal-types":"mealTypes",dietaries:"dietaries",allergens:"allergens"}[type];
  setLookups(current=>({...current,[lookupKey]:[...current[lookupKey].filter(item=>item._id!==record._id),record].sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")))}));
  return record;
 };
 const createMissingCategories=async()=>{
  const names=[...new Set(recipes.filter(recipe=>!recipe.categories?.length&&recipe.sourceCategory).map(recipe=>recipe.sourceCategory.trim()).filter(Boolean))];
  if(!names.length)return;
  try{
   setError("");
   const created=[];
   for(const name of names)created.push(await createLookup("categories",name));
   setRecipes(current=>current.map(recipe=>recipe.categories?.length||!recipe.sourceCategory?recipe:(()=>{const value=matchId(created,recipe.sourceCategory);return{...recipe,categories:[value].filter(Boolean),primaryCategory:value};})()));
  }catch(err){setError(err.message);}
 };

 const importSelected=async()=>{
  const indexed=recipes.map((recipe,index)=>({recipe,index})).filter(({index})=>selected.has(index));
  const incomplete=indexed.filter(({recipe})=>unresolved(recipe).length);
  if(incomplete.length){setError(`${incomplete.length} selected recipe${incomplete.length===1?" has":"s have"} missing database selections. Open Edit Complete Draft and resolve the highlighted items first.`);return;}
  if(!indexed.length){setError("Select at least one parsed recipe.");return;}
  try{
   setImporting(true);setError("");setResults([]);
   const response=await fetch("/api/recipe-import/import",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({business,recipes:indexed.map(item=>item.recipe)})});const data=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(data?.message||"Recipe import failed.");setResults(data.results||[]);
  }catch(err){setError(err.message);}finally{setImporting(false);}
 };

 return <Container fluid="lg" className="recipe-import-page py-4">
  <Card className="border-0 shadow-sm mb-4"><Card.Body className="p-4"><div className="d-flex gap-3 align-items-start"><span className="recipe-import-icon"><BookUp size={26}/></span><div><div className="text-uppercase small fw-bold text-success mb-1">Recipe Administration</div><h1 className="mb-2">Recipe Book Import</h1><p className="text-muted mb-0">Parse the document, then open each draft in the complete recipe form to select database records and correct any missing fields.</p></div></div></Card.Body></Card>
  {error?<Alert variant="danger">{error}</Alert>:null}<Alert variant="info"><strong>Parsing does not write to MongoDB.</strong> Use Edit Complete Draft to resolve ObjectId selections before importing.</Alert>
  <Card className="border-0 shadow-sm mb-4"><Card.Body className="p-4"><Row className="g-3 align-items-end"><Col lg={6}><Form.Group><Form.Label>Word Recipe Book</Form.Label><Form.Control type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={event=>setFile(event.target.files?.[0]||null)}/></Form.Group></Col><Col lg={3}><Form.Group><Form.Label>Master Recipe Database</Form.Label><Form.Control value={lookups.businesses[0]?.legalName||"Loading Recipe Management..."} readOnly/><Form.Text>Cafe and restaurant links are assigned later.</Form.Text></Form.Group></Col><Col lg={3}><Button className="w-100" onClick={parse} disabled={!file||!business||parsing||loadingLookups}>{parsing?<><Spinner size="sm" className="me-2"/>Parsing...</>:<><FileText size={18} className="me-2"/>Parse Recipe Book</>}</Button></Col></Row>{!loadingLookups&&lookups.categories.length===0?<Alert variant="warning" className="mt-3 mb-0">No food categories exist in <strong>recipe_categories</strong>. Parsed category names can be created from each draft's General tab.</Alert>:null}</Card.Body></Card>
  {parseSummary?<><Row className="g-3 mb-3">{[["Recipes",parseSummary.recipes],["Ingredient Rows",parseSummary.ingredients],["Parser Warnings",parseSummary.warnings]].map(([label,value])=><Col md={4} key={label}><Card className="border-0 shadow-sm h-100"><Card.Body><div className="text-muted small">{label}</div><div className="display-6 fw-semibold">{value}</div></Card.Body></Card></Col>)}</Row>{recipes.some(recipe=>!recipe.categories?.length&&recipe.sourceCategory)?<div className="d-flex justify-content-end mb-4"><Button variant="outline-primary" onClick={createMissingCategories}>Create All Missing Food Categories</Button></div>:null}</>:null}
  {recipes.length?<Card className="border-0 shadow-sm mb-4"><Card.Header className="bg-white p-3"><Row className="g-3 align-items-center"><Col md={5}><div className="recipe-import-search"><Search size={17}/><Form.Control value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search parsed recipes..."/></div></Col><Col md={7} className="d-flex justify-content-md-end gap-2"><Button size="sm" variant="outline-secondary" onClick={selectVisible}>Select Visible</Button><Button size="sm" variant="outline-secondary" onClick={clearVisible}>Clear Visible</Button><Badge bg="primary" className="align-self-center px-3 py-2">{selected.size} selected</Badge></Col></Row></Card.Header><Card.Body className="p-0"><div className="table-responsive"><Table hover className="mb-0 align-middle recipe-import-table"><thead><tr><th>Import</th><th>Recipe</th><th>Detected Classification</th><th>Content</th><th>Database Mapping</th><th>Edit</th></tr></thead><tbody>{visible.map(({recipe,index})=>{const missing=unresolved(recipe);return <tr key={`${recipe.sourceName}-${index}`}><td><Form.Check checked={selected.has(index)} onChange={()=>toggle(index)}/></td><td><strong>{recipe.name}</strong>{recipe.reviewed?<Badge bg="success" className="d-block mt-2">Reviewed</Badge>:null}</td><td>{[recipe.sourceCuisine,recipe.sourceCourse,recipe.sourceCategory].filter(Boolean).join(" / ")||"Not detected"}</td><td>{recipe.ingredients.length} ingredients<br/>{recipe.instructions.length} steps</td><td>{missing.length?missing.map(item=><Badge key={item} bg="warning" text="dark" className="d-block text-wrap mb-1">Missing {item}</Badge>):<Badge bg="success"><CheckCircle2 size={13} className="me-1"/>Complete</Badge>}</td><td><Button size="sm" onClick={()=>setEditIndex(index)}><Pencil size={15} className="me-1"/>Edit Complete Draft</Button></td></tr>;})}</tbody></Table></div></Card.Body><Card.Footer className="bg-white p-3 text-end"><Button size="lg" onClick={importSelected} disabled={importing||!selected.size}>{importing?<><Spinner size="sm" className="me-2"/>Importing...</>:`Import ${selected.size} Selected Recipe${selected.size===1?"":"s"}`}</Button></Card.Footer></Card>:null}
  {results.length?<Card className="border-0 shadow-sm"><Card.Header className="bg-white"><h2 className="h5 mb-0">Import Results</h2></Card.Header><Card.Body>{results.map((result,index)=><Alert key={`${result.name}-${index}`} variant={statusVariant(result.status)}><strong>{result.name}</strong>: {result.message}</Alert>)}</Card.Body></Card>:null}
  <Modal size="xl" fullscreen="lg-down" show={editIndex!==null} onHide={()=>setEditIndex(null)} centered scrollable><Modal.Header closeButton><Modal.Title>Edit Imported Recipe Draft</Modal.Title></Modal.Header><Modal.Body>{editIndex!==null?<><Alert variant="secondary">Detected values that could not be matched are shown beside their selectors. Select an existing record or create the detected value, then complete any other tabs before saving.</Alert><RecipeForm key={editIndex} initialData={recipes[editIndex]} lookups={lookups} onSubmit={saveDraft} onCreateLookup={createLookup} submitLabel="Save Import Draft"/></>:null}</Modal.Body></Modal>
 </Container>;
}
