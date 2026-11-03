import ResourceCrudPage from "./ResourceCrudPage.jsx";

const emptyBatch={
 batchNumber:"",
 lotNumber:"",
 code:"",
 product:"",
 sourceProcessModel:"DehydrationProcess",
 packaging:{size:"0",unit:"",packageCount:"0"},
 quantities:{produced:"0",onHand:"0",reserved:"0",sold:"0",damaged:"0",discarded:"0"},
 dates:{productionDate:"",packagedDate:"",availableDate:"",expiryDate:""},
 status:"",
 storage:{location:"",method:"",notes:""},
 notes:""
};

const getId=value=>{
 if(!value)return "";
 if(typeof value==="string")return value;
 return value._id||value.id||"";
};

const toDateInput=value=>{
 if(!value)return "";
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "";
 return date.toISOString().slice(0,10);
};

const decimal=value=>{
 if(value?.$numberDecimal!==undefined)return value.$numberDecimal;
 return String(value??"0");
};

const quantity=value=>Number(value||0).toLocaleString();

export default function ProductBatches(){
 return(
  <ResourceCrudPage
   title="Product Batches"
   subtitle="Manage batch, lot, quantity, packaging, storage, and date details for finished products."
   apiPath="/api/product-batches"
   arrayKey="data"
   initialForm={emptyBatch}
   optionLoaders={{
    products:{url:"/api/products",arrayKey:"data"},
    statuses:{url:"/api/statuses?group=batch",arrayKey:"statuses"},
    storageLocations:{url:"/api/storage-locations",arrayKey:"storageLocations"}
   }}
   fields={[
    {name:"batchNumber",label:"Batch Number",required:true},
    {name:"lotNumber",label:"Lot Number"},
    {name:"code",label:"Code"},
    {name:"product",label:"Product",type:"select",optionsKey:"products",labelFields:["name","sku"],required:true},
    {name:"status",label:"Status",type:"select",optionsKey:"statuses",labelFields:["name","code"]},
    {name:"sourceProcessModel",label:"Source Process Model"},
    {name:"packaging.size",label:"Package Size",type:"number",step:"0.01",min:"0"},
    {name:"packaging.unit",label:"Package Unit"},
    {name:"packaging.packageCount",label:"Package Count",type:"number",min:"0"},
    {name:"quantities.produced",label:"Produced",type:"number",min:"0"},
    {name:"quantities.onHand",label:"On Hand",type:"number",min:"0"},
    {name:"quantities.reserved",label:"Reserved",type:"number",min:"0"},
    {name:"quantities.sold",label:"Sold",type:"number",min:"0"},
    {name:"quantities.damaged",label:"Damaged",type:"number",min:"0"},
    {name:"quantities.discarded",label:"Discarded",type:"number",min:"0"},
    {name:"dates.productionDate",label:"Production Date",type:"date"},
    {name:"dates.packagedDate",label:"Packaged Date",type:"date"},
    {name:"dates.availableDate",label:"Available Date",type:"date"},
    {name:"dates.expiryDate",label:"Expiry Date",type:"date"},
    {name:"storage.location",label:"Storage Location",type:"select",optionsKey:"storageLocations",labelFields:["name","code"]},
    {name:"storage.method",label:"Storage Method"},
    {name:"storage.notes",label:"Storage Notes",type:"textarea",rows:3},
    {name:"notes",label:"Notes",type:"textarea",rows:4}
   ]}
   columns={[
    {path:"batchNumber",label:"Batch #"},
    {path:"product",label:"Product",render:item=>item.product?.name||"-"},
    {path:"quantities.onHand",label:"On Hand",render:item=>quantity(item.quantities?.onHand)},
    {path:"quantities.available",label:"Available",render:item=>quantity(item.quantities?.available)},
    {path:"dates.productionDate",label:"Produced",render:item=>toDateInput(item.dates?.productionDate)||"-"},
    {path:"status",label:"Status",render:item=>item.status?.name||item.status?.code||"-"}
   ]}
   formFromItem={item=>({
    batchNumber:item.batchNumber||"",
    lotNumber:item.lotNumber||"",
    code:item.code||"",
    product:getId(item.product),
    sourceProcessModel:item.sourceProcessModel||"DehydrationProcess",
    packaging:{
     size:decimal(item.packaging?.size),
     unit:item.packaging?.unit||"",
     packageCount:String(item.packaging?.packageCount??0)
    },
    quantities:{
     produced:String(item.quantities?.produced??0),
     onHand:String(item.quantities?.onHand??0),
     reserved:String(item.quantities?.reserved??0),
     sold:String(item.quantities?.sold??0),
     damaged:String(item.quantities?.damaged??0),
     discarded:String(item.quantities?.discarded??0)
    },
    dates:{
     productionDate:toDateInput(item.dates?.productionDate),
     packagedDate:toDateInput(item.dates?.packagedDate),
     availableDate:toDateInput(item.dates?.availableDate),
     expiryDate:toDateInput(item.dates?.expiryDate)
    },
    status:getId(item.status),
    storage:{
     location:getId(item.storage?.location),
     method:item.storage?.method||"",
     notes:item.storage?.notes||""
    },
    notes:item.notes||""
   })}
   buildPayload={form=>({
    ...form,
    product:form.product||null,
    status:form.status||null,
    packaging:{
     ...form.packaging,
     size:form.packaging?.size||"0",
     packageCount:Number(form.packaging?.packageCount||0)
    },
    quantities:{
     produced:Number(form.quantities?.produced||0),
     onHand:Number(form.quantities?.onHand||0),
     reserved:Number(form.quantities?.reserved||0),
     sold:Number(form.quantities?.sold||0),
     damaged:Number(form.quantities?.damaged||0),
     discarded:Number(form.quantities?.discarded||0)
    },
    dates:{
     productionDate:form.dates?.productionDate||null,
     packagedDate:form.dates?.packagedDate||null,
     availableDate:form.dates?.availableDate||null,
     expiryDate:form.dates?.expiryDate||null
    },
    storage:{
     location:form.storage?.location||null,
     method:form.storage?.method||"",
     notes:form.storage?.notes||""
    }
   })}
   getRowTitle={item=>item.batchNumber||"Product batch"}
  />
 );
}
