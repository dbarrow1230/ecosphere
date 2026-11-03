const fields=[
 ["calories","Calories"],["totalFat","Total Fat"],["saturatedFat","Saturated Fat"],["transFat","Trans Fat"],
 ["polyunsaturatedFat","Polyunsaturated Fat"],["monounsaturatedFat","Monounsaturated Fat"],["cholesterol","Cholesterol"],
 ["sodium","Sodium"],["potassium","Potassium"],["totalCarbohydrate","Total Carbohydrate"],["dietaryFiber","Dietary Fiber"],
 ["sugars","Sugars"],["protein","Protein"],["vitaminA","Vitamin A"],["vitaminB6","Vitamin B6"],["vitaminB12","Vitamin B12"],
 ["vitaminC","Vitamin C"],["vitaminD","Vitamin D"],["vitaminE","Vitamin E"],["calcium","Calcium"],["magnesium","Magnesium"],["iron","Iron"]
];

export const hasNutrition=nutrition=>fields.some(([key])=>String(nutrition?.[key]||"").trim());

const name=value=>typeof value==="object"?value?.name||value?.symbol||"":String(value||"");
const quantity=value=>Number.isFinite(Number(value))?Number(Number(value).toFixed(2)):value;
const measure=(value,unit)=>value===null||value===undefined||value===""?"":`${quantity(value)} ${name(unit)}`.trim();

export default function NutritionFacts({nutrition={},servingSize={}}){
 const rows=fields.filter(([key])=>String(nutrition[key]||"").trim());
 if(!rows.length)return null;
 const calories=rows.find(([key])=>key==="calories");
 const remaining=rows.filter(([key])=>key!=="calories");

 return(
  <aside className="nutrition-facts" aria-label="Nutrition information">
   <h2>Nutrition Facts</h2>
   <p className="nutrition-facts-serving"><strong>Serving size</strong><span>{[measure(servingSize.imperialQuantity,servingSize.imperialUnit),measure(servingSize.metricQuantity,servingSize.metricUnit)].filter(Boolean).map((value,index)=><span className="recipe-measure-line" key={index}>{value}</span>)}{!measure(servingSize.imperialQuantity,servingSize.imperialUnit)&&!measure(servingSize.metricQuantity,servingSize.metricUnit)?"Per serving":null}</span></p>
   {calories?<div className="nutrition-facts-calories"><span>Calories</span><strong>{calories[0]&&nutrition.calories}</strong></div>:null}
   <div className="nutrition-facts-divider"/>
   {remaining.map(([key,label])=><div className="nutrition-facts-row" key={key}><span>{label}</span><strong>{nutrition[key]}</strong></div>)}
  </aside>
 );
}
