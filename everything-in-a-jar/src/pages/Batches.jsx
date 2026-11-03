import BusinessResourcePage from "../components/business/BusinessResourcePage.jsx";

function Batches(){
 return(
  <BusinessResourcePage
   title="Batches"
   kicker="Batch Records"
   description="Track each batch you make, from planned jar count through QA hold, release, lot code, best-by date, and final closeout."
   endpoint="/api/production-batches"
   lookups={[{key:"products",endpoint:"/api/products"}]}
   columns={[
    {label:"Batch Number",key:"batchNumber"},
    {label:"Lot Code",key:"lotCode"},
    {label:"Status",key:"status"},
    {label:"Production Date",key:"productionDate"},
    {label:"Actual Yield",key:"yield.actualQuantity"},
    {label:"Best By",key:"bestByDate"}
   ]}
   fields={[
    {label:"Batch Number",name:"batchNumber",required:true},
    {label:"Lot Code",name:"lotCode"},
    {label:"Product",name:"productRef",type:"select",lookupKey:"products",optionLabel:"productName",required:true},
    {label:"Status",name:"status",type:"select",defaultValue:"planned",options:[
     {value:"planned",label:"Planned"},
     {value:"inProduction",label:"In Production"},
     {value:"cooling",label:"Cooling"},
     {value:"packed",label:"Packed"},
     {value:"qaHold",label:"QA Hold"},
     {value:"released",label:"Released"},
     {value:"closed",label:"Closed"},
     {value:"voided",label:"Voided"}
    ]},
    {label:"Production Date",name:"productionDate",type:"date"},
    {label:"Best By Date",name:"bestByDate",type:"date"},
    {label:"Planned Quantity",name:"yield.plannedQuantity",type:"number",min:0},
    {label:"Actual Quantity",name:"yield.actualQuantity",type:"number",min:0},
    {label:"Yield Unit",name:"yield.unit",defaultValue:"jars"},
    {label:"Rejects",name:"yield.rejects",type:"number",min:0},
    {label:"pH",name:"quality.ph",type:"number",min:0},
    {label:"Brix",name:"quality.brix",type:"number",min:0},
    {label:"QA Notes",name:"quality.qaNotes",type:"textarea"}
   ]}
  />
 );
}

export default Batches;
