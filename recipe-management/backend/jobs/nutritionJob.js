import Recipe from '../models/recipes/ReceipeModel.js';
import {enrichNutrition} from '../services/automaticNutrition.js';
import {usdaRequest} from '../services/nutrition.js';
let running=false;
let nextRequestAt=0;
const request=async(...args)=>{
 const wait=Math.max(0,nextRequestAt-Date.now());
 if(wait)await new Promise(resolve=>setTimeout(resolve,wait));
 nextRequestAt=Date.now()+4000;
 return usdaRequest(...args);
};
export async function runNutritionJob(){
 if(running||!process.env.USDA_API_KEY)return;
 running=true;
 try{
  const now=new Date();
  const recipe=await Recipe.findOneAndUpdate({$or:[{'nutritionSync.status':'pending'},{'nutritionSync.status':'error','nutritionSync.retryAt':{$lte:now}},{'nutritionSync.status':'processing','nutritionSync.startedAt':{$lt:new Date(Date.now()-30*60*1000)}}]},{$set:{'nutritionSync.status':'processing','nutritionSync.startedAt':now}},{returnDocument:"after",timestamps:false})
   .populate('ingredients.ingredient ingredients.metricUnit ingredients.imperialUnit').lean();
  if(!recipe)return;
  const guard={_id:recipe._id,'nutritionSync.startedAt':now,'nutritionSync.status':'processing'};
  try{
   const result=await enrichNutrition(recipe,request);
   const {nutrition,...metadata}=result;
   const update={nutritionSync:{...metadata,checkedAt:new Date(),source:result.status==='complete'?'USDA FoodData Central':'GPT / imported suggestion'}};
   if(nutrition){update.nutrition=nutrition;update.suggestedNutrition=recipe.suggestedNutrition||recipe.nutrition;}
   await Recipe.collection.updateOne(guard,{$set:update});
  }catch{
   await Recipe.collection.updateOne(guard,{$set:{nutritionSync:{status:'error',issues:['USDA is temporarily unavailable. Nutrition remains unverified; automatic retry is scheduled.'],retryAt:new Date(Date.now()+60*60*1000)}}});
  }
 }catch(error){console.error('Nutrition worker could not process a recipe:',error.name);}
 finally{running=false;}
}
export function startNutritionWorker(){
 const timer=setInterval(()=>void runNutritionJob(),2000);timer.unref();
 void runNutritionJob();
}
