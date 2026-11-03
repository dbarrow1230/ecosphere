import {isNonIngredientLine,rowName} from "@shared/culinary/ingredientRows.js";
import {Button,Card,Form,Table} from "react-bootstrap";
import {costLine,idOf,offersFor} from "@shared/culinary/pricing.js";

export default function RecipeIngredientsModule({data,lookups,SelectOptions,arrayChange,chooseVendor,chooseIngredient,chooseVendorPrice,removeRow,addIngredient}){
 const units=[...(lookups.imperialUnits||[]),...(lookups.metricUnits||[])];
 return <Card><Card.Body>
  <div className="table-responsive"><Table bordered hover align="middle"><thead><tr><th>Ingredient</th><th>Vendor</th><th>Imperial</th><th>Metric</th><th>Preparation / time</th><th/></tr></thead><tbody>{data.ingredients.flatMap((item,index)=>{
   if(isNonIngredientLine(item))return [<tr key={`label-${item._id||index}`} className="recipe-ingredient-label"><td colSpan={5}><Form.Control aria-label="Ingredient label" value={rowName(item)} onChange={event=>arrayChange("ingredients",index,"sourceName",event.target.value)}/></td><td><Button type="button" variant="outline-danger" size="sm" onClick={()=>removeRow("ingredients",index)}>Remove</Button></td></tr>];
   const offers=offersFor(lookups.vendorIngredientPrices||[],{business:data.business,ingredient:item.ingredient},units);
   const vendorIds=new Set(offers.map(price=>idOf(price.vendor)));
   const vendors=(lookups.vendors||[]).filter(vendor=>vendor.isActive!==false&&vendorIds.has(idOf(vendor)));
   const prices=offers.filter(price=>!item.vendor||idOf(price.vendor)===idOf(item.vendor));
   const ingredient=(lookups.ingredients||[]).find(record=>idOf(record)===idOf(item.ingredient));
   const lowest=new Map();
   for(const offer of offers){const value=offer.comparison;if(value&&!lowest.has(value.dimension))lowest.set(value.dimension,value.normalizedUnitCost);}
   const quantity=system=><div className="d-flex gap-2"><Form.Control aria-label={`${system} quantity`} type="number" min="0" step="any" value={item[`${system}Quantity`]??""} onChange={event=>arrayChange("ingredients",index,`${system}Quantity`,event.target.value)}/><Form.Select aria-label={`${system} unit`} value={item[`${system}Unit`]||""} onChange={event=>arrayChange("ingredients",index,`${system}Unit`,event.target.value)}><SelectOptions items={lookups[`${system}Units`]} placeholder="Unit"/></Form.Select></div>;
   return [<tr key={item._id||index}>
    <td style={{minWidth:210}}><Form.Select aria-label="Saved ingredient" value={item.ingredient||""} onChange={event=>chooseIngredient(index,event.target.value)}><SelectOptions items={lookups.ingredients} placeholder="Select ingredient"/></Form.Select><Form.Control className="mt-2" aria-label="Ingredient name" value={item.sourceName||ingredient?.name||""} placeholder="Or enter new ingredient" onChange={event=>arrayChange("ingredients",index,"sourceName",event.target.value)}/></td>
    <td style={{minWidth:180}}><Form.Select aria-label="Ingredient vendor" value={item.vendor||""} onChange={event=>chooseVendor(index,event.target.value)}><SelectOptions items={vendors} placeholder="All supplying vendors"/></Form.Select></td>
    <td style={{minWidth:190}}>{quantity("imperial")}</td><td style={{minWidth:190}}>{quantity("metric")}</td>
    <td><Form.Control aria-label="Preparation" value={item.preparation} onChange={event=>arrayChange("ingredients",index,"preparation",event.target.value)}/><Form.Control className="mt-2" aria-label="Time" value={item.time} onChange={event=>arrayChange("ingredients",index,"time",event.target.value)}/></td>
    <td><Button type="button" size="sm" variant="outline-danger" onClick={()=>removeRow("ingredients",index)}>Remove</Button></td>
   </tr>,<tr key={`cost-${item._id||index}`} className="table-light"><td colSpan={4}>
    <Form.Label>Vendor product</Form.Label><Form.Select aria-label="Vendor product" value={item.vendorIngredientPrice||""} disabled={!item.ingredient||!data.business} onChange={event=>chooseVendorPrice(index,event.target.value)}><option value="">No vendor price selected</option>{prices.map(price=><option key={price._id} value={price._id}>{[price.vendor?.legalName||price.vendor?.name,price.brand,price.packSizeName,price.sku].filter(Boolean).join(" · ")} — ${Number(price.packCost).toFixed(2)} / pack{price.isPreferred?" (Preferred)":""}</option>)}</Form.Select>
    {!offers.length?<Form.Text>No vendor pricing.</Form.Text>:<details className="mt-2"><summary>Compare all vendor offers ({offers.length})</summary><Table size="sm" bordered className="mt-2"><thead><tr><th>Vendor / product</th><th>Pack size</th><th>Pack cost</th><th>Normalized cost</th><th>Recipe cost</th><th/></tr></thead><tbody>{offers.map(price=>{
     const comparison=price.comparison;const calculation=costLine(item,price,units);
     return <tr key={price._id}><td>{price.vendor?.legalName||price.vendor?.name||"Unknown vendor"} · {price.brand} {price.sku}{price.isPreferred?" · Preferred":""}</td><td>{price.packSizeName} {price.metricDisplay||price.imperialDisplay||comparison&&`${comparison.quantity} ${comparison.unit?.symbol||comparison.unit?.name||""}`}</td><td>${Number(price.packCost).toFixed(2)}</td><td>{comparison?`$${comparison.normalizedUnitCost.toFixed(6)}/${comparison.baseUnit}${comparison.normalizedUnitCost===lowest.get(comparison.dimension)?" · Lowest comparable":""}`:"Measurement required"}</td><td>{calculation.error?"Cannot convert":`$${calculation.totalCost.toFixed(2)}`}</td><td><Button type="button" size="sm" disabled={Boolean(calculation.error)} onClick={()=>chooseVendorPrice(index,price._id)}>Select</Button></td></tr>;
    })}</tbody></Table></details>}
   </td><td><Form.Label>Ingredient note</Form.Label><Form.Control value={item.note} onChange={event=>arrayChange("ingredients",index,"note",event.target.value)}/></td><td><strong>{item.conversionError?"Needs review":`$${Number(item.totalCost||0).toFixed(2)}`}</strong>{item.conversionError?<div role="alert">{item.conversionError}</div>:null}</td></tr>];
  })}</tbody></Table></div><Button type="button" variant="outline-primary" onClick={addIngredient}>Add Ingredient</Button><Button type="button" className="ms-2" variant="outline-primary" onClick={()=>addIngredient("label")}>Add Label</Button>
 </Card.Body></Card>;
}


