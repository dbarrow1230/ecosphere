const itemName=value=>typeof value==="object"?value?.name||value?.title||"":String(value||"");
const unique=values=>[...new Set((values||[]).map(itemName).map(value=>value.trim()).filter(Boolean))];

export default function RecipeOverviewRelated({techniques=[],equipment=[],allergens=[]}){
 const techniqueItems=unique(techniques);
 const equipmentItems=unique(equipment);
 if(!techniqueItems.length&&!equipmentItems.length&&!allergens.length)return null;
 return <section className="recipe-related-overview">
  <div><h3>Techniques</h3><ul>{techniqueItems.map(item=><li className="recipe-technique-bullet" key={item}>{item}</li>)}</ul></div>
  <div><h3>Equipment</h3><ul>{equipmentItems.map(item=><li className="recipe-equipment-bullet" key={item}>{item}</li>)}</ul></div>
  <div><h3>Allergens</h3><ul>{allergens.map(item=><li className="recipe-allergen-bullet" key={item._id||itemName(item)}><span aria-hidden="true">{item.emoji||"⚠"}</span>{itemName(item)}</li>)}</ul></div>
 </section>;
}
