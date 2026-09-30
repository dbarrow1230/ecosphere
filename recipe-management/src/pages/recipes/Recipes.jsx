import Alert from "../../components/AppAlert.jsx";
import {useEffect,useMemo,useState} from "react";
import {Button,Container,Form,Modal} from "react-bootstrap";
import RecipeForm from "../forms/recipes/RecipeForm.jsx";
import RecipeDetailView from "../../components/recipes/RecipeDetailView.jsx";
import ScaleRecipeModal from "../../components/recipes/ScaleRecipeModal.jsx";
import HaccpLogModal,{printBlankHaccpSheet} from "../../components/recipes/HaccpLogModal.jsx";
import {getObjectId,loadCurrentBusiness} from "../../utils/currentBusiness.js";
import "../../styles/Recipes.css";

const rows=data=>Array.isArray(data)?data:Array.isArray(data?.data)?data.data:Array.isArray(data?.vendors)?data.vendors:Array.isArray(data?.ingredients)?data.ingredients:Array.isArray(data?.vendorIngredientPrices)?data.vendorIngredientPrices:Array.isArray(data?.recipes)?data.recipes:Array.isArray(data?.recipeCostings)?data.recipeCostings:[];
const label=value=>typeof value==="object"?value?.legalName||value?.name||"":value||"";
const emptyLookups={businesses:[],categories:[],cuisines:[],courses:[],mealTypes:[],dietaries:[],allergens:[],techniques:[],equipment:[],ingredients:[],imperialUnits:[],metricUnits:[],vendors:[],vendorIngredientPrices:[]};
const imageUrl=(filename,version="")=>{
 const value=String(filename||"").trim();
 if(!value)return "";
 const url=value.startsWith("/")||/^https?:\/\//i.test(value)?value:`/recipe_images/${encodeURIComponent(value)}`;
 return version?`${url}${url.includes("?")?"&":"?"}v=${encodeURIComponent(version)}`:url;
};

