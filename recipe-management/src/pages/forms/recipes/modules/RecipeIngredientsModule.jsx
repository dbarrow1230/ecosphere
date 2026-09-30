import Alert from "../../../../components/AppAlert.jsx";
import {Button,Card,Form,Table} from "react-bootstrap";

const objectId=value=>typeof value==="object"?String(value?._id||value?.id||""):String(value||"");

export default function RecipeIngredientsModule({data,lookups,SelectOptions,arrayChange,chooseVendor,chooseVendorPrice,removeRow,addIngredient}){
 return <Card><Card.Body>
  <Alert variant="info">Vendor and pricing selections are optional. Parsed ingredient names will be created as basic Ingredient records when the recipe is saved; vendor packs and costs can be linked later.</Alert>
  <div className="table-responsive">
   <Table bordered hover align="middle" className="mb-3">
    <thead><tr><th>Vendor</th><th>Imperial</th><th>Metric</th><th>Ingredient</th><th>Preparation</th><th>Time</th><th aria-label="Actions"/></tr></thead>
    <tbody>{data.ingredients.map((item,index)=>{
     const activeOffers=(lookups.vendorIngredientPrices||[]).filter(price=>price.isActive!==false);
     const vendors=(lookups.vendors||[]).filter(vendor=>vendor.isActive!==false).sort((a,b)=>String(a.legalName||a.name||"").localeCompare(String(b.legalName||b.name||"")));
     const ingredientRecord=(lookups.ingredients||[]).find(ingredient=>objectId(ingredient)===objectId(item.ingredient));
     const ingredientName=item.sourceName||ingredientRecord?.name||"";
     return <tr key={item._id||index}>
      <td style={{minWidth:190}}><Form.Select value={item.vendor||""} onChange={event=>chooseVendor(index,event.target.value)}><SelectOptions items={vendors} placeholder="Optional vendor"/></Form.Select></td>
      <td style={{minWidth:210}}><div className="d-flex gap-2"><Form.Control aria-label="Imperial quantity" type="number" step="any" value={item.imperialQuantity??""} onChange={event=>arrayChange("ingredients",index,"imperialQuantity",event.target.value)} placeholder="Qty"/><Form.Select aria-label="Imperial unit" value={item.imperialUnit} onChange={event=>arrayChange("ingredients",index,"imperialUnit",event.target.value)}><SelectOptions items={lookups.imperialUnits} placeholder="Unit"/></Form.Select></div></td>
      <td style={{minWidth:210}}><div className="d-flex gap-2"><Form.Control aria-label="Metric quantity" type="number" step="any" value={item.metricQuantity??""} onChange={event=>arrayChange("ingredients",index,"metricQuantity",event.target.value)} placeholder="Qty"/><Form.Select aria-label="Metric unit" value={item.metricUnit} onChange={event=>arrayChange("ingredients",index,"metricUnit",event.target.value)}><SelectOptions items={lookups.metricUnits} placeholder="Unit"/></Form.Select></div></td>
      <td style={{minWidth:220}}><Form.Control aria-label="Ingredient" value={ingredientName} onChange={event=>{arrayChange("ingredients",index,"ingredient","");arrayChange("ingredients",index,"sourceName",event.target.value);}} placeholder="Ingredient"/></td>
      <td style={{minWidth:150}}><Form.Control value={item.preparation} onChange={event=>arrayChange("ingredients",index,"preparation",event.target.value)}/></td>
      <td style={{minWidth:100}}><Form.Control value={item.time} onChange={event=>arrayChange("ingredients",index,"time",event.target.value)}/></td>
      <td><Button type="button" size="sm" variant="outline-danger" onClick={()=>removeRow("ingredients",index)}>Remove</Button></td>
     </tr>;
    }).flatMap((row,index)=>{
     const item=data.ingredients[index];
     const prices=(lookups.vendorIngredientPrices||[]).filter(price=>price.isActive!==false&&objectId(price.ingredient)===item.ingredient).sort((a,b)=>String(a.vendor?.legalName||a.vendor?.name||"").localeCompare(String(b.vendor?.legalName||b.vendor?.name||"")));
     return [row,<tr key={`cost-${item._id||index}`} className="table-light"><td colSpan="3"><strong>Optional Vendor Pricing</strong><Form.Select className="mt-2" value={item.vendorIngredientPrice||""} onChange={event=>chooseVendorPrice(index,event.target.value)} disabled={!item.ingredient}><option value="">No vendor price selected</option>{prices.map(price=><option key={price._id} value={price._id}>{[price.vendor?.legalName||price.vendor?.name||"Unknown vendor",price.brand,price.packSizeName,price.sku&&`SKU ${price.sku}`].filter(Boolean).join(" · ")} — pack $${Number(price.packCost||0).toFixed(2)} / unit $${Number(price.unitCost||0).toFixed(4)}</option>)}</Form.Select>{item.ingredient&&!prices.length?<Form.Text>Vendor pricing can be added later from the Vendor Ingredients page.</Form.Text>:null}</td><td colSpan="2"><Form.Label>Ingredient note</Form.Label><Form.Control value={item.note} onChange={event=>arrayChange("ingredients",index,"note",event.target.value)}/></td><td colSpan="2"><Form.Label>Estimated cost</Form.Label><Form.Control value={`$${Number(item.totalCost||0).toFixed(2)}`} readOnly/></td></tr>];
    })}</tbody>
   </Table>
  </div>
  <Button type="button" variant="outline-primary" onClick={addIngredient}>Add Ingredient</Button>
 </Card.Body></Card>;
}