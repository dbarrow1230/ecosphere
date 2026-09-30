import Category from "../models/recipes/CategoryModel.js";
import Course from "../models/recipes/CourseModel.js";
import Cuisine from "../models/recipes/CuisineModel.js";
import RecipeNumberCounter from "../models/recipes/RecipeNumberCounterModel.js";

const token=value=>String(value||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,4).padEnd(4,"X");

export const generateRecipeNumber=async({business,primaryCourse,primaryCuisine,primaryCategory})=>{
 const [course,cuisine,category]=await Promise.all([Course.findById(primaryCourse).lean(),Cuisine.findById(primaryCuisine).lean(),Category.findById(primaryCategory).lean()]);
 if(!course||!cuisine||!category)throw new Error("Primary course, cuisine, and category are required to generate a recipe number.");
 const prefix=[token(cuisine.slug||cuisine.name),token(course.slug||course.name),token(category.slug||category.name)].join("-");
 const counter=await RecipeNumberCounter.findOneAndUpdate({business,prefix},{$inc:{sequence:1}},{returnDocument:"after",upsert:true,setDefaultsOnInsert:true});
 return{recipeNumber:`${prefix}-${String(counter.sequence).padStart(4,"0")}`,recipeSequence:counter.sequence};
};
