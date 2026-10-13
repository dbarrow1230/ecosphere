import LocationTypeForm from "./forms/reference/LocationTypeForm.jsx";
import {isNonIngredientLine} from "@shared/culinary/ingredientRows.js";
import {useEffect,useState} from "react";
import {Link,useLocation} from "react-router-dom";
import {Button,Form,Modal,Table,Tabs,Tab} from "react-bootstrap";
import {idOf,measurements,normalizeOffer} from "@shared/culinary/pricing.js";
import Alert from "../components/AppAlert.jsx";
import LocationForm from "./forms/reference/LocationForm.jsx";
import "../styles/Purchasing.css";

const money=value=>`$${Number(value||0).toFixed(2)}`;
const request=async(url,body,method="POST")=>{
 const response=await fetch(url,body?{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}:{});
 const data=await response.json().catch(()=>null);
 if(!response.ok)throw new Error(data?.message||"The request failed.");
 return data;
};
const statusName=value=>({partialReceived:"Partially received",submitted:"Submitted",approved:"Approved",sent:"Sent",received:"Received",draft:"Draft",closed:"Closed",cancelled:"Cancelled"}[value]||value);
export function suggestedPurchaseLines(recipe,vendor,offers,records){
 const grouped=new Map();
 for(const line of recipe?.ingredients||[]){
  if(isNonIngredientLine(line))continue;
  const offer=offers.find(offer=>idOf(offer)===idOf(line.vendorIngredientPrice)&&idOf(offer.vendor)===vendor);
  const pack=offer&&normalizeOffer(offer,records),measurement=pack&&measurements(line,records).find(item=>item.dimension===pack.dimension);
  if(!measurement)continue;
  const previous=grouped.get(idOf(offer))||{offering:idOf(offer),base:0,pack:pack.baseQuantity};previous.base+=measurement.baseQuantity;grouped.set(idOf(offer),previous);
 }
 return [...grouped.values()].filter(line=>line.base>0).map(line=>({offering:line.offering,quantity:Math.ceil(line.base/line.pack)}));
}
const emptyDraft=vendor=>({vendor,location:"",expectedDate:"",tax:"0",shipping:"0",notes:"",lines:[]});
export default function Purchasing({user}){
 const location=useLocation(),params=new URLSearchParams(location.search),initialVendor=params.get("vendor")||"",recipe=params.get("recipe")||"";
 const [business,setBusiness]=useState(null),[options,setOptions]=useState({vendors:[],offers:[],ingredients:[],locations:[],records:[],locationTypes:[]});
 const [orders,setOrders]=useState([]),[receipts,setReceipts]=useState([]),[inventory,setInventory]=useState([]);
 const [filter,setFilter]=useState(initialVendor),[tab,setTab]=useState("orders"),[selectedId,setSelectedId]=useState("");
 const [draft,setDraft]=useState(null),[receipt,setReceipt]=useState(null),[locationDraft,setLocationDraft]=useState(null);
 const [locationTypeDraft,setLocationTypeDraft]=useState(null);
 const [error,setError]=useState(""),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false);
 const businessId=idOf(business),actor=idOf(user?.user||user?.data||user);
 const api=(path,body,method)=>request(`/api/purchasing-workflow${path}${path.includes("?")?"&":"?"}business=${encodeURIComponent(businessId)}`,body?{...body,business:businessId,user:actor}:undefined,method);
 const refresh=async()=>{
  const suffix=filter?`?vendor=${encodeURIComponent(filter)}`:"";
  const [orderRows,receiptRows,stock]=await Promise.all([api(`/orders${suffix}`),api(`/receipts${suffix}`),api("/inventory")]);
  setOrders(orderRows);setReceipts(receiptRows);setInventory(stock);
 };
 useEffect(()=>{let active=true;request("/api/app/current-business/recipe-management").then(data=>{if(active)setBusiness(data?.business||data?.data||data);}).catch(err=>{if(active){setError(err.message);setLoading(false);}});return()=>{active=false;};},[]);
 useEffect(()=>{
  if(!businessId)return;let active=true;
  api(`/options${recipe?`?recipe=${encodeURIComponent(recipe)}`:""}`).then(data=>{
   if(!active)return;setOptions(data);
   if(params.get("new")==="1"){
    const vendor=initialVendor||idOf(data.offers.find(offer=>(data.sourceRecipe?.ingredients||[]).some(line=>idOf(line.vendorIngredientPrice)===idOf(offer)))?.vendor);
    const next=emptyDraft(vendor);next.location=idOf(data.locations[0]);
    next.lines=params.get("product")?[{offering:params.get("product"),quantity:1}]:suggestedPurchaseLines(data.sourceRecipe,vendor,data.offers,data.records);
    const planKey=params.get("plan");if(planKey){const stored=JSON.parse(sessionStorage.getItem(`recipe-management-order-plan:${planKey}`)||"null");if(!stored||stored.business!==businessId)throw new Error("The purchase plan belongs to another business or has expired.");Object.assign(next,{vendor:stored.vendor,lines:stored.lines,shipping:stored.shipping||0,menu:stored.menu});}setDraft(next);
   }
  }).catch(err=>active&&setError(err.message));
  return()=>{active=false;};
 },[businessId,recipe,location.search]);
 useEffect(()=>{if(!businessId)return;setLoading(true);refresh().catch(err=>setError(err.message)).finally(()=>setLoading(false));},[businessId,filter]);
 const run=async task=>{setSaving(true);setError("");try{await task();}catch(err){setError(err.message);}finally{setSaving(false);}};
 const vendorName=value=>options.vendors.find(item=>idOf(item)===idOf(value))?.legalName||"Vendor";
 const productName=offer=>options.ingredients.find(item=>idOf(item)===idOf(offer?.ingredient))?.name||"Ingredient";
 const locationName=value=>options.locations.find(item=>idOf(item)===idOf(value))?.name||"Location";
 const selected=orders.find(order=>idOf(order)===selectedId),selectedVendor=selected&&options.vendors.find(vendor=>idOf(vendor)===idOf(selected.vendorRef));
 const newOrder=()=>setDraft({...emptyDraft(filter),location:idOf(options.locations[0]),lines:suggestedPurchaseLines(options.sourceRecipe,filter,options.offers,options.records)});
 const chooseVendor=value=>setDraft(current=>({...current,vendor:value,lines:suggestedPurchaseLines(options.sourceRecipe,value,options.offers,options.records)}));
 const updateDraftLine=(index,changes)=>setDraft(current=>({...current,lines:current.lines.map((line,i)=>i===index?{...line,...changes}:line)}));
 const saveOrder=event=>{event.preventDefault();void run(async()=>{const order=await api(draft.id?`/orders/${draft.id}`:"/orders",{...draft,recipe:recipe||undefined},draft.id?"PUT":"POST");setDraft(null);await refresh();setSelectedId(idOf(order));});};
 const changeStatus=(status,extra={})=>run(async()=>{await api(`/orders/${selectedId}/status`,{status,...extra},"PATCH");await refresh();});
 const receiveOrder=()=>{setError("");setReceipt({orderId:selectedId,token:crypto.randomUUID(),invoiceNumber:"",notes:"",lines:selected.lines.filter(line=>line.orderedQty>(line.receivedQty||0)).map(line=>({line:idOf(line),productName:line.productName,remaining:line.orderedQty-(line.receivedQty||0),accepted:String(line.orderedQty-(line.receivedQty||0)),rejected:"0",lotNumber:"",expiryDate:""}))});};
 const saveReceipt=event=>{event.preventDefault();void run(async()=>{await api(`/orders/${receipt.orderId}/receive`,receipt);setReceipt(null);await refresh();});};
 const saveLocation=event=>{event.preventDefault();void run(async()=>{const data=await request("/api/locations",{...locationDraft,business:businessId,parentLocation:locationDraft.parentLocation||null});const saved=data?.location||data?.data||data;setOptions(current=>({...current,locations:[...current.locations,saved]}));setDraft(current=>({...current,location:idOf(saved)}));setLocationDraft(null);});};
 const saveLocationType=event=>{event.preventDefault();void run(async()=>{const data=await request("/api/location-types",locationTypeDraft);const saved=data?.locationType||data?.data||data;setOptions(current=>({...current,locationTypes:[...current.locationTypes,saved]}));setLocationDraft(current=>({...current,type:idOf(saved)}));setLocationTypeDraft(null);});};
 const orderTable=rows=><Table responsive size="sm"><thead><tr><th>Order</th><th>Vendor</th><th>Status</th><th>Expected</th><th>Total</th><th/></tr></thead><tbody>{rows.map(order=><tr key={idOf(order)}><td>{order.poNumber}</td><td>{vendorName(order.vendorRef)}</td><td>{statusName(order.status)}</td><td>{order.expectedDate?new Date(String(order.expectedDate).slice(0,10)+"T12:00:00").toLocaleDateString():"—"}</td><td>{money(order.total)}</td><td><Button size="sm" variant="outline-primary" onClick={()=>setSelectedId(idOf(order))}>Open</Button></td></tr>)}{!rows.length?<tr><td colSpan={6}>No orders found.</td></tr>:null}</tbody></Table>;
 const compose=selected?`mailto:${selectedVendor?.ordering?.orderingEmail||selectedVendor?.email||""}?subject=${encodeURIComponent(selected.poNumber)}&body=${encodeURIComponent(`${selected.poNumber}\n${selected.lines.map(line=>`${line.orderedQty} packs · ${line.productName} · ${line.packDisplay} · ${money(line.lineTotal)}`).join("\n")}\nTotal: ${money(selected.total)}`)}`:"";
 return <main className="purchasing-page">
  <header className="purchasing-header"><h1>Ordering & Receiving</h1><Button variant="outline-primary" onClick={newOrder} disabled={loading||!businessId}>New Order</Button></header>
  {error?<Alert variant="danger">{error}</Alert>:null}
  <div className="purchasing-toolbar"><Form.Label htmlFor="purchasing-vendor">Vendor</Form.Label><Form.Select id="purchasing-vendor" value={filter} onChange={event=>setFilter(event.target.value)}><option value="">All vendors</option>{options.vendors.map(vendor=><option key={idOf(vendor)} value={idOf(vendor)}>{vendor.legalName}</option>)}</Form.Select><Button as={Link} variant="outline-primary" to="/admin/vendors">Vendors & Products</Button><Button as={Link} variant="outline-primary" to="/menu-planning">Menu Planning</Button></div>
  {loading?<p>Loading orders…</p>:<Tabs activeKey={tab} onSelect={key=>setTab(key)}>
   <Tab eventKey="orders" title="Orders">{orderTable(orders)}</Tab>
   <Tab eventKey="processing" title="Processing">{orderTable(orders.filter(order=>["submitted","approved","sent","partialReceived"].includes(order.status)))}</Tab>
   <Tab eventKey="receiving" title="Receiving">{orderTable(orders.filter(order=>["sent","partialReceived"].includes(order.status)))}{receipts.length?<><h2 className="h5">Receipts</h2><Table responsive size="sm"><thead><tr><th>Receipt</th><th>Vendor</th><th>Date</th><th>Accepted value</th><th/></tr></thead><tbody>{receipts.map(item=><tr key={idOf(item)}><td>{item.receiptNumber}</td><td>{vendorName(item.vendorRef)}</td><td>{new Date(item.receiptDate).toLocaleDateString()}</td><td>{money(item.total)}</td><td><Button variant="outline-primary" size="sm" onClick={()=>setSelectedId(idOf(item.purchaseOrderRef))}>Order</Button></td></tr>)}</tbody></Table></>:null}</Tab>
   <Tab eventKey="inventory" title="Ingredient Stock"><Table responsive size="sm"><thead><tr><th>Ingredient</th><th>Location</th><th>On hand</th><th>Committed</th></tr></thead><tbody>{inventory.map(item=><tr key={idOf(item)}><td>{options.ingredients.find(record=>idOf(record)===idOf(item.ingredient))?.name||item.name}</td><td>{locationName(item.locationRef)}</td><td>{Number(item.quantityOnHand||0).toFixed(2)} {item.unit}</td><td>{Number(item.committedQuantity||0).toFixed(2)} {item.unit}</td></tr>)}{!inventory.length?<tr><td colSpan={4}>No ingredient stock recorded.</td></tr>:null}</tbody></Table></Tab>
  </Tabs>}
  <Modal show={Boolean(selected)&&!receipt&&!draft} onHide={()=>setSelectedId("")} size="xl" centered scrollable><Modal.Header closeButton><Modal.Title>{selected?.poNumber}</Modal.Title></Modal.Header><Modal.Body>{selected?<>
   <div className="d-flex flex-wrap justify-content-between gap-3 mb-3"><strong>{vendorName(selected.vendorRef)}</strong><span>{locationName(selected.locationRef)}</span><span>{statusName(selected.status)}</span></div>
   <Table responsive size="sm"><thead><tr><th>Product</th><th>Pack</th><th>Ordered</th><th>Accepted</th><th>Rejected</th><th>Pack Cost</th><th>Total</th></tr></thead><tbody>{selected.lines.map(line=><tr key={idOf(line)}><td>{line.productName||"Legacy product"}</td><td>{line.packDisplay}</td><td>{line.orderedQty}</td><td>{line.receivedQty||0}</td><td>{line.rejectedQty||0}</td><td>{money(line.unitCost)}</td><td>{money(line.lineTotal)}</td></tr>)}</tbody></Table>
   {selected.closure?.cancelledOutstanding?<p>Outstanding packs cancelled: {selected.closure.lines.reduce((sum,line)=>sum+line.packs,0)}</p>:null}<div className="text-end">Total: <strong>{money(selected.total)}</strong></div>
  </>:null}</Modal.Body><Modal.Footer>
   {selected?.status==="draft"&&selected.flow==="ingredients"?<Button variant="outline-primary" disabled={saving} onClick={()=>setDraft({id:selectedId,vendor:idOf(selected.vendorRef),location:idOf(selected.locationRef),expectedDate:selected.expectedDate?String(selected.expectedDate).slice(0,10):"",tax:String(selected.tax||0),shipping:String(selected.shipping||0),notes:selected.notes||"",lines:selected.lines.map(line=>({offering:idOf(line.vendorIngredientPriceRef),quantity:line.orderedQty}))})}>Edit Draft</Button>:null}
   {selected?.status==="draft"?<Button disabled={saving} onClick={()=>changeStatus("submitted")}>Submit Order</Button>:null}
   {selected?.status==="submitted"?<Button disabled={saving} onClick={()=>changeStatus("approved")}>Approve Order</Button>:null}
   {selected?.status==="approved"?<Button disabled={saving} onClick={()=>changeStatus("sent")}>Mark Sent</Button>:null}
   {selected&&["approved","sent","partialReceived"].includes(selected.status)&&(selectedVendor?.ordering?.orderingEmail||selectedVendor?.email)?<Button as="a" href={compose} variant="outline-primary">Email Order</Button>:null}
   {selected&&["sent","partialReceived"].includes(selected.status)&&selected.flow==="ingredients"?<Button disabled={saving} onClick={receiveOrder}>Receive Goods</Button>:null}
   {selected&&["sent","partialReceived"].includes(selected.status)&&selected.hasReceipts?<Button variant="outline-primary" disabled={saving} onClick={()=>changeStatus("closed",{cancelOutstanding:true})}>Close & Cancel Outstanding Packs</Button>:null}
   {selected?.status==="received"?<Button disabled={saving} onClick={()=>changeStatus("closed")}>Close Order</Button>:null}
   {selected&&["draft","submitted","approved","sent"].includes(selected.status)&&!selected.hasReceipts?<Button variant="outline-danger" disabled={saving} onClick={()=>changeStatus("cancelled")}>Cancel Order</Button>:null}
  </Modal.Footer></Modal>
  <Modal show={Boolean(draft)&&!locationDraft} onHide={()=>!saving&&setDraft(null)} size="xl" centered scrollable><Form onSubmit={saveOrder}><Modal.Header closeButton><Modal.Title>{draft?.id?"Edit":"New"} Purchase Order</Modal.Title></Modal.Header><Modal.Body>{draft?<>
   {error?<Alert variant="danger">{error}</Alert>:null}{options.sourceRecipe?<strong>{options.sourceRecipe.name}</strong>:null}
   <div className="purchase-fields"><Form.Group><Form.Label>Vendor</Form.Label><Form.Select required value={draft.vendor} onChange={event=>chooseVendor(event.target.value)}><option value="">Select vendor</option>{options.vendors.map(vendor=><option key={idOf(vendor)} value={idOf(vendor)}>{vendor.legalName}</option>)}</Form.Select></Form.Group><Form.Group><Form.Label>Location</Form.Label><div className="d-flex gap-2"><Form.Select required value={draft.location} onChange={event=>setDraft({...draft,location:event.target.value})}><option value="">Select location</option>{options.locations.map(item=><option key={idOf(item)} value={idOf(item)}>{item.name}</option>)}</Form.Select><Button variant="outline-primary" className="text-nowrap" onClick={()=>setLocationDraft({business:businessId,name:"",type:"",code:"",parentLocation:"",isActive:true})}>Add Location</Button></div></Form.Group><Form.Group><Form.Label>Expected</Form.Label><Form.Control type="date" value={draft.expectedDate} onChange={event=>setDraft({...draft,expectedDate:event.target.value})}/></Form.Group></div>
   <Table responsive size="sm"><thead><tr><th>Vendor product</th><th>Packs</th><th>Pack Cost</th><th>Total</th><th/></tr></thead><tbody>{draft.lines.map((line,index)=>{const offer=options.offers.find(item=>idOf(item)===line.offering);return <tr key={index}><td><Form.Select required value={line.offering} onChange={event=>updateDraftLine(index,{offering:event.target.value})}><option value="">Select product</option>{options.offers.filter(item=>idOf(item.vendor)===draft.vendor).map(item=><option key={idOf(item)} value={idOf(item)}>{productName(item)} · {item.brand} · {item.imperialDisplay||item.metricDisplay||item.packSizeName}</option>)}</Form.Select></td><td><Form.Control className="purchase-number" type="number" min="1" step="1" required value={line.quantity} onChange={event=>updateDraftLine(index,{quantity:event.target.value})}/></td><td>{money(offer?.packCost)}</td><td>{money(Number(line.quantity||0)*Number(offer?.packCost||0))}</td><td><Button variant="outline-danger" size="sm" onClick={()=>setDraft({...draft,lines:draft.lines.filter((_,i)=>i!==index)})}>Remove</Button></td></tr>;})}</tbody></Table>
   <Button variant="outline-primary" disabled={!draft.vendor} onClick={()=>setDraft({...draft,lines:[...draft.lines,{offering:"",quantity:1}]})}>Add Product</Button>
   <div className="purchase-fields mt-3"><Form.Group><Form.Label>Tax</Form.Label><Form.Control className="purchase-number" type="number" min="0" step="0.01" value={draft.tax} onChange={event=>setDraft({...draft,tax:event.target.value})}/></Form.Group><Form.Group><Form.Label>Shipping</Form.Label><Form.Control className="purchase-number" type="number" min="0" step="0.01" value={draft.shipping} onChange={event=>setDraft({...draft,shipping:event.target.value})}/></Form.Group></div><Form.Group className="purchase-notes mt-3"><Form.Label>Notes</Form.Label><Form.Control as="textarea" rows={2} value={draft.notes} onChange={event=>setDraft({...draft,notes:event.target.value})}/></Form.Group>
  </>:null}</Modal.Body><Modal.Footer><Button variant="outline-primary" onClick={()=>setDraft(null)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving||!draft?.lines.length||!actor}>Save Draft Order</Button></Modal.Footer></Form></Modal>
  <Modal show={Boolean(receipt)} onHide={()=>!saving&&setReceipt(null)} size="xl" centered scrollable><Form onSubmit={saveReceipt}><Modal.Header closeButton><Modal.Title>Receive Goods</Modal.Title></Modal.Header><Modal.Body>{receipt?<>
   {error?<Alert variant="danger">{error}</Alert>:null}<Form.Group className="purchase-invoice"><Form.Label>Invoice Number</Form.Label><Form.Control value={receipt.invoiceNumber} onChange={event=>setReceipt({...receipt,invoiceNumber:event.target.value})}/></Form.Group>
   <Table responsive size="sm"><thead><tr><th>Product</th><th>Outstanding packs</th><th>Accepted</th><th>Rejected</th><th>Lot</th><th>Expiry</th></tr></thead><tbody>{receipt.lines.map((line,index)=><tr key={line.line}><td>{line.productName}</td><td>{line.remaining}</td>{["accepted","rejected"].map(field=><td key={field}><Form.Control className="purchase-number" type="number" min="0" max={line.remaining} step="any" value={line[field]} onChange={event=>setReceipt({...receipt,lines:receipt.lines.map((item,i)=>i===index?{...item,[field]:event.target.value}:item)})}/></td>)}<td><Form.Control value={line.lotNumber} onChange={event=>setReceipt({...receipt,lines:receipt.lines.map((item,i)=>i===index?{...item,lotNumber:event.target.value}:item)})}/></td><td><Form.Control type="date" value={line.expiryDate} onChange={event=>setReceipt({...receipt,lines:receipt.lines.map((item,i)=>i===index?{...item,expiryDate:event.target.value}:item)})}/></td></tr>)}</tbody></Table>
  </>:null}</Modal.Body><Modal.Footer><Button variant="outline-primary" disabled={saving} onClick={()=>setReceipt(null)}>Cancel</Button><Button type="submit" disabled={saving}>Receive & Update Stock</Button></Modal.Footer></Form></Modal>
  {locationDraft?<LocationForm show={!locationTypeDraft} form={locationDraft} error={error} onAddType={()=>{setError("");setLocationTypeDraft({name:"",description:"",isActive:true});}} setForm={setLocationDraft} onHide={()=>setLocationDraft(null)} onSubmit={saveLocation} saving={saving} businesses={[business]} locations={options.locations} locationTypes={options.locationTypes}/>:null}
  {locationTypeDraft?<LocationTypeForm show form={locationTypeDraft} setForm={setLocationTypeDraft} onSubmit={saveLocationType} onHide={()=>setLocationTypeDraft(null)} saving={saving} error={error}/>:null}
 </main>;
}
