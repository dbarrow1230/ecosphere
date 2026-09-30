import Alert from "../../../components/AppAlert.jsx";
import {useEffect,useMemo,useState} from "react";
import {Button,Container,Form} from "react-bootstrap";
import {Link,useParams} from "react-router-dom";
import {worksheetTypes} from "./RecipeWorksheetsPage.jsx";
import "../../../styles/CostingWorksheets.css";

const rows=value=>Array.isArray(value)?value:Array.isArray(value?.data)?value.data:Array.isArray(value?.recipes)?value.recipes:Array.isArray(value?.recipeCostings)?value.recipeCostings:[];
const id=value=>typeof value==="object"?value?._id||"":value||"";
const name=value=>typeof value==="object"?value?.name||value?.legalName||"":value||"";
const money=value=>Number(value||0).toLocaleString("en-US",{style:"currency",currency:"USD"});
const measure=item=>[item.imperialQuantity,name(item.imperialUnit)].filter(value=>value!==null&&value!==undefined&&value!=="").join(" ")||[item.metricQuantity,name(item.metricUnit)].filter(value=>value!==null&&value!==undefined&&value!=="").join(" ")||"-";

const columnSets={
 "bakery-recipe-costing":["Ingredient","Amount","Unit","Total Cost"],
 "chef-recipe-cost-calculator":["Ingredient","Ingredient Amount","Amount Needed","Item Cost"],
 "food-cost-analysis":["Ingredient","Portion Size","Price","Units","Quantity Per Unit","Item Cost"],
 "food-cost-spreadsheet":["Ingredient","Measure","Purchase Cost / Unit","Actual Ingredient Cost"],
 "food-production":["Food Item","Persons Assigned","Recipe Product","Grade Group","Portion Size","Planned Total","Amount Used","Leftover"],
 "meal-prep-cost-estimation":["Product Name","Quantity","Cost Per Unit","Total Cost"],
 "recipe-analysis":["Ingredient","Quantity","Preparation Yield","Purchase Quantity","Purchase Unit","Converted Quantity","Per Serving","Remaining"],
 "recipe-costing":["Recipe Unit","Quantity","Ingredient","Unit Cost","Extension"],
 "restaurant-recipe-costing":["Ingredient","Purchase Unit","Purchase Cost","Unit Cost","Amount Needed","Ingredient Cost"],
 "standardized-recipe-cost":["Item","Amount","Unit Cost","Total Cost"],
 default:["Ingredient","Amount","Unit","Unit Cost","Total Cost"]
};

