const id=value=>typeof value==='object'?String(value?._id||''):String(value||'');
export const categoryParents=category=>category?.parents?.length?category.parents.map(id):[id(category?.parent)];
export function categoryPathIds(category,categories=[]){
 function walk(current,seen){if(!current||seen.has(id(current)))return null;const next=new Set([...seen,id(current)]);for(const parent of categoryParents(current)){if(!parent)return [id(current)];const route=walk(categories.find(item=>id(item)===parent),next);if(route)return [...route,id(current)];}return null;}
 return walk(category,new Set())||[];
}
export function categoryPath(category,categories=[],path=[]){const ids=path.length?path.map(id):categoryPathIds(category,categories);return ids.map(key=>categories.find(item=>id(item)===key)?.name|| (id(category)===key?category.name:'')).filter(Boolean).join(' → ');}
export function categoryWithin(categoryId,parentId,categories=[]){const queue=[id(categoryId)],seen=new Set();while(queue.length){const current=queue.pop();if(current===id(parentId))return true;if(seen.has(current))continue;seen.add(current);queue.push(...categoryParents(categories.find(item=>id(item)===current)).filter(Boolean));}return false;}
