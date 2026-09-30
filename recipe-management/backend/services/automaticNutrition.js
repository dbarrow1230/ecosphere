import {calculateNutrition,usdaRequest} from './nutrition.js';
import {convertBetweenUnits} from '../../src/utils/measurementConversion.js';

const normalize=value=>String(value||'').toLowerCase().replace(/without salt|no salt added/g,'unsalted').replace(/with salt/g,'salted').replace(/confectioners[’']? sugar|icing sugar/g,'powdered sugar').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const tokens=value=>normalize(value).split(' ').filter(word=>word&&!['fresh','chopped','diced','minced','sliced','finely','of'].includes(word)).map(word=>word.length>3?word.replace(/s$/,''):word);
export function chooseFood(query,foods){
 const wanted=tokens(query);
 if(!wanted.length)return null;
 const scored=foods.map(food=>{
  const found=tokens(food.description),coverage=wanted.filter(word=>found.includes(word)).length/wanted.length;
  const score=coverage*.8+(wanted.filter(word=>found.includes(word)).length/Math.max(found.length,wanted.length))*.2;
  return {food,score,coverage};
 }).filter(item=>item.coverage===1).sort((a,b)=>b.score-a.score);
 const top=scored[0],next=scored[1];
 if(!top||top.score<.88)return null;
 if(next&&top.score-next.score<.035&&normalize(top.food.description)!==normalize(next.food.description))return null;
 return top.food;
}
const volume={ml:1,milliliter:1,milliliters:1,l:1000,liter:1000,liters:1000,tsp:4.92892159375,teaspoon:4.92892159375,teaspoons:4.92892159375,tbsp:14.78676478125,tablespoon:14.78676478125,tablespoons:14.78676478125,cup:236.5882365,cups:236.5882365,'fl oz':29.5735295625,'fluid ounce':29.5735295625,pt:473.176473,pint:473.176473,qt:946.352946,quart:946.352946};
const unitNames=unit=>[normalize(unit?.symbol),normalize(unit?.name)].filter(Boolean);
export function ingredientGrams(item,food){
 for(const system of ['metric','imperial']){
  const quantity=Number(item[`${system}Quantity`]),unit=item[`${system}Unit`];
  if(!Number.isFinite(quantity)||quantity<=0||!unit)continue;
  const grams=convertBetweenUnits(quantity,'source','grams',[{...unit,_id:'source'},{_id:'grams',name:'gram',symbol:'g'}]);
  if(grams!==null)return grams;
 }
 for(const system of ['metric','imperial']){
  const quantity=Number(item[`${system}Quantity`]),unit=item[`${system}Unit`];
  if(!Number.isFinite(quantity)||quantity<=0||!unit)continue;
  const names=unitNames(unit),factor=names.map(name=>volume[name]).find(Boolean);
  for(const portion of food.foodPortions||[]){
   if(!(portion.gramWeight>0)||!(portion.amount>0))continue;
   const label=normalize(portion.modifier||portion.portionDescription||portion.measureUnit?.name);
   // Qualified measures (packed, chopped, large, etc.) need an explicit matching description.
   const portionFactor=volume[label];
   if(factor&&portionFactor)return quantity*factor/(portion.amount*portionFactor)*portion.gramWeight;
   if(!factor&&names.includes(label))return quantity/portion.amount*portion.gramWeight;
  }
 }
 return null;
}
export async function enrichNutrition(recipe,request=usdaRequest){
 const issues=[],matches=[],foods=[];
 const servings=Number(recipe.servings);
 if(!Number.isFinite(servings)||servings<=0)issues.push('Number of servings is missing or invalid.');
 if(!recipe.ingredients?.length)issues.push('No ingredients are available.');
 if(recipe.ingredients?.length>100)issues.push('Automatic nutrition supports up to 100 ingredients per recipe.');
 if(issues.length)return {status:'needs_review',issues,matches};
 for(const [index,item] of recipe.ingredients.entries()){
  const name=item.ingredient?.name||item.sourceName||'';
  if(!name){issues.push(`Ingredient ${index+1}: name is missing.`);continue;}
  const query=/\bunsalted\b/i.test(name)?name.replace(/\bunsalted\b/ig,'').trim()+' without salt':name;
  const search=await request('foods/search',{query,pageSize:20,dataType:['Foundation','SR Legacy']});
  const selected=chooseFood(name,search.foods||[]);
  if(!selected){issues.push(`${name}: no unambiguous USDA match.`);continue;}
  const food=await request(`food/${selected.fdcId}`);
  const grams=ingredientGrams(item,food);
  if(!(grams>0)){issues.push(`${name}: weight cannot be resolved from the recipe quantity and USDA portions.`);continue;}
  matches.push({index,name,fdcId:food.fdcId,description:food.description,grams});foods.push(food);
 }
 if(issues.length)return {status:'needs_review',issues,matches};
 const result=calculateNutrition(matches,servings,foods);
 return {status:'complete',issues:[],matches,...result};
}