export default function CostingWorksheetPage(){
 const {worksheet}=useParams();
 const definition=worksheetTypes.find(item=>item.slug===worksheet)||worksheetTypes[0];
 const [recipes,setRecipes]=useState([]);const [costings,setCostings]=useState([]);const [selectedId,setSelectedId]=useState("");const [error,setError]=useState("");
 useEffect(()=>{Promise.all([fetch("/api/recipes"),fetch("/api/recipe-costings")]).then(async responses=>{const payloads=await Promise.all(responses.map(async response=>{const payload=await response.json().catch(()=>null);if(!response.ok)throw new Error(payload?.message||"Failed to load costing data.");return payload;}));const recipeRows=[...rows(payloads[0])].sort((left,right)=>String(left.name||"").localeCompare(String(right.name||""),undefined,{sensitivity:"base"}));setRecipes(recipeRows);setCostings(rows(payloads[1]));setSelectedId(current=>current||recipeRows[0]?._id||"");}).catch(loadError=>setError(loadError.message));},[]);
 const recipe=recipes.find(item=>item._id===selectedId)||null;
 const costing=costings.find(item=>id(item.recipe)===selectedId)||null;
 const ingredientRows=useMemo(()=>{const costLines=costing?.ingredients||[];return (recipe?.ingredients||[]).map((item,index)=>({...item,...(costLines[index]||{}),ingredient:item.ingredient})).sort((left,right)=>name(left.ingredient).localeCompare(name(right.ingredient),undefined,{sensitivity:"base"}));},[recipe,costing]);
 const ingredientCost=ingredientRows.reduce((total,item)=>total+Number(item.totalCost||0),0);const suggestedPrice=Number(costing?.pricing?.suggestedPrice??recipe?.suggestedPrice??0);const portions=Number(recipe?.servings||0);const portionCost=portions?ingredientCost/portions:0;const margin=suggestedPrice-portionCost;const foodCostPercent=suggestedPrice?portionCost/suggestedPrice*100:0;
 const columns=columnSets[worksheet]||columnSets.default;
 const costingAppHref=useMemo(()=>{
  if(!selectedId)return "";
  const shellUrl=new URL("/applications/recipe-costing",`${window.location.protocol}//${window.location.hostname}:5174`);
  shellUrl.searchParams.set("appPath",`/recipe-costings?recipe=${encodeURIComponent(selectedId)}`);
  return shellUrl.href;
 },[selectedId]);
 const valueFor=(column,item)=>({"Ingredient":name(item.ingredient),"Item":name(item.ingredient),"Product Name":name(item.ingredient),"Food Item":name(item.ingredient),"Recipe Unit":name(item.imperialUnit)||name(item.metricUnit)||"-","Amount":item.imperialQuantity??item.metricQuantity??"-","Ingredient Amount":measure(item),"Amount Needed":measure(item),"Quantity":item.imperialQuantity??item.metricQuantity??"-","Portion Size":measure(item),"Measure":measure(item),"Unit":name(item.imperialUnit)||name(item.metricUnit)||"-","Purchase Unit":item.vendorPackImperialDisplay||item.vendorPackMetricDisplay||"-","Purchase Cost":money(item.vendorPackCost),"Purchase Cost / Unit":money(item.unitCost),"Price":money(item.vendorPackCost),"Units":item.vendorPackImperialDisplay||item.vendorPackMetricDisplay||"-","Quantity Per Unit":measure(item),"Unit Cost":money(item.unitCost),"Cost Per Unit":money(item.unitCost),"Item Cost":money(item.totalCost),"Ingredient Cost":money(item.totalCost),"Actual Ingredient Cost":money(item.totalCost),"Extension":money(item.totalCost),"Total Cost":money(item.totalCost),"Preparation Yield":item.preparation||"-","Purchase Quantity":"-","Converted Quantity":measure(item),"Per Serving":portions?measure({...item,imperialQuantity:item.imperialQuantity/portions,metricQuantity:item.metricQuantity/portions}):"-","Remaining":"-","Persons Assigned":"-","Recipe Product":recipe?.recipeNumber||"-","Grade Group":"-","Planned Total":measure(item),"Amount Used":"-","Leftover":"-"}[column]??"-");
 if(worksheet==="cash-flow"){
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const sections=["Income","Other Income","Payroll / Deductions","Debts","Operating Expenses"];
  return <Container fluid className="costing-worksheet-page py-4 px-3 px-lg-4"><div className="costing-toolbar"><div><Link to="/recipes/costing-worksheets">← All costing sheets</Link><h1>{definition.title}</h1></div><div className="costing-actions"><Button type="button" variant="outline-primary" onClick={()=>window.print()}>Print Worksheet</Button></div></div><section className="costing-sheet"><header className="costing-sheet-header"><h2>Cash Flow Sheet</h2></header><div className="table-responsive"><table className="costing-grid cash-flow-grid"><thead><tr><th>Account</th>{months.map(month=><th key={month}>{month}</th>)}<th>Total</th><th>Average</th></tr></thead><tbody><tr><th>Start Balance</th>{months.map(month=><td key={month}>&nbsp;</td>)}<td/><td/></tr><tr><th>End Balance</th>{months.map(month=><td key={month}>&nbsp;</td>)}<td/><td/></tr>{sections.flatMap(section=>[<tr className="cash-section" key={section}><th colSpan="15">{section}</th></tr>,...Array.from({length:4},(_,index)=><tr key={`${section}-${index}`}><td>&nbsp;</td>{months.map(month=><td key={month}/>) }<td/><td/></tr>)])}</tbody></table></div></section></Container>;
 }
 return <Container fluid className="costing-worksheet-page py-4 px-3 px-lg-4">
  <div className="costing-toolbar"><div><Link to="/recipes/costing-worksheets">← All costing sheets</Link><h1>{definition.title}</h1></div><div className="costing-actions"><Button as="a" href={costingAppHref||undefined} target="_top" variant="primary" disabled={!selectedId}>Open in Recipe Costing App</Button><Button type="button" variant="outline-primary" onClick={()=>window.print()}>Print Worksheet</Button></div></div>
  {error?<Alert variant="danger" onClose={()=>setError("")}>{error}</Alert>:null}
  <section className="costing-sheet">
   <header className="costing-sheet-header"><h2>{definition.title}</h2><div className="costing-meta-grid"><label>Recipe<Form.Select value={selectedId} onChange={event=>setSelectedId(event.target.value)}><option value="">Select recipe</option>{recipes.map(item=><option key={item._id} value={item._id}>{item.name}</option>)}</Form.Select></label><div><span>Recipe Number</span><strong>{recipe?.recipeNumber||"-"}</strong></div><div><span>Recipe Yield</span><strong>{recipe?measure(recipe.yield||{}):"-"}</strong></div><div><span>Servings</span><strong>{recipe?.servings||"-"}</strong></div><div><span>Portion Size</span><strong>{recipe?measure(recipe.servingSize||{}):"-"}</strong></div><div><span>Date Costed</span><strong>{costing?.updatedAt?new Date(costing.updatedAt).toLocaleDateString():new Date().toLocaleDateString()}</strong></div></div></header>
   <div className="table-responsive"><table className="costing-grid"><thead><tr>{columns.map(column=><th key={column}>{column}</th>)}</tr></thead><tbody>{ingredientRows.map((item,index)=><tr key={item._id||index}>{columns.map(column=><td key={column}>{valueFor(column,item)}</td>)}</tr>)}{Array.from({length:Math.max(0,12-ingredientRows.length)},(_,index)=><tr key={`blank-${index}`}>{columns.map(column=><td key={column}>&nbsp;</td>)}</tr>)}</tbody></table></div>
   <footer className="costing-summary"><div><span>Ingredient Cost</span><strong>{money(ingredientCost)}</strong></div><div><span>Portion Cost</span><strong>{money(portionCost)}</strong></div><div><span>Suggested Price</span><strong>{money(suggestedPrice)}</strong></div><div><span>Contribution Margin</span><strong>{money(margin)}</strong></div><div><span>Food Cost %</span><strong>{foodCostPercent.toFixed(2)}%</strong></div></footer>
  </section>
 </Container>;
}
