import assert from "node:assert/strict";
import {test} from "node:test";
import {canManagePublicWebsites} from "../websiteAccess.js";
import {businessStyle,assetUrl} from "../usePublicBusiness.js";
import {normalizeOrder,publicProduct} from "../../backend/publicWebsiteRoutes.js";

test("website management allows owners/admins and denies visitors, staff, and managers",()=>{
 for(const user of [null,{}, {role:"manager"},{role:"staff"},{role:"admin assistant"},{roleAssignments:[{role:"admin",isActive:false}]}])assert.equal(canManagePublicWebsites(user),false);
 for(const user of [{role:"owner"},{role:{name:"Administrator"}},{role:{$oid:"69edf92e1e6593dd5369f718"}},{roleAssignments:[{role:{name:"admin"},isActive:true}]}])assert.equal(canManagePublicWebsites(user),true);
});
test("public branding uses saved theme values without a substitute palette",()=>{
 assert.deepEqual(businessStyle(null),{});
 const style=businessStyle({themeColors:{primary:{value:"var(--saved-primary)"},text:"var(--saved-text)",fontBody:{fontName:"Saved font",fallbackFont:"sans-serif"}}});
 assert.deepEqual(style,{"--primary":"var(--saved-primary)","--text":"var(--saved-text)","--font-body":'"Saved font",sans-serif'});
 assert.equal(assetUrl("data:image/png;base64,AA=="),"data:image/png;base64,AA==");
});
const catalog=[{id:"product-a",name:"Saved product",price:19.95,stock:3,cost:2,notes:"private",serialNumber:"private"},{id:"quote-item",name:"Quote item",price:null,stock:null}];
const customer={name:"Test Customer",email:"test@example.invalid"};
test("order pricing comes from the catalog and ignores customer totals or prices",()=>{
 const order=normalizeOrder({customer,items:[{productId:"product-a",quantity:2,unitPrice:.01}],subtotal:.02,status:"completed"},catalog);
 assert.equal(order.subtotal,39.9);assert.equal(order.items[0].unitPrice,19.95);assert.equal(order.status,undefined);
});
test("orders reject missing products, excessive stock, duplicate items, and fractional quantities",()=>{
 for(const items of [[{productId:"missing",quantity:1}],[{productId:"product-a",quantity:4}],[{productId:"product-a",quantity:1.5}],[{productId:"product-a",quantity:1},{productId:"product-a",quantity:1}]])assert.throws(()=>normalizeOrder({customer,items},catalog));
});
test("unpriced equipment stays a quote, and private fields stay out of public products",()=>{
 assert.equal(normalizeOrder({customer,items:[{productId:"quote-item",quantity:1}]},catalog).subtotal,null);
 const row=publicProduct(catalog[0]);assert.equal(row.cost,undefined);assert.equal(row.notes,undefined);assert.equal(row.serialNumber,undefined);assert.equal(row.price,19.95);
});
