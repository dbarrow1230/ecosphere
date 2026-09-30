import BusinessResourcePage from "../components/business/BusinessResourcePage.jsx";

function Receiving(){
 return(
  <BusinessResourcePage
   title="Receiving"
   kicker="Goods In"
   description="Record incoming goods from vendors and hold or post receipts after quality review."
   endpoint="/api/goods-receipts"
   lookups={[
    {key:"vendors",endpoint:"/api/vendors"},
    {key:"purchaseOrders",endpoint:"/api/purchase-orders"}
   ]}
   columns={[
    {label:"Receipt Number",key:"receiptNumber"},
    {label:"Status",key:"status"},
    {label:"Received At",key:"receivedAt"},
    {label:"Notes",key:"notes"}
   ]}
   fields={[
    {label:"Receipt Number",name:"receiptNumber",required:true},
    {label:"Purchase Order",name:"purchaseOrderRef",type:"select",lookupKey:"purchaseOrders",optionLabel:"poNumber"},
    {label:"Vendor",name:"vendorRef",type:"select",lookupKey:"vendors",optionLabel:"legalName"},
    {label:"Received At",name:"receivedAt",type:"date"},
    {label:"Status",name:"status",type:"select",defaultValue:"draft",options:[
     {value:"draft",label:"Draft"},
     {value:"received",label:"Received"},
     {value:"qualityHold",label:"Quality Hold"},
     {value:"posted",label:"Posted"},
     {value:"voided",label:"Voided"}
    ]},
    {label:"Notes",name:"notes",type:"textarea"}
   ]}
  />
 );
}

export default Receiving;
