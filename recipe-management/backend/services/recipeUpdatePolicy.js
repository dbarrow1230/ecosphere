const id=value=>String(value?._id||value||'');
const amount=value=>value===''||value==null?null:Number(value);
const signature=items=>(items||[]).map(item=>({ingredient:id(item.ingredient),imperialQuantity:amount(item.imperialQuantity),imperialUnit:id(item.imperialUnit),metricQuantity:amount(item.metricQuantity),metricUnit:id(item.metricUnit)}));
export function nutritionInputsChanged(existing,patch){
 return Object.hasOwn(patch,'servings')&&amount(existing.servings)!==amount(patch.servings)||Object.hasOwn(patch,'ingredients')&&JSON.stringify(signature(existing.ingredients))!==JSON.stringify(signature(patch.ingredients));
}
