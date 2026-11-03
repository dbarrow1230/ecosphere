import BusinessResourcePage from "../components/business/BusinessResourcePage.jsx";

function Ingredients(){
 return(
  <BusinessResourcePage
   title="Ingredients & Supplies"
   kicker="Jar Inputs"
   description="Manage fruit, vegetables, spices, vinegar, sugar, jars, lids, labels, oils, eggs, and other supplies used to make finished jar products."
   endpoint="/api/ingredients"
   columns={[
    {label:"Name",key:"name"},
    {label:"Type",key:"ingredientType"},
    {label:"Default Unit",key:"defaultUnit"},
    {label:"Reorder Point",key:"reorderPoint"},
    {label:"Par Level",key:"parLevel"},
    {label:"Active",key:"isActive"}
   ]}
   fields={[
    {label:"Name",name:"name",required:true},
    {label:"Type",name:"ingredientType",type:"select",defaultValue:"produce",options:[
     {value:"produce",label:"Produce"},
     {value:"spice",label:"Spice"},
     {value:"sweetener",label:"Sweetener"},
     {value:"acid",label:"Acid"},
     {value:"dairy",label:"Dairy"},
     {value:"egg",label:"Egg"},
     {value:"oil",label:"Oil"},
     {value:"packaging",label:"Packaging"},
     {value:"supply",label:"Supply"},
     {value:"other",label:"Other"}
    ]},
    {label:"Default Unit",name:"defaultUnit"},
    {label:"Storage Requirement",name:"storageRequirement"},
    {label:"Shelf Life Days",name:"shelfLifeDays",type:"number",min:0},
    {label:"Reorder Point",name:"reorderPoint",type:"number",min:0},
    {label:"Par Level",name:"parLevel",type:"number",min:0},
    {label:"Perishable",name:"isPerishable",type:"checkbox",defaultValue:true},
    {label:"Active",name:"isActive",type:"checkbox",defaultValue:true},
    {label:"Notes",name:"notes",type:"textarea"}
   ]}
  />
 );
}

export default Ingredients;
