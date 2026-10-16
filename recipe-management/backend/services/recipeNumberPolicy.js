const id=value=>String(value?._id||value||'');
export const recipeClassificationSignature=recipe=>['business','primaryCuisine','primaryCourse','primaryCategory'].map(field=>id(recipe?.[field])).join(':');
export const needsRecipeNumber=(existing,next=existing)=>!String(existing?.recipeNumber||'').trim()||recipeClassificationSignature(existing)!==recipeClassificationSignature(next);