export default function Recipes(){
 const [recipes,setRecipes]=useState([]);
 const [lookups,setLookups]=useState(emptyLookups);
 const [selectedId,setSelectedId]=useState("");
 const [query,setQuery]=useState("");
 const [filters,setFilters]=useState({cuisine:"",course:"",category:"",mealType:""});
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [showDelete,setShowDelete]=useState(false);
 const [showScale,setShowScale]=useState(false);
 const [showHaccpLog,setShowHaccpLog]=useState(false);
 const [formRecipe,setFormRecipe]=useState(null);
 const [currentBusinessId,setCurrentBusinessId]=useState("");

 const fetchRows=async url=>{
  const res=await fetch(url);
  const data=await res.json().catch(()=>null);
  if(!res.ok)throw new Error(data?.message||`Failed to load ${url}.`);
  return rows(data);
 };

 const load=async preferredId=>{
  const [rawRecipes,recipeCostings,currentBusiness,categories,cuisines,courses,mealTypes,dietaries,allergens,techniques,equipment,ingredients,imperialUnits,metricUnits,vendors,vendorIngredientPrices]=await Promise.all([
   fetchRows("/api/recipes"),fetchRows("/api/recipe-costings"),loadCurrentBusiness(),fetchRows("/api/categories"),
   fetchRows("/api/cuisines"),fetchRows("/api/courses"),fetchRows("/api/meal-types"),
   fetchRows("/api/dietaries"),fetchRows("/api/allergens"),fetchRows("/api/techniques"),fetchRows("/api/equipment"),fetchRows("/api/ingredients"),fetchRows("/api/imperial-units"),fetchRows("/api/metric-units"),fetchRows("/api/vendors"),fetchRows("/api/vendor-ingredient-prices")
  ]);
  const recipeRows=rawRecipes.map(recipe=>{const costing=recipeCostings.find(item=>getObjectId(item.recipe)===recipe._id);return{...recipe,recipeCostingId:costing?._id||"",recipeCosting:costing||null,ingredients:(recipe.ingredients||[]).map((line,index)=>({...line,...(costing?.ingredients?.[index]||{}),ingredient:line.ingredient,preparation:line.preparation,time:line.time,note:line.note}))};});
  const businesses=[currentBusiness];setCurrentBusinessId(getObjectId(currentBusiness));setRecipes(recipeRows);
  setLookups({businesses,categories,cuisines,courses,mealTypes,dietaries,allergens,techniques,equipment,ingredients,imperialUnits,metricUnits,vendors,vendorIngredientPrices});
  setSelectedId(current=>{
   const requested=preferredId||current;
   return recipeRows.some(recipe=>recipe._id===requested)?requested:recipeRows[0]?._id||"";
  });
 };

 useEffect(()=>{load().catch(err=>setError(err.message)).finally(()=>setLoading(false));},[]);

 const filteredRecipes=useMemo(()=>{
  const search=query.trim().toLowerCase();
  const matches=[...recipes].filter(recipe=>{
    if(filters.cuisine&&!(recipe.cuisines||[]).some(item=>getObjectId(item)===filters.cuisine))return false;
    if(filters.course&&!(recipe.courses||[]).some(item=>getObjectId(item)===filters.course))return false;
    if(filters.category&&!(recipe.categories||[]).some(item=>getObjectId(item)===filters.category))return false;
    if(filters.mealType&&getObjectId(recipe.mealType)!==filters.mealType)return false;
    if(!search)return true;
    const searchable=[recipe.name,recipe.recipeNumber,...(recipe.cuisines||[]).map(label),...(recipe.courses||[]).map(label),label(recipe.mealType),...(recipe.categories||[]).map(label),recipe.generalDescription,recipe.menuDescription,...(recipe.techniques||[]),...(recipe.techniqueRefs||[]).map(label),...(recipe.allergens||[]).map(label)];
    return searchable.some(value=>String(value||"").toLowerCase().includes(search));
   }).sort((a,b)=>a.name.localeCompare(b.name));
  const matchedIds=new Set(matches.map(recipe=>recipe._id));
  const roots=matches.filter(recipe=>!getObjectId(recipe.parentRecipe)||!matchedIds.has(getObjectId(recipe.parentRecipe)));
  const childrenByParent=new Map();
  matches.forEach(recipe=>{const parentId=getObjectId(recipe.parentRecipe);if(!parentId)return;childrenByParent.set(parentId,[...(childrenByParent.get(parentId)||[]),recipe]);});
  const ordered=[];
  const append=recipe=>{ordered.push(recipe);(childrenByParent.get(recipe._id)||[]).sort((a,b)=>a.name.localeCompare(b.name)).forEach(append);};
  roots.forEach(append);
  return ordered;
 },[recipes,query,filters]);

 const changeFilter=event=>setFilters(current=>({...current,[event.target.name]:event.target.value}));
 const resetFilters=()=>{setQuery("");setFilters({cuisine:"",course:"",category:"",mealType:""});};

 const selected=recipes.find(recipe=>recipe._id===selectedId)||null;
 useEffect(()=>{
  if(!selectedId)return;
  let cancelled=false,timer;
  const controller=new AbortController();
  const check=async()=>{
   try{
    const response=await fetch('/api/recipes/'+encodeURIComponent(selectedId)+'/nutrition-sync',{method:'POST',signal:controller.signal});
    if(!response.ok)throw new Error('Nutrition status is unavailable.');
    const result=await response.json();
    if(cancelled)return;
    setRecipes(current=>current.map(recipe=>recipe._id===selectedId?{...recipe,nutrition:result.nutrition,nutritionSync:result.nutritionSync}:recipe));
    timer=setTimeout(check,['pending','processing'].includes(result.nutritionSync?.status)?5000:15000);
   }catch(err){if(!cancelled&&err.name!=='AbortError')timer=setTimeout(check,15000);}
  };
  void check();
  return()=>{cancelled=true;controller.abort();clearTimeout(timer);};
 },[selectedId,selected?.updatedAt]);
 const openAdd=()=>{setFormRecipe({business:currentBusinessId,isActive:true});setShowForm(true);setError("");};
 const openEdit=()=>{if(selected){setFormRecipe(selected);setShowForm(true);setError("");}};
 const scaleQuantity=(value,factor)=>value===null||value===undefined||value===""?null:Number((Number(value)*factor).toFixed(4));
 const saveScaled=async({name,method,factor,yieldOverride,newServings})=>{
  if(!selected)return;
  try{
   setSaving(true);setError("");
   const ref=value=>getObjectId(value)||null;
   const refs=values=>(values||[]).map(ref).filter(Boolean);
   const sourceServings=Number(selected.servings||0);
   const round2=value=>Math.round((Number(value)+Number.EPSILON)*100)/100;
   const sourceImperialYield=round2(Number(selected.yield?.imperialQuantity||0));
   const sourceMetricYield=round2(Number(selected.yield?.metricQuantity||0));
   const payload={...selected,_id:undefined,recipeNumber:undefined,recipeSequence:undefined,createdAt:undefined,updatedAt:undefined,__v:undefined,name,parentRecipe:ref(selected.parentRecipe)||selected._id,scaleFactor:factor,scalingMethod:method,business:ref(selected.business)||currentBusinessId,cuisines:refs(selected.cuisines),courses:refs(selected.courses),mealType:ref(selected.mealType),categories:refs(selected.categories),primaryCuisine:ref(selected.primaryCuisine),primaryCourse:ref(selected.primaryCourse),primaryCategory:ref(selected.primaryCategory),dietaryConsiderations:refs(selected.dietaryConsiderations),techniqueRefs:refs(selected.techniqueRefs),servings:scaleQuantity(sourceServings,factor),yield:{imperialQuantity:scaleQuantity(sourceImperialYield,factor),imperialUnit:ref(selected.yield?.imperialUnit)||ref(selected.servingSize?.imperialUnit),metricQuantity:scaleQuantity(sourceMetricYield,factor),metricUnit:ref(selected.yield?.metricUnit)||ref(selected.servingSize?.metricUnit)},servingSize:{imperialQuantity:selected.servingSize?.imperialQuantity??null,imperialUnit:ref(selected.servingSize?.imperialUnit),metricQuantity:selected.servingSize?.metricQuantity??null,metricUnit:ref(selected.servingSize?.metricUnit)},equipment:refs(selected.equipment),ingredients:(selected.ingredients||[]).map(item=>({ingredient:ref(item.ingredient),imperialQuantity:scaleQuantity(item.imperialQuantity,factor),imperialUnit:ref(item.imperialUnit),metricQuantity:scaleQuantity(item.metricQuantity,factor),metricUnit:ref(item.metricUnit),preparation:item.preparation||"",time:item.time||"",note:item.note||""})).filter(item=>item.ingredient),allergens:refs(selected.allergens),isActive:true};
   if(yieldOverride)payload.yield=yieldOverride;
   if(Number(newServings)>0)payload.servings=Number(newServings.toFixed(4));
   const response=await fetch("/api/recipes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const result=await response.json().catch(()=>null);if(!response.ok)throw new Error(result?.message||"Failed to save scaled recipe.");
   await load(result.recipe?._id);setShowScale(false);
  }catch(err){setError(err.message||"Failed to save scaled recipe.");}finally{setSaving(false);}
 };
 const createLookup=async(type,payload)=>{
  const body=typeof payload==="string"?{name:payload}:payload;
  const res=await fetch(`/api/${type}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const data=await res.json().catch(()=>null);if(!res.ok)throw new Error(data?.message||`Failed to create ${body.name}.`);
  const singular={categories:"category",cuisines:"cuisine",courses:"course","meal-types":"mealType",dietaries:"dietary",allergens:"allergen",techniques:"technique",equipment:"equipment",ingredients:"ingredient"}[type];
  const key={categories:"categories",cuisines:"cuisines",courses:"courses","meal-types":"mealTypes",dietaries:"dietaries",allergens:"allergens",techniques:"techniques",equipment:"equipment",ingredients:"ingredients"}[type];
  const record=data?.[singular]||data;
  setLookups(current=>({...current,[key]:[...current[key].filter(item=>item._id!==record._id),record].sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")))}));
  return record;
 };

 const save=async payload=>{
  if(formRecipe?._id&&!Object.keys(payload).length){setNotice("No changes to save.");return;}
  try{
   setSaving(true);setError("");
   const editing=Boolean(formRecipe?._id);
   const res=await fetch(editing?`/api/recipes/${formRecipe._id}`:"/api/recipes",{method:editing?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const data=await res.json().catch(()=>null);
   if(!res.ok)throw new Error(data?.message||"Failed to save recipe.");
   const savedId=data?.recipe?._id||formRecipe?._id;
   const costingChanged=!editing||["ingredients","yield","suggestedPrice","business","isActive"].some(key=>Object.hasOwn(payload,key));
   const costingSource={...formRecipe,...payload};
   const costingIngredients=(costingSource.ingredients||[]).filter(item=>item.vendorIngredientPrice).map(item=>({ingredient:item.ingredient,vendor:item.vendor||null,vendorIngredientPrice:item.vendorIngredientPrice,imperialQuantity:item.imperialQuantity,imperialUnit:item.imperialUnit,metricQuantity:item.metricQuantity,metricUnit:item.metricUnit,unitCost:Number(item.unitCost||0),totalCost:Number(item.totalCost||0),vendorPackCost:Number(item.vendorPackCost||0),vendorPackImperialDisplay:item.vendorPackImperialDisplay||"",vendorPackMetricDisplay:item.vendorPackMetricDisplay||""}));
   const ingredientCost=costingIngredients.reduce((total,item)=>total+item.totalCost,0);
   const costingPayload={business:getObjectId(costingSource.business),recipe:savedId,yield:costingSource.yield,ingredients:costingIngredients,totals:{ingredientCost,totalCost:ingredientCost},pricing:{suggestedPrice:Number(costingSource.suggestedPrice||0)},isActive:costingSource.isActive};
   if(costingChanged&&(costingIngredients.length||formRecipe?.recipeCostingId)){
    const costingRes=await fetch(formRecipe?.recipeCostingId?`/api/recipe-costings/${formRecipe.recipeCostingId}`:"/api/recipe-costings",{method:formRecipe?.recipeCostingId?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(costingPayload)});
    const costingData=await costingRes.json().catch(()=>null);if(!costingRes.ok)throw new Error(costingData?.message||"Recipe saved, but vendor costing failed to save.");
   }
   await load(savedId);
   setNotice(editing?"Changes saved.":"Recipe saved.");
   let queuedRecipes=[];
   try{queuedRecipes=JSON.parse(localStorage.getItem("recipe-management-word-parser-queue")||"null")?.recipes||[];}catch{queuedRecipes=[];}
   if(queuedRecipes.length>1)setFormRecipe({business:currentBusinessId});
   else setShowForm(false);
  }catch(err){setError(err.message);}finally{setSaving(false);}
 };

 const remove=async()=>{
  if(!selected)return;
  try{
   setSaving(true);
   const res=await fetch(`/api/recipes/${selected._id}`,{method:"DELETE"});
   const data=await res.json().catch(()=>null);
   if(!res.ok)throw new Error(data?.message||"Failed to delete recipe.");
   await load();setShowDelete(false);setNotice("Recipe deleted successfully.");
  }catch(err){setError(err.message);}finally{setSaving(false);}
 };
 const finishBulkImport=async payload=>{await load();if(Number(payload?.summary?.errors||0)>0)return;setShowForm(false);setFormRecipe(null);};
 const updateImportNumbers=async()=>{
  try{setSaving(true);setError("");setNotice("");const response=await fetch("/api/recipes/regenerate-import-numbers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({business:currentBusinessId})});const payload=await response.json().catch(()=>null);if(!response.ok)throw new Error(payload?.message||"Failed to update import recipe numbers.");await load(selectedId);setNotice(`${payload.summary.updated} import number${payload.summary.updated===1?"":"s"} updated. ${payload.summary.skipped} skipped because classifications are still missing.`);}catch(updateError){setError(updateError.message);}finally{setSaving(false);}
 };

 return(
  <Container fluid className="recipes-page py-4">
   <div className="recipes-toolbar">
    <div><h1 className="mb-1">Recipes</h1><p className="text-muted mb-0">Search the recipe database and review complete recipe details.</p></div>
    <div className="d-flex gap-2 flex-wrap justify-content-end"><Button onClick={openAdd}>Add Recipe</Button><Button variant="outline-primary" onClick={openEdit} disabled={!selected}>Edit Recipe</Button><Button variant="outline-primary" onClick={()=>setShowScale(true)} disabled={!selected}>Scale Recipe</Button>{recipes.some(recipe=>/^IMPORT-/i.test(recipe.recipeNumber||""))?<Button variant="outline-primary" onClick={updateImportNumbers} disabled={saving}>Update Import Numbers</Button>:null}<Button variant="outline-primary" onClick={()=>{if(!printBlankHaccpSheet(selected))setError("Allow popups for this site to open the printable HACCP form.");}} disabled={!selected}>Print Recipe HACCP Sheet</Button><Button variant="outline-primary" onClick={()=>{if(!printBlankHaccpSheet())setError("Allow popups for this site to open the printable HACCP form.");}}>Print Blank HACCP Form</Button><Button variant="outline-primary" onClick={()=>setShowHaccpLog(true)} disabled={!selected||(!(selected.haccp||[]).length&&!(selected.ccp||[]).length)}>Enter HACCP Log</Button><Button variant="outline-danger" onClick={()=>setShowDelete(true)} disabled={!selected}>Delete</Button></div>
   </div>
   {saving&&!showForm?<Alert variant="info" notification>{showDelete?"Deleting recipe…":"Saving changes…"}</Alert>:null}
   {error?<Alert variant="danger" onClose={()=>setError("")}>{error}</Alert>:null}
   {notice?<Alert variant="success" dismissible onClose={()=>setNotice("")}>{notice}</Alert>:null}

   <div className="recipes-workspace">
    <aside className="recipes-master-panel">
     <div className="recipes-search">
      <Form.Control type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search recipes..." aria-label="Search recipes"/>
      <div className="recipe-list-filters">
       <Form.Select name="cuisine" value={filters.cuisine} onChange={changeFilter} aria-label="Filter by cuisine"><option value="">All cuisines</option>{lookups.cuisines.map(item=><option key={item._id} value={item._id}>{label(item)}</option>)}</Form.Select>
       <Form.Select name="course" value={filters.course} onChange={changeFilter} aria-label="Filter by course"><option value="">All courses</option>{lookups.courses.map(item=><option key={item._id} value={item._id}>{label(item)}</option>)}</Form.Select>
       <Form.Select name="category" value={filters.category} onChange={changeFilter} aria-label="Filter by category"><option value="">All categories</option>{lookups.categories.map(item=><option key={item._id} value={item._id}>{label(item)}</option>)}</Form.Select>
       <Form.Select name="mealType" value={filters.mealType} onChange={changeFilter} aria-label="Filter by meal type"><option value="">All meal types</option>{lookups.mealTypes.map(item=><option key={item._id} value={item._id}>{label(item)}</option>)}</Form.Select>
      </div>
      <div className="recipe-filter-summary"><small>{filteredRecipes.length} recipe{filteredRecipes.length===1?"":"s"}</small><Button type="button" variant="outline-secondary" size="sm" onClick={resetFilters} disabled={!query&&!Object.values(filters).some(Boolean)}>Reset</Button></div>
     </div>
     <div className="recipes-scroll-list">
      {loading?<div className="recipes-empty">Loading recipes...</div>:null}
      {!loading&&filteredRecipes.length===0?<div className="recipes-empty">No recipes match your search.</div>:null}
      {filteredRecipes.map(recipe=>(
       <button type="button" key={recipe._id} className={`recipe-list-item${getObjectId(recipe.parentRecipe)?" recipe-list-item-child":""}${selectedId===recipe._id?" active":""}`} onClick={()=>setSelectedId(recipe._id)}>
        <span className="recipe-list-content">{getObjectId(recipe.parentRecipe)?<span className="recipe-list-branch" aria-hidden="true">↳</span>:null}{recipe.image?<img className="recipe-list-thumbnail" src={imageUrl(recipe.image,recipe.updatedAt)} alt=""/>:<span className="recipe-list-thumbnail recipe-list-thumbnail-empty">No image</span>}<span className="recipe-list-copy"><span className="recipe-list-name">{recipe.name}</span><span className="recipe-list-number">{recipe.recipeNumber||"Number pending"}</span></span></span>
       </button>
      ))}
     </div>
    </aside>

    <main className="recipes-detail-panel">
     {!selected?<div className="recipes-empty recipes-empty-detail">Select a recipe to view its details.</div>:<RecipeDetailView recipe={selected} imageUrl={imageUrl} linkedRecipes={recipes.filter(item=>item._id!==selected._id&&getObjectId(item.parentRecipe)===(getObjectId(selected.parentRecipe)||selected._id))}/>}
    </main>
   </div>

   <Modal size="xl" dialogClassName="recipe-form-modal" show={showForm} onHide={()=>!saving&&setShowForm(false)} backdrop="static" keyboard={false} centered><Modal.Header closeButton><Modal.Title>{formRecipe?._id?"Edit":"Add"} Recipe</Modal.Title></Modal.Header><Modal.Body><RecipeForm initialData={formRecipe||{business:currentBusinessId}} lookups={lookups} onSubmit={save} onCreateLookup={createLookup} onBulkImported={finishBulkImport} loading={saving}/></Modal.Body></Modal>
   <Modal show={showDelete} onHide={()=>!saving&&setShowDelete(false)} centered><Modal.Header closeButton><Modal.Title>Delete Recipe</Modal.Title></Modal.Header><Modal.Body>Delete <strong>{selected?.name}</strong>?</Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setShowDelete(false)}>Cancel</Button><Button variant="danger" onClick={remove} disabled={saving}>{saving?"Deleting...":"Delete"}</Button></Modal.Footer></Modal>
   <ScaleRecipeModal show={showScale} recipe={selected} imperialUnits={lookups.imperialUnits} metricUnits={lookups.metricUnits} onHide={()=>!saving&&setShowScale(false)} onSave={saveScaled} saving={saving}/>
   <HaccpLogModal show={showHaccpLog} recipe={selected} onHide={()=>setShowHaccpLog(false)}/>
  </Container>
 );
}
