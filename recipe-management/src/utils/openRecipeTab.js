export function openRecipeCosting(recipe){
 if(!recipe)return;
 openRecipeWorksheet("/recipe-costings",recipe);
}
export function openRecipeWorksheet(path,recipe=""){
 const url=new URL(path,window.location.origin);
 if(recipe)url.searchParams.set("recipe",recipe);
 window.location.assign(url.href);
}
