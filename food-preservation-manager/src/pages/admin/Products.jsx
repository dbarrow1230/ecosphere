import ResourceCrudPage from "./ResourceCrudPage.jsx";

const emptyProduct={
 name:"",
 sku:"",
 slug:"",
 shortDescription:"",
 longDescription:"",
 category:"",
 subcategory:"",
 sellingControls:{isActive:true,availableOnline:true,availableInStore:true,featured:false}
};

export default function Products(){
 return(
  <ResourceCrudPage
   title="Products"
   subtitle="Manage preserved product records used by batches, inventory, orders, and menus."
   apiPath="/api/products"
   arrayKey="data"
   initialForm={emptyProduct}
   fields={[
    {name:"name",label:"Name",required:true},
    {name:"sku",label:"SKU"},
    {name:"slug",label:"Slug"},
    {name:"category",label:"Category"},
    {name:"subcategory",label:"Subcategory"},
    {name:"shortDescription",label:"Short Description",type:"textarea",rows:3},
    {name:"longDescription",label:"Long Description",type:"textarea",rows:5},
    {name:"sellingControls.isActive",label:"Active",type:"checkbox",checkboxLabel:"Active"},
    {name:"sellingControls.availableOnline",label:"Online",type:"checkbox",checkboxLabel:"Available online"},
    {name:"sellingControls.availableInStore",label:"In Store",type:"checkbox",checkboxLabel:"Available in store"},
    {name:"sellingControls.featured",label:"Featured",type:"checkbox",checkboxLabel:"Featured"}
   ]}
   columns={[
    {path:"name",label:"Name"},
    {path:"sku",label:"SKU"},
    {path:"category",label:"Category"},
    {path:"subcategory",label:"Subcategory"},
    {path:"sellingControls.isActive",label:"Active"},
    {path:"sellingControls.featured",label:"Featured"}
   ]}
   getRowTitle={item=>item.name||item.sku||"Product"}
  />
 );
}
