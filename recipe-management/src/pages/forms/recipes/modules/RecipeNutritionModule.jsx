import {useState} from "react";
import {Button,Card,Form} from "react-bootstrap";
import Alert from "../../../../components/AppAlert.jsx";

export default function RecipeNutritionModule({nutrition,fields,nestedChange,recipeId,onApply}){
 const [status,setStatus]=useState(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[requesting,setRequesting]=useState(false);

 const update=async()=>{
  if(!recipeId)return;
  setRequesting(true);setError('');setNotice('');
  try{
   const response=await fetch(`/api/recipes/${encodeURIComponent(recipeId)}/nutrition-sync`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({force:true})});
   const payload=await response.json().catch(()=>null);
   if(!response.ok)throw new Error(payload?.message||'Unable to update nutrition from USDA.');
   setStatus(payload?.nutritionSync||null);
   if(payload?.nutrition){
    onApply?.(payload.nutrition);
    setNotice('USDA nutrition updated and saved in the backend.');
   }
  }catch(err){setError(err.message);}finally{setRequesting(false);}
 };

 return <Card><Card.Body>
  <h3 className="h5">USDA nutrition</h3>
  <p>Uses the saved recipe’s ingredients, quantities, and servings. Save any ingredient edits first. Nutrition is updated only when you click Update Nutrition from USDA.</p>
  <Button type="button" className="mb-3" onClick={update} disabled={!recipeId||requesting}>{requesting?'Updating nutrition…':'Update Nutrition from USDA'}</Button>
  {!recipeId&&<p>Save this new recipe before updating nutrition from USDA.</p>}
  {status&&<p role="status">{status.status==='complete'?`USDA calculation saved${status.checkedAt?` ${new Date(status.checkedAt).toLocaleString()}`:''}.`:status.status==='needs_review'?'Update needs correction. The fields below still contain unverified values.':status.status==='error'?'USDA could not finish. Retry with Update Nutrition from USDA.':status.status==='pending'?'USDA update is pending.':status.status==='processing'?'USDA update is processing.':'USDA nutrition status received.'}</p>}
  {status?.issues?.length>0&&<ul>{status.issues.map((issue,index)=><li key={index}>{issue}</li>)}</ul>}
  {status?.status==='complete'&&status.missing?.length>0&&<p>USDA did not provide complete data for {status.missing.length} nutrients. Those fields are blank.</p>}
  {requesting&&<Alert variant="info" notification>Updating nutrition from USDA.</Alert>}
  {error&&<Alert variant="danger" onClose={()=>setError('')}>{error}</Alert>}
  {notice&&<Alert variant="success" onClose={()=>setNotice('')}>{notice}</Alert>}
  <div className="recipe-nutrition-grid">{fields.map(([key,title])=><div className="recipe-nutrition-row" key={key}>
   <Form.Label htmlFor={`recipe-nutrition-${key}`}>{title}:</Form.Label>
   <div className="recipe-nutrition-control"><Form.Control id={`recipe-nutrition-${key}`} value={nutrition[key]||''} onChange={event=>nestedChange('nutrition',key,event.target.value)}/></div>
  </div>)}</div>
 </Card.Body></Card>;
}