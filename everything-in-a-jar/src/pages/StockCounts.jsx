import BusinessResourcePage from "../components/business/BusinessResourcePage.jsx";

function StockCounts(){
 return(
  <BusinessResourcePage
   title="Stock Counts"
   kicker="Count & Verify"
   description="Create inventory count sessions for ingredients, supplies, and finished jar products."
   endpoint="/api/stock-counts"
   columns={[
    {label:"Count Number",key:"countNumber"},
    {label:"Status",key:"status"},
    {label:"Count Date",key:"countDate"},
    {label:"Notes",key:"notes"}
   ]}
   fields={[
    {label:"Count Number",name:"countNumber",required:true},
    {label:"Count Date",name:"countDate",type:"date"},
    {label:"Status",name:"status",type:"select",defaultValue:"draft",options:[
     {value:"draft",label:"Draft"},
     {value:"inProgress",label:"In Progress"},
     {value:"submitted",label:"Submitted"},
     {value:"approved",label:"Approved"},
     {value:"posted",label:"Posted"}
    ]},
    {label:"Notes",name:"notes",type:"textarea"}
   ]}
  />
 );
}

export default StockCounts;
