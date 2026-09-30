// src/pages/vendors/VendorsPage.jsx
import React,{useEffect,useMemo,useState} from "react";
import {Alert,Badge,Card,Col,Form,InputGroup,Row,Spinner,Table} from "react-bootstrap";

export default function VendorsPage(){
 const [vendors,setVendors]=useState([]);
 const [vendorItems,setVendorItems]=useState([]);
 const [vendorItemPrices,setVendorItemPrices]=useState([]);
 const [selectedVendor,setSelectedVendor]=useState("");
 const [search,setSearch]=useState("");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 useEffect(()=>{
  let mounted=true;

  const load=async()=>{
   try{
    setLoading(true);
    setError("");

    const [vendorsRes,itemsRes,pricesRes]=await Promise.all([
     fetch("/api/vendors"),
     fetch("/api/vendor-items"),
     fetch("/api/vendor-item-prices")
    ]);

    if(!vendorsRes.ok) throw new Error("Failed to load vendors");
    if(!itemsRes.ok) throw new Error("Failed to load vendor items");
    if(!pricesRes.ok) throw new Error("Failed to load vendor item prices");

    const [vendorsData,itemsData,pricesData]=await Promise.all([
     vendorsRes.json(),
     itemsRes.json(),
     pricesRes.json()
    ]);

    if(!mounted) return;

    const normalizedVendors=Array.isArray(vendorsData)?vendorsData:[];
    const normalizedItems=Array.isArray(itemsData)?itemsData:[];
    const normalizedPrices=Array.isArray(pricesData)?pricesData:[];

    setVendors(normalizedVendors);
    setVendorItems(normalizedItems);
    setVendorItemPrices(normalizedPrices);

    if(normalizedVendors.length){
     const preferred=normalizedVendors.find(v=>v.isPreferred&&v.isActive) || normalizedVendors.find(v=>v.isActive) || normalizedVendors[0];
     setSelectedVendor(String(preferred?._id||""));
    }
   }catch(err){
    if(mounted) setError(err.message||"Failed to load vendor data");
   }finally{
    if(mounted) setLoading(false);
   }
  };

  load();

  return()=>{
   mounted=false;
  };
 },[]);

 const vendorMap=useMemo(()=>{
  const map={};
  vendors.forEach(v=>{
   map[String(v._id)]=v;
  });
  return map;
 },[vendors]);

 const currentPriceMap=useMemo(()=>{
  const map={};

  vendorItemPrices.forEach(price=>{
   const key=String(price.vendorItem?._id||price.vendorItem||"");
   if(!key) return;
   if(!map[key]) map[key]=[];
   map[key].push(price);
  });

  Object.keys(map).forEach(key=>{
   map[key]=map[key].sort((a,b)=>{
    const aCurrent=a.isCurrent?0:1;
    const bCurrent=b.isCurrent?0:1;
    if(aCurrent!==bCurrent) return aCurrent-bCurrent;
    return Number(a.unitCost||0)-Number(b.unitCost||0);
   });
  });

  return map;
 },[vendorItemPrices]);

 const activeVendors=useMemo(()=>{
  return vendors.filter(v=>v.isActive!==false).sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));
 },[vendors]);

 const selectedVendorData=useMemo(()=>{
  return vendors.find(v=>String(v._id)===String(selectedVendor||""))||null;
 },[vendors,selectedVendor]);

 const selectedVendorItems=useMemo(()=>{
  const term=search.trim().toLowerCase();

  return vendorItems
   .filter(item=>String(item.vendor?._id||item.vendor||"")===String(selectedVendor||""))
   .filter(item=>{
    if(!term) return true;
    return[
     item.itemName,
     item.brand,
     item.sku,
     item.vendorSku,
     item.itemType,
     item.notes,
     item.packUnit,
     item.baseUnit
    ].some(value=>String(value||"").toLowerCase().includes(term));
   })
   .map(item=>{
    const itemId=String(item._id);
    const currentPrice=(currentPriceMap[itemId]||[]).find(price=>price.isCurrent)||currentPriceMap[itemId]?.[0]||null;
    return{
     ...item,
     currentPrice
    };
   })
   .sort((a,b)=>String(a.itemName||"").localeCompare(String(b.itemName||"")));
 },[vendorItems,selectedVendor,search,currentPriceMap]);

 const comparisonRows=useMemo(()=>{
  const grouped={};
  const term=search.trim().toLowerCase();

  vendorItems.forEach(item=>{
   const itemId=String(item._id);
   const currentPrice=(currentPriceMap[itemId]||[]).find(price=>price.isCurrent)||currentPriceMap[itemId]?.[0]||null;
   const vendorId=String(item.vendor?._id||item.vendor||"");
   const vendor=vendorMap[vendorId];

   const compareKey=[
    String(item.itemName||"").trim().toLowerCase(),
    String(item.itemType||"").trim().toLowerCase(),
    String(item.brand||"").trim().toLowerCase(),
    Number(item.packSize||0),
    String(item.packUnit||"").trim().toLowerCase(),
    String(item.baseUnit||"").trim().toLowerCase()
   ].join("__");

   if(!grouped[compareKey]){
    grouped[compareKey]={
     key:compareKey,
     itemName:item.itemName||"",
     itemType:item.itemType||"",
     brand:item.brand||"",
     packSize:Number(item.packSize||0),
     packUnit:item.packUnit||"",
     baseUnit:item.baseUnit||"",
     offers:[]
    };
   }

   grouped[compareKey].offers.push({
    vendorId,
    vendorName:vendor?.name||"Unknown Vendor",
    isPreferred:!!vendor?.isPreferred,
    unitCost:Number(currentPrice?.unitCost||0),
    minimumOrderQty:Number(currentPrice?.minimumOrderQty||0),
    leadTimeDays:Number(currentPrice?.leadTimeDays||0),
    sku:item.sku||"",
    vendorSku:item.vendorSku||"",
    isAvailable:item.isAvailable!==false&&currentPrice?.isAvailable!==false
   });
  });

  return Object.values(grouped)
   .filter(group=>group.offers.length>1)
   .filter(group=>{
    if(!term) return true;
    return[
     group.itemName,
     group.itemType,
     group.brand,
     group.packUnit,
     group.baseUnit
    ].some(value=>String(value||"").toLowerCase().includes(term));
   })
   .map(group=>{
    const offers=[...group.offers].sort((a,b)=>{
     const aAvailable=a.isAvailable?0:1;
     const bAvailable=b.isAvailable?0:1;
     if(aAvailable!==bAvailable) return aAvailable-bAvailable;
     if(a.unitCost!==b.unitCost) return a.unitCost-b.unitCost;
     return a.vendorName.localeCompare(b.vendorName);
    });

    return{
     ...group,
     offers,
     bestOffer:offers[0]||null
    };
   })
   .sort((a,b)=>String(a.itemName||"").localeCompare(String(b.itemName||"")));
 },[vendorItems,currentPriceMap,vendorMap,search]);

 const formatMoney=value=>{
  return Number(value||0).toLocaleString(undefined,{style:"currency",currency:"USD"});
 };

 return(
  <div className="container py-4">
   <Row className="g-3 mb-3">
    <Col xs={12}>
     <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
      <div>
       <h2 className="mb-1">Vendors</h2>
       <div className="text-muted">Browse vendor items and compare the same products across suppliers.</div>
      </div>
      <div className="d-flex gap-2">
       <Badge bg="dark">{activeVendors.length} Vendors</Badge>
       <Badge bg="secondary">{vendorItems.length} Items</Badge>
       <Badge bg="info">{vendorItemPrices.length} Prices</Badge>
      </div>
     </div>
    </Col>

    <Col md={4}>
     <Form.Group>
      <Form.Label>Select Vendor</Form.Label>
      <Form.Select value={selectedVendor} onChange={e=>setSelectedVendor(e.target.value)}>
       <option value="">Choose vendor</option>
       {activeVendors.map(v=>(
        <option key={String(v._id)} value={String(v._id)}>
         {v.name}{v.isPreferred?" (Preferred)":""}
        </option>
       ))}
      </Form.Select>
     </Form.Group>
    </Col>

    <Col md={8}>
     <Form.Group>
      <Form.Label>Search</Form.Label>
      <InputGroup>
       <Form.Control
        type="text"
        value={search}
        onChange={e=>setSearch(e.target.value)}
        placeholder="Search item, brand, SKU, type..."
       />
      </InputGroup>
     </Form.Group>
    </Col>
   </Row>

   {error?<Alert variant="danger" className="mb-3">{error}</Alert>:null}

   {loading?(
    <div className="d-flex align-items-center justify-content-center py-5">
     <Spinner animation="border" role="status" />
    </div>
   ):(
    <>
     <Row className="g-3 mb-4">
      <Col xs={12}>
       <Card>
        <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2">
         <div>
          <strong>{selectedVendorData?.name||"Vendor Items"}</strong>
          {selectedVendorData?.isPreferred?<Badge bg="success" className="ms-2">Preferred</Badge>:null}
         </div>
         <div className="text-muted small">
          {selectedVendorItems.length} item{selectedVendorItems.length===1?"":"s"}
         </div>
        </Card.Header>
        <Card.Body className="p-0">
         <div className="table-responsive">
          <Table striped hover className="mb-0 align-middle">
           <thead>
            <tr>
             <th>Item</th>
             <th>Type</th>
             <th>Pack</th>
             <th>Brand</th>
             <th>SKU</th>
             <th>Price</th>
             <th>MOQ</th>
             <th>Lead Time</th>
             <th>Status</th>
            </tr>
           </thead>
           <tbody>
            {selectedVendorItems.length===0?(
             <tr>
              <td colSpan="9" className="text-center py-4 text-muted">No vendor items found.</td>
             </tr>
            ):selectedVendorItems.map(item=>(
             <tr key={String(item._id)}>
              <td>
               <div className="fw-semibold">{item.itemName}</div>
               {item.notes?<div className="small text-muted">{item.notes}</div>:null}
              </td>
              <td className="text-capitalize">{item.itemType||"-"}</td>
              <td>{Number(item.packSize||0)} {item.packUnit||""}</td>
              <td>{item.brand||"-"}</td>
              <td>
               <div>{item.sku||"-"}</div>
               <div className="small text-muted">{item.vendorSku||"-"}</div>
              </td>
              <td>{item.currentPrice?formatMoney(item.currentPrice.unitCost):"-"}</td>
              <td>{item.currentPrice?.minimumOrderQty??"-"}</td>
              <td>{item.currentPrice?.leadTimeDays!==undefined?`${item.currentPrice.leadTimeDays} day${Number(item.currentPrice.leadTimeDays)===1?"":"s"}`:"-"}</td>
              <td>
               {item.isAvailable!==false?<Badge bg="success">Available</Badge>:<Badge bg="secondary">Unavailable</Badge>}
              </td>
             </tr>
            ))}
           </tbody>
          </Table>
         </div>
        </Card.Body>
       </Card>
      </Col>
     </Row>

     <Row className="g-3">
      <Col xs={12}>
       <Card>
        <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2">
         <strong>Price Comparison</strong>
         <div className="text-muted small">Same item across multiple vendors</div>
        </Card.Header>
        <Card.Body className="p-0">
         <div className="table-responsive">
          <Table striped hover className="mb-0 align-middle">
           <thead>
            <tr>
             <th>Item</th>
             <th>Type</th>
             <th>Pack</th>
             <th>Brand</th>
             <th>Best Price</th>
             <th>Vendor Offers</th>
            </tr>
           </thead>
           <tbody>
            {comparisonRows.length===0?(
             <tr>
              <td colSpan="6" className="text-center py-4 text-muted">No comparable items found across vendors.</td>
             </tr>
            ):comparisonRows.map(row=>(
             <tr key={row.key}>
              <td className="fw-semibold">{row.itemName}</td>
              <td className="text-capitalize">{row.itemType||"-"}</td>
              <td>{row.packSize} {row.packUnit}</td>
              <td>{row.brand||"-"}</td>
              <td>
               {row.bestOffer?(
                <>
                 <div className="fw-semibold">{formatMoney(row.bestOffer.unitCost)}</div>
                 <div className="small text-muted">{row.bestOffer.vendorName}</div>
                </>
               ):"-"}
              </td>
              <td>
               <div className="d-flex flex-column gap-2">
                {row.offers.map((offer,index)=>(
                 <div key={`${row.key}-${offer.vendorId}-${index}`} className="border rounded p-2">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                   <div>
                    <span className="fw-semibold">{offer.vendorName}</span>
                    {offer.isPreferred?<Badge bg="success" className="ms-2">Preferred</Badge>:null}
                   </div>
                   <div className="fw-semibold">{formatMoney(offer.unitCost)}</div>
                  </div>
                  <div className="small text-muted mt-1">
                   MOQ: {offer.minimumOrderQty||0} | Lead: {offer.leadTimeDays||0} day{Number(offer.leadTimeDays||0)===1?"":"s"} | SKU: {offer.vendorSku||offer.sku||"-"}
                  </div>
                 </div>
                ))}
               </div>
              </td>
             </tr>
            ))}
           </tbody>
          </Table>
         </div>
        </Card.Body>
       </Card>
      </Col>
     </Row>
    </>
   )}
  </div>
 );
}