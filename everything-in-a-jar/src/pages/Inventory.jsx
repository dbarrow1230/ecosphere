import BusinessResourcePage from "../components/business/BusinessResourcePage.jsx";

function Inventory(){
 return(
  <BusinessResourcePage
   title="Inventory"
   kicker="Stock On Hand"
   description="Track current balances for ingredients, packaging, market supplies, and finished jar products."
   endpoint="/api/inventory-balances"
   columns={[
    {label:"Item",key:"itemName"},
    {label:"Type",key:"itemType"},
    {label:"On Hand",key:"quantityOnHand"},
    {label:"Available",key:"quantityAvailable"},
    {label:"Reorder Point",key:"reorderPoint"},
    {label:"Status",key:"status"}
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
    {label:"Quantity On Hand",name:"quantityOnHand",type:"number",min:0},
    {label:"Allocated",name:"quantityAllocated",type:"number",min:0},
    {label:"Available",name:"quantityAvailable",type:"number",min:0},
    {label:"Reorder Point",name:"reorderPoint",type:"number",min:0},
    {label:"Par Level",name:"parLevel",type:"number",min:0},
    {label:"Unit",name:"unit"},
    {label:"Status",name:"status",type:"select",defaultValue:"inStock",options:[
     {value:"inStock",label:"In Stock"},
     {value:"lowStock",label:"Low Stock"},
     {value:"outOfStock",label:"Out of Stock"},
     {value:"inactive",label:"Inactive"}
    ]}
   ]}
  />
 );
}

export default Inventory;
