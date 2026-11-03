import express from 'express';
import {protect} from '../../middleware/authMiddleware.js';
import {usdaRequest,calculateNutrition} from '../../services/nutrition.js';
const router=express.Router();
router.use(protect);
router.get('/search',async(req,res)=>{
 const query=String(req.query.query||'').trim();
 if(query.length<2||query.length>150)return res.status(400).json({message:'Enter a food name between 2 and 150 characters.'});
 try{
  const data=await usdaRequest('foods/search',{query,pageSize:12,dataType:['Foundation','SR Legacy','Survey (FNDDS)','Branded']});
  res.json({foods:(data.foods||[]).map(({fdcId,description,dataType})=>({fdcId,description,dataType}))});
 }catch(error){res.status(502).json({message:error.message});}
});
router.post('/calculate',async(req,res)=>{
 const {ingredients,servings}=req.body;
 if(!Array.isArray(ingredients)||!ingredients.length||ingredients.length>100||!Number.isFinite(servings)||servings<=0||ingredients.some(item=>!item||!Number.isInteger(item.fdcId)||item.fdcId<=0||!Number.isFinite(item.grams)||item.grams<=0))return res.status(400).json({message:'Enter servings greater than zero and select a USDA food and gram weight for every ingredient (maximum 100).'});
 try{
  const ids=[...new Set(ingredients.map(item=>item.fdcId))];
  const foods=[];
  for(let index=0;index<ids.length;index+=20){
   foods.push(...await usdaRequest('foods',{fdcIds:ids.slice(index,index+20),format:'full'}));
  }
  res.json(calculateNutrition(ingredients,servings,foods));
 }catch(error){res.status(502).json({message:error.message});}
});
export default router;
