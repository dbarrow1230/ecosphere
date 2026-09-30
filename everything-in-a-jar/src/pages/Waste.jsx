import BusinessResourcePage from "../components/business/BusinessResourcePage.jsx";

function Waste(){
 return(
  <BusinessResourcePage
   title="Waste"
   kicker="Loss Tracking"
   description="Track spoilage, breakage, expired ingredients, quality failures, overproduction, samples, and other loss."
   endpoint="/api/waste-records"
   columns={[
    {label:"Item",key:"itemName"},
    {label:"Type",key:"itemType"},
    {label:"Quantity",key:"quantity"},
    {label:"Reason",key:"reason"},
    {label:"Waste Date",key:"wasteDate"},
    {label:"Estimated Cost",key:"estimatedCost"}
   ]}
   fields={[
    {label:"Item Name",name:"itemName",required:true},
    {label:"Type",name:"itemType",type:"select",defaultValue:"ingredient",options:[
     {value:"ingredient",label:"Ingredient"},
     {value:"packaging",label:"Packaging"},
     {value:"finishedProduct",label:"Finished Product"},
     {value:"marketSupply",label:"Market Supply"},
     {value:"other",label:"Other"}
    ]},
    {label:"Waste Date",name:"wasteDate",type:"date"},
    {label:"Quantity",name:"quantity",type:"number",min:0},
    {label:"Unit",name:"unit"},
    {label:"Reason",name:"reason",type:"select",defaultValue:"other",options:[
     {value:"spoilage",label:"Spoilage"},
     {value:"breakage",label:"Breakage"},
     {value:"expired",label:"Expired"},
     {value:"qualityFailure",label:"Quality Failure"},
     {value:"overproduction",label:"Overproduction"},
     {value:"sample",label:"Sample"},
     {value:"other",label:"Other"}
    ]},
    {label:"Estimated Cost",name:"estimatedCost",type:"number",min:0},
    {label:"Notes",name:"notes",type:"textarea"}
   ]}
  />
 );
}

export default Waste;
