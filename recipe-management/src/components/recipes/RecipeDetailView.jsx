import {useEffect,useState} from "react";
import {Badge,Tab,Tabs} from "react-bootstrap";
import NutritionFacts,{hasNutrition} from "./NutritionFacts.jsx";
import RecipeOverviewRelated from "./RecipeOverviewRelated.jsx";

const getId=value=>typeof value==="object"?String(value?._id||value?.id||""):String(value||"");
const name=value=>typeof value==="object"?value?.legalName||value?.name||value?.title||"":String(value||"");
const list=value=>Array.isArray(value)?value:[];
const textList=value=>list(value).filter(Boolean).join(", ")||"—";
const formatQuantity=value=>Number.isFinite(Number(value))?Number(Number(value).toFixed(2)):value;
const measure=(quantity,unit)=>quantity===null||quantity===undefined||quantity===""?"":`${formatQuantity(quantity)} ${name(unit)}`.trim();
const equipmentList=recipe=>[...new Set([...list(recipe.equipment).map(name),...list(recipe.equipmentNames)].map(value=>String(value||"").trim()).filter(Boolean))];
const techniqueList=recipe=>[...new Set([...list(recipe.techniqueRefs).map(name),...list(recipe.techniques)].map(value=>String(value||"").trim()).filter(Boolean))];
const flavorItems=value=>(Array.isArray(value)?value:String(value||"").split(/\s*,\s*/)).map(item=>String(item||"").trim()).filter(Boolean);
const flavorDisplay=(value,icon)=>{const items=flavorItems(value);return items.length?<ul className="recipe-flavor-list">{items.map((item,index)=><li key={`${item}-${index}`}><span aria-hidden="true">{icon}</span>{item}</li>)}</ul>:"—";};
const timeMinutes=value=>{
 const text=String(value||"").toLowerCase();
 const hours=Number(text.match(/([\d.]+)\s*(?:hours?|hrs?|hr|h)\b/)?.[1]||0);
 const minutes=Number(text.match(/([\d.]+)\s*(?:minutes?|mins?|min|m)\b/)?.[1]||0);
 return Math.round((hours*60)+minutes);
};
const calculatedTotalTime=times=>{
 const minutes=[times?.prepTime,times?.cookTime,times?.chillTime,times?.restTime].reduce((total,value)=>total+timeMinutes(value),0);
 if(!minutes)return times?.totalTime||"—";
 const hours=Math.floor(minutes/60);
 const remainder=minutes%60;
 return [hours?`${hours} ${hours===1?"hour":"hours"}`:"",remainder?`${remainder} minutes`:""].filter(Boolean).join(" ");
};

const sectionDefinitions=[
 ["safety","Safety / HACCP",recipe=>list(recipe.haccp).length>0||list(recipe.ccp).length>0],
 ["finish","Plating & Storage",recipe=>list(recipe.plating).length>0||list(recipe.storage).length>0||list(recipe.notes).length>0]
];

