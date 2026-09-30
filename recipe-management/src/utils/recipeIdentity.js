// Older imported recipes use snake_case names; normalize them for the list/form.
const firstText=(...values)=>values.find(value=>typeof value==='string'&&value.trim())||'';

export const normalizeRecipeIdentity=recipe=>({
 ...recipe,
 name:firstText(recipe.name,recipe.recipe_name),
 recipeNumber:firstText(recipe.recipeNumber,recipe.recipe_number)
});

export const recipeDisplayName=recipe=>firstText(recipe?.name,recipe?.recipe_name)||'Unnamed recipe';
export const compareRecipeNames=(a,b)=>recipeDisplayName(a).localeCompare(recipeDisplayName(b));
