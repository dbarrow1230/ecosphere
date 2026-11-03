import BusinessResourcePage from "../components/business/BusinessResourcePage.jsx";

function Purchasing(){
 return(
  <BusinessResourcePage
   title="Purchasing"
   kicker="Vendor Orders"
   description="Create and manage purchase orders for ingredients, jars, lids, labels, packaging, and market supplies."
   endpoint="/api/purchase-orders"
   lookups={[{key:"vendors",endpoint:"/api/vendors"}]}
   columns={[
    {label:"PO Number",key:"poNumber"},
    {label:"Status",key:"status"},
    {label:"Order Date",key:"orderDate"},
    {label:"Expected",key:"expectedDate"},
    {label:"Total",key:"total"},
    {label:"Notes",key:"notes"}
   ]}
   fields={[
    {label:"PO Number",name:"poNumber",required:true},
    {label:"Vendor",name:"vendorRef",type:"select",lookupKey:"vendors",optionLabel:"legalName",required:true},
    {label:"Status",name:"status",type:"select",defaultValue:"draft",options:[
     {value:"draft",label:"Draft"},
     {value:"submitted",label:"Submitted"},
     {value:"approved",label:"Approved"},
     {value:"sent",label:"Sent"},
     {value:"partialReceived",label:"Partially Received"},
     {value:"received",label:"Received"},
     {value:"cancelled",label:"Cancelled"},
     {value:"closed",label:"Closed"}
    ]},
    {label:"Order Date",name:"orderDate",type:"date"},
    {label:"Expected Date",name:"expectedDate",type:"date"},
    {label:"Subtotal",name:"subtotal",type:"number",min:0},
    {label:"Tax",name:"tax",type:"number",min:0},
    {label:"Shipping",name:"shipping",type:"number",min:0},
    {label:"Total",name:"total",type:"number",min:0},
    {label:"Notes",name:"notes",type:"textarea"}
   ]}
  />
 );
}

export default Purchasing;