export default function RecipeDetailView({recipe,imageUrl,linkedRecipes=[]}){
 recipe={...recipe,equipment:equipmentList(recipe),techniques:techniqueList(recipe),flavorProfile:{taste:flavorDisplay(recipe.flavorProfile?.taste,"👅"),aroma:flavorDisplay(recipe.flavorProfile?.aroma,"👃"),mouthfeel:flavorDisplay(recipe.flavorProfile?.mouthfeel,"👄")}};
 const [enabled,setEnabled]=useState(()=>sectionDefinitions.filter(([, ,available])=>available(recipe)).map(([key])=>key));
 const [activeTab,setActiveTab]=useState("overview");

 useEffect(()=>{setEnabled(sectionDefinitions.filter(([, ,available])=>available(recipe)).map(([key])=>key));setActiveTab("overview");},[recipe._id,recipe.haccp?.length,recipe.ccp?.length,recipe.plating?.length,recipe.storage?.length,recipe.notes?.length]);

 const showNutrition=hasNutrition(recipe.nutrition);
 const suggestedPrice=Number(recipe.suggestedPrice||recipe.recipeCosting?.pricing?.suggestedPrice||0);
 const recipeCost=Number(recipe.recipeCosting?.totals?.totalCost||0);
 const contributionMargin=suggestedPrice-recipeCost;

 return(
  <div className={`recipe-detail-layout${showNutrition?" has-nutrition":""}`}>
   <div className="recipe-detail-center">
    <header className="recipe-detail-header">
     <div className="recipe-detail-heading">{recipe.image?<img className="recipe-plated-image" src={imageUrl(recipe.image,recipe.updatedAt)} alt={`${recipe.name} plated`}/>:null}<div><div className="text-uppercase small fw-bold text-success mb-2">Recipe Record · {recipe.recipeNumber||"Number pending"}</div><h2>{recipe.name}</h2><p>{recipe.generalDescription||"No general description has been added."}</p></div></div>
     <div className="recipe-detail-status"><Badge bg={recipe.isActive!==false?"success":"secondary"}>{recipe.isActive!==false?"Active":"Inactive"}</Badge><dl className="recipe-financial-summary"><div><dt>Suggested Price</dt><dd>${suggestedPrice.toFixed(2)}</dd></div><div><dt>Recipe Cost</dt><dd>${recipeCost.toFixed(2)}</dd></div><div><dt>Contribution Margin</dt><dd>${contributionMargin.toFixed(2)}</dd></div></dl></div>
    </header>
    {recipe.parentRecipe||linkedRecipes.length?<div className="recipe-linkage">{recipe.parentRecipe?<span><strong>Scaled from:</strong> {name(recipe.parentRecipe)} · RCF {Number(recipe.scaleFactor||1).toFixed(4)}</span>:<span><strong>Linked scaled recipes:</strong> {linkedRecipes.map(item=>`${item.name} (${Number(item.scaleFactor||1).toFixed(4)} RCF)`).join(", ")}</span>}</div>:null}

    <Tabs activeKey={activeTab} onSelect={key=>setActiveTab(key||"overview")} className="recipe-detail-tabs">
     <Tab eventKey="overview" title="Overview"><div className="recipe-tab-panel"><dl className="recipe-overview-grid"><div><dt>Cuisines</dt><dd>{list(recipe.cuisines).map(name).join(", ")||"—"}</dd></div><div><dt>Dietary Considerations</dt><dd>{list(recipe.dietaryConsiderations).map(name).join(", ")||"—"}</dd></div><div><dt>Courses</dt><dd>{list(recipe.courses).map(name).join(", ")||"—"}</dd></div><div><dt>Meal Type</dt><dd>{name(recipe.mealType)||"—"}</dd></div><div><dt>Categories</dt><dd>{list(recipe.categories).map(name).join(", ")||"—"}</dd></div><div className="recipe-time-item"><dt>Prep Time</dt><dd>{recipe.times?.prepTime||"—"}</dd></div><div className="recipe-time-item"><dt>Cook Time</dt><dd>{recipe.times?.cookTime||"—"}</dd></div><div className="recipe-time-item"><dt>Chill Time</dt><dd>{recipe.times?.chillTime||"—"}</dd></div><div className="recipe-time-item"><dt>Rest Time</dt><dd>{recipe.times?.restTime||"—"}</dd></div><div className="recipe-time-item"><dt>Total Time</dt><dd>{calculatedTotalTime(recipe.times)}</dd></div><div className="recipe-measure-item"><dt>Yield</dt><dd>{[measure(recipe.yield?.imperialQuantity,recipe.yield?.imperialUnit),measure(recipe.yield?.metricQuantity,recipe.yield?.metricUnit)].filter(Boolean).map((value,index)=><span className="recipe-measure-line" key={index}>{value}</span>)}{!measure(recipe.yield?.imperialQuantity,recipe.yield?.imperialUnit)&&!measure(recipe.yield?.metricQuantity,recipe.yield?.metricUnit)?"—":null}</dd></div><div className="recipe-measure-item"><dt>Serving Size</dt><dd>{[measure(recipe.servingSize?.imperialQuantity,recipe.servingSize?.imperialUnit),measure(recipe.servingSize?.metricQuantity,recipe.servingSize?.metricUnit)].filter(Boolean).map((value,index)=><span className="recipe-measure-line" key={index}>{value}</span>)}{!measure(recipe.servingSize?.imperialQuantity,recipe.servingSize?.imperialUnit)&&!measure(recipe.servingSize?.metricQuantity,recipe.servingSize?.metricUnit)?"—":null}</dd></div></dl><section><h3>Flavor Profile</h3><dl className="recipe-flavor-grid"><div><dt>Taste</dt><dd>{recipe.flavorProfile?.taste||"—"}</dd></div><div><dt>Aroma</dt><dd>{recipe.flavorProfile?.aroma||"—"}</dd></div><div><dt>Mouthfeel</dt><dd>{recipe.flavorProfile?.mouthfeel||"—"}</dd></div></dl></section>{recipe.fermentationTemperatureAdjustment?<section className="recipe-temperature-adjustment"><h3>Room Temperature Adjustment</h3><p>{recipe.fermentationTemperatureAdjustment}</p></section>:null}{recipe.menuDescription?<section><h3>Menu Description</h3><p>{recipe.menuDescription}</p></section>:null}<RecipeOverviewRelated techniques={recipe.techniques} equipment={recipe.equipment} allergens={recipe.allergens}/></div></Tab>
     <Tab eventKey="ingredients" title={`Ingredients (${list(recipe.ingredients).length})`}><div className="recipe-tab-panel table-responsive"><table className="recipe-ingredients-display"><thead><tr><th>#</th><th>Weight (Imperial / Metric)</th><th>Ingredient</th><th>Preparation</th><th>Time</th></tr></thead><tbody>{list(recipe.ingredients).map((item,index)=><tr key={getId(item)||index}><td>{index+1}</td><td>{[measure(item.imperialQuantity,item.imperialUnit),measure(item.metricQuantity,item.metricUnit)].filter(Boolean).join(" / ")||"—"}</td><td><strong>{name(item.ingredient)||item.sourceName||"Ingredient"}</strong></td><td>{item.preparation||"—"}</td><td>{item.time||"—"}</td></tr>)}</tbody></table></div></Tab>
     <Tab eventKey="instructions" title={`Instructions (${list(recipe.instructions).length})`}><div className="recipe-tab-panel"><ol className="recipe-instruction-display">{[...list(recipe.instructions)].sort((a,b)=>a.stepNumber-b.stepNumber).map((step,index)=>{const ccpCodes=[...new Set([...(step.ccpRefs||[]),...[...String(step.instruction||"").matchAll(/\bCCP[- ]?\d+\b/gi)].map(match=>match[0].replace(/\s+/g,"-").toUpperCase())])];return <li className={ccpCodes.length?"recipe-instruction-ccp":""} key={getId(step)||index}><div className="recipe-instruction-copy">{step.instruction}</div>{ccpCodes.length?<div className="recipe-instruction-badges">{ccpCodes.map(code=><span key={code}>{code}</span>)}</div>:null}</li>;})}</ol></div></Tab>
     {enabled.includes("safety")?<Tab eventKey="safety" title="Safety / HACCP"><div className="recipe-tab-panel"><section className="recipe-safety-grid"><div className="recipe-safety-panel"><header><h3>HACCP Controls</h3><span>{list(recipe.haccp).length}</span></header>{list(recipe.haccp).length?<ul>{list(recipe.haccp).map((item,index)=><li key={getId(item)||index}><strong>{item.code}</strong><p>{item.description||"No control description added."}</p></li>)}</ul>:<p className="recipe-safety-empty">No HACCP controls added.</p>}</div><div className="recipe-safety-panel recipe-ccp-panel"><header><h3>Critical Control Points</h3><span>{list(recipe.ccp).length}</span></header>{list(recipe.ccp).length?<ul>{list(recipe.ccp).map((item,index)=><li key={getId(item)||index}><strong>{item.code}</strong><div>{item.criticalControlPoint?<p><b>Control:</b> {item.criticalControlPoint}</p>:null}{item.hazard?<p><b>Hazard:</b> {item.hazard}</p>:null}{item.criticalLimit?<p><b>Limit:</b> {item.criticalLimit}</p>:null}</div></li>)}</ul>:<p className="recipe-safety-empty">No critical control points added.</p>}</div></section></div></Tab>:null}
     {enabled.includes("finish")?<Tab eventKey="finish" title="Plating & Storage"><div className="recipe-tab-panel"><section className="recipe-finish-overview">{[["Plating",recipe.plating],["Storage",recipe.storage],["Notes",recipe.notes]].map(([heading,items])=><div key={heading}><h3>{heading}</h3>{list(items).length?<ul>{list(items).map((item,index)=><li key={index}>{item}</li>)}</ul>:<p>—</p>}</div>)}</section></div></Tab>:null}
    </Tabs>
   </div>
   {showNutrition?<NutritionFacts nutrition={recipe.nutrition} servingSize={recipe.servingSize}/>:null}
  </div>
 );
}
