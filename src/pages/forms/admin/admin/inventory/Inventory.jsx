// src/pages/admin/inventory/Inventory.jsx
import ResourceCrudPage from "../../../components/crud/ResourceCrudPage.jsx";

const fields=[
 {name:"name",label:"Supply Name",required:true,md:6},
 {name:"category",label:"Category",type:"select",optionsKey:"categories",md:6},
 {name:"vendor",label:"Vendor",type:"select",optionsKey:"vendors",md:6},
 {name:"brand",label:"Brand",md:6},
 {name:"type",label:"Type",md:6},
 {name:"quantity",label:"Quantity",type:"number",md:3},
 {name:"unit",label:"Unit",md:3},
 {name:"purchaseDate",label:"Purchase Date",type:"date",md:4},
 {name:"purchasePrice",label:"Purchase Price",type:"number",md:4},
 {name:"description",label:"Description",type:"textarea",md:12},
 {name:"notes",label:"Notes",type:"textarea",md:12}
];

const columns=[
 {key:"name",label:"Supply"},
 {key:"category",label:"Category"},
 {key:"vendor",label:"Vendor"},
 {key:"quantity",label:"Qty"},
 {key:"unit",label:"Unit"}
];

function Inventory(){
 return(
  <ResourceCrudPage
   title="Garden Inventory"
   kicker="Garden Administration"
   description="Manage the garden supplies, quantities, vendors, purchase dates, and restock details used by the dashboard."
   endpoint="/api/supplies"
   optionLoaders={{categories:"/api/supply-categories",vendors:"/api/supply-vendors"}}
   fields={fields}
   columns={columns}
   emptyText="No garden inventory supplies found. Add supplies to track quantities and vendors."
  />
 );
}

export default Inventory;
