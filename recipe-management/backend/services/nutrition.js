const fields={calories:[1008,'kcal'],totalFat:[1004,'g'],saturatedFat:[1258,'g'],transFat:[1257,'g'],polyunsaturatedFat:[1293,'g'],monounsaturatedFat:[1292,'g'],cholesterol:[1253,'mg'],sodium:[1093,'mg'],potassium:[1092,'mg'],totalCarbohydrate:[1005,'g'],dietaryFiber:[1079,'g'],sugars:[2000,'g'],protein:[1003,'g'],vitaminA:[1106,'µg'],vitaminB6:[1175,'mg'],vitaminB12:[1178,'µg'],vitaminC:[1162,'mg'],vitaminD:[1114,'µg'],vitaminE:[1109,'mg'],calcium:[1087,'mg'],magnesium:[1090,'mg'],iron:[1089,'mg']};
const cache=new Map();
export async function usdaRequest(endpoint,body){
 const key=process.env.USDA_API_KEY;
 if(!key)throw new Error('Nutrition API is not configured. Add USDA_API_KEY to the backend environment and restart the server.');
 const cacheKey=endpoint+JSON.stringify(body||null);
 const cached=cache.get(cacheKey);
 if(cached&&cached.expires>Date.now())return cached.data;
 let response;
 try{
  response=await fetch(`https://api.nal.usda.gov/fdc/v1/${endpoint}?api_key=${encodeURIComponent(key)}`,{
   method:body?'POST':'GET',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)
  });
 }catch{throw new Error('USDA could not be reached. Please try again.');}
 if(!response.ok)throw new Error(response.status===429?'USDA request limit reached. Please try again later.':[401,403].includes(response.status)?'USDA rejected the API key. Check the backend API key.':'USDA could not complete this request. Please try again.');
 const data=await response.json();
 if(cache.size>=250)cache.delete(cache.keys().next().value);
 cache.set(cacheKey,{data,expires:Date.now()+30*60*1000});
 return data;
}
export function calculateNutrition(ingredients,servings,foods){
 if(!Number.isFinite(servings)||servings<=0)throw new Error('Enter a valid number of servings greater than zero.');
 if(!Array.isArray(ingredients)||!ingredients.length||ingredients.length>100)throw new Error('Select between 1 and 100 ingredients.');
 for(const item of ingredients){
  if(!Number.isInteger(item.fdcId)||item.fdcId<=0||!Number.isFinite(item.grams)||item.grams<=0)throw new Error('Every ingredient needs a USDA food and a weight greater than zero in grams.');
 }
 const nutrition={},missing=[];
 for(const [field,[id,unit]] of Object.entries(fields)){
  let total=0,complete=true;
  for(const item of ingredients){
   const food=foods.find(food=>food.fdcId===item.fdcId);
   if(!food)throw new Error('A selected USDA food was not found. Search and select it again.');
   const entries=food.foodNutrients||[];
   let nutrient=entries.find(n=>n.nutrient?.id===id);
   if(field==='calories'&&!nutrient)nutrient=entries.find(n=>n.nutrient?.id===2048)||entries.find(n=>n.nutrient?.id===2047);
   // Missing nutrients are unknown, not zero. Do not publish incomplete totals.
   if(!nutrient||nutrient.amount===null||!Number.isFinite(nutrient.amount)||String(nutrient.nutrient.unitName).toLowerCase()!==unit.toLowerCase().replace('µ','u')){complete=false;continue;}
   total+=nutrient.amount*item.grams/100/servings;
  }
  nutrition[field]=complete?`${Number(total.toFixed(2))}${field==='calories'?'':` ${unit}`}`:'';
  if(!complete)missing.push(field);
 }
 return {nutrition,missing,source:'USDA FoodData Central',servings};
}
