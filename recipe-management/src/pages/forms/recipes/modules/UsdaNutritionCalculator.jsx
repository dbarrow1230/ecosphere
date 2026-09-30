import {useState} from 'react';
import {Button,Form,Table} from 'react-bootstrap';
import Alert from '../../../../components/AppAlert.jsx';
import {convertBetweenUnits} from '../../../../utils/measurementConversion.js';

async function request(url,body){
 let token=localStorage.getItem('token')||sessionStorage.getItem('token')||'';
 try{token=JSON.parse(token);}catch{/* Plain tokens are also supported. */}
 const response=await fetch(url,{method:body?'POST':'GET',credentials:'include',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const payload=await response.json().catch(()=>null);
 if(!response.ok)throw new Error(payload?.message||'Nutrition lookup failed. Please try again.');
 return payload;
}
export default function UsdaNutritionCalculator({ingredients,lookups,servings,onApply}){
 const [rows,setRows]=useState(()=>ingredients.map(item=>{
  const query=item.sourceName||lookups.ingredients?.find(food=>String(food._id)===String(item.ingredient))?.name||'';
  const units=[...(lookups.metricUnits||[]),...(lookups.imperialUnits||[]),{_id:'nutrition-grams',name:'gram',symbol:'g'}];
  let grams=null;
  for(const system of ['metric','imperial']){
   if(item[`${system}Quantity`]===''||item[`${system}Quantity`]==null)continue;
   grams=convertBetweenUnits(item[`${system}Quantity`],item[`${system}Unit`],'nutrition-grams',units);
   if(grams!==null)break;
  }
  return {query,name:query,grams:grams??'',fdcId:'',foods:[]};
 }));
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState(null),[applied,setApplied]=useState(false);
 const change=(index,patch)=>{setRows(current=>current.map((row,i)=>i===index?{...row,...patch}:row));setResult(null);setApplied(false);};
 const search=async index=>{
  setBusy(true);setError('');
  try{const data=await request(`/api/nutrition/search?query=${encodeURIComponent(rows[index].query)}`);change(index,{foods:data.foods,fdcId:''});if(!data.foods.length)setError('No matching foods found. Try a simpler ingredient name.');}
  catch(err){setError(err.message);}finally{setBusy(false);}
 };
 const calculate=async()=>{
  setBusy(true);setError('');setResult(null);setApplied(false);
  try{setResult(await request('/api/nutrition/calculate',{servings:Number(servings),ingredients:rows.map(row=>({fdcId:Number(row.fdcId),grams:Number(row.grams)}))}));}
  catch(err){setError(err.message);}finally{setBusy(false);}
 };
 return <section className="mb-4" aria-label="USDA nutrition calculator">
  <h3 className="h5">Calculate with USDA FoodData Central</h3>
  <p>Match each ingredient to the correct food, including raw or cooked preparation. Weights are for the edible amount used in the entire recipe. Enter gram weights for cups, spoons, and whole items.</p>
  <p>Recipe servings: <strong>{servings||'Not set'}</strong>. Set the number of servings in the Yield tab.</p>
  {error&&<Alert variant="danger" onClose={()=>setError('')}>{error}</Alert>}
  {!rows.length?<Alert variant="info">Add ingredients to the recipe first.</Alert>:<Table responsive bordered>
   <thead><tr><th>Ingredient / search</th><th>USDA food match</th><th>Recipe weight (g)</th></tr></thead>
   <tbody>{rows.map((row,index)=><tr key={index}>
    <td><span>{row.name||`Ingredient ${index+1}`}</span><div className="d-flex gap-2"><Form.Control aria-label={`Search food for ingredient ${index+1}`} value={row.query} disabled={busy} onChange={e=>change(index,{query:e.target.value,fdcId:'',foods:[]})}/><Button type="button" onClick={()=>search(index)} disabled={busy||row.query.trim().length<2}>Search</Button></div></td>
    <td><Form.Select style={{minWidth:220}} aria-label={`USDA match for ingredient ${index+1}`} value={row.fdcId} disabled={busy} onChange={e=>change(index,{fdcId:e.target.value})}><option value="">Select a food match</option>{row.foods.map(food=><option key={food.fdcId} value={food.fdcId}>{food.description} ({food.dataType})</option>)}</Form.Select>{row.fdcId&&<a href={`https://fdc.nal.usda.gov/food-details/${row.fdcId}/nutrients`} target="_blank" rel="noreferrer">View USDA food</a>}</td>
    <td><Form.Control style={{minWidth:100}} type="number" min="0.001" step="any" aria-label={`Gram weight for ingredient ${index+1}`} value={row.grams} disabled={busy} onChange={e=>change(index,{grams:e.target.value})}/></td>
   </tr>)}</tbody>
  </Table>}
  <Button type="button" onClick={calculate} disabled={busy||!rows.length||!Number.isFinite(Number(servings))||Number(servings)<=0||rows.some(row=>!row.fdcId||!Number.isFinite(Number(row.grams))||Number(row.grams)<=0)}>{busy?'Loading USDA data…':'Calculate per serving'}</Button>
  {result&&<div className="mt-3"><h4 className="h6">Estimated nutrition per serving</h4><p>{result.nutrition.calories||'Unknown'} calories · Protein: {result.nutrition.protein||'Unknown'} · Fat: {result.nutrition.totalFat||'Unknown'} · Carbohydrate: {result.nutrition.totalCarbohydrate||'Unknown'}</p>
   {result.missing.length>0&&<Alert variant="warning">USDA does not report every nutrient for every selected food. {result.missing.length} incomplete nutrient totals will remain blank, rather than show misleading zeros.</Alert>}
   <p>Applying replaces the nutrition fields below. Review them, then save the recipe. Recalculate after changing ingredients or servings. Estimates do not account for cooking losses.</p>
   <Button type="button" variant="outline-primary" disabled={applied} onClick={()=>{onApply(result.nutrition);setApplied(true);}}>{applied?'Applied — save recipe to keep values':'Apply nutrition to recipe'}</Button>
  </div>}
  <small className="d-block mt-2">Source: USDA FoodData Central. Existing nutrition remains unchanged until you apply a calculation.</small>
 </section>;
}
