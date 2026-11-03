const getId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 if(typeof value._id==="string")return value._id;
 if(typeof value.id==="string")return value.id;
 if(typeof value._id?.$oid==="string")return value._id.$oid;
 if(typeof value.id?.$oid==="string")return value.id.$oid;
 return "";
};

const getName=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value.name||value.title||value.label||"";
};

const getRecipeCategory=recipe=>getName(recipe?.primaryCategory)||getName(recipe?.categories?.[0])||getName(recipe?.category)||"Uncategorized";
const getIngredientCategory=line=>getName(line?.ingredient?.category)||getName(line?.ingredient?.ingredientCategory)||"";

export const buildRecipeDashboardData=({recipes=[],categories=[],recipeCostings=[],menus=[],vendorPrices=[],productCategories=[]})=>{
 const categoryNames=new Map(categories.map(category=>[getId(category),getName(category)]));
 const recipeCategory=recipe=>{const value=recipe?.primaryCategory||recipe?.categories?.[0]||recipe?.category;return categoryNames.get(getId(value))||getRecipeCategory(recipe);};
 const recipeById=new Map(recipes.map(recipe=>[getId(recipe),recipe]));
 const activeRecipes=recipes.filter(recipe=>recipe?.isActive!==false);
 const reviewRecipes=recipes.filter(recipe=>recipe?.isActive===false);
 const recentRecipes=[...recipes]
  .sort((left,right)=>new Date(right.createdAt||0)-new Date(left.createdAt||0))
  .slice(0,5);

 const recipeCategoryCosts=recipeCostings.map(costing=>{
  const recipe=recipeById.get(getId(costing.recipe))||costing.recipe;
  return{
   _id:getId(costing),
   type:"recipe",
   category:recipeCategory(recipe),
   cost:Number(costing?.totals?.totalCost||costing?.totals?.ingredientCost||0),
   date:costing.updatedAt||costing.createdAt||recipe?.updatedAt||recipe?.createdAt
  };
 });

 const productNames=new Map(productCategories.map(category=>[getId(category),getName(category)]));
 const offerById=new Map(vendorPrices.map(offer=>[getId(offer),offer]));
 const ingredientCategoryCosts=recipeCostings.flatMap(costing=>
  (Array.isArray(costing.ingredients)?costing.ingredients:[])
   .map((line,index)=>({
    _id:`${getId(costing)}-ingredient-${index}`,
    type:"ingredient",
    category:productNames.get(getId(offerById.get(getId(line.vendorIngredientPrice))?.productCategory))||getIngredientCategory(line)||"Uncategorized",
    cost:Number(line?.totalCost||0),
    date:costing.updatedAt||costing.createdAt
   }))
   .filter(item=>item.category&&item.cost>0)
 );

 return{
  stats:[
   {label:"Total Recipes",value:recipes.length},
   {label:"Active Recipes",value:activeRecipes.length},
   {label:"Recipes To Review",value:reviewRecipes.length},
   {label:"Categories",value:categories.length}
  ],
  lowStockItems:reviewRecipes.slice(0,5).map(recipe=>({
   _id:getId(recipe),
   name:recipe.name,
   quantity:"Draft",
   unit:"",
   category:recipeCategory(recipe)
  })),
  expiringItems:menus.filter(menu=>menu.isActive!==false).slice(0,5).map(menu=>({_id:getId(menu),name:menu.name,recipeCount:menu.recipeAssignments?.length||menu.recipes?.length||0})),
  recentItems:recentRecipes.map(recipe=>({
   _id:getId(recipe),
   name:recipe.name,
   category:recipeCategory(recipe),
   location:"Recipe Database"
  })),
  missingItems:recipes.map(recipe=>{const missing=[];if(!(recipe.ingredients||[]).length)missing.push("ingredients");if(!(recipe.instructions||recipe.method||recipe.directions||recipe.preparationSteps||recipe.steps)?.length)missing.push("instructions");if(!recipe.servings&&!recipe.yield?.imperialQuantity&&!recipe.yield?.metricQuantity)missing.push("yield or servings");return {_id:getId(recipe),name:recipe.name,note:missing.length?"Missing "+missing.join(", "):""};}).filter(recipe=>recipe.note).slice(0,5),
  categoryCosts:[...recipeCategoryCosts,...ingredientCategoryCosts]
 };
};

