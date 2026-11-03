import BusinessResourcePage from "../components/business/BusinessResourcePage.jsx";

function Products(){
 return(
  <BusinessResourcePage
   title="Products"
   kicker="Finished Goods"
   description="Manage sellable jar products such as jams, jellies, preserves, pickles, mayonnaise, sauces, chutneys, ferments, and seasonal goods."
   endpoint="/api/products"
   columns={[
    {label:"Product",key:"productName"},
    {label:"Type",key:"productType"},
    {label:"SKU",key:"sku"},
    {label:"Package",key:"package.sizeLabel"},
    {label:"Retail",key:"suggestedRetailPrice"},
    {label:"Status",key:"status"}
   ]}
   fields={[
    {label:"Product Name",name:"productName",required:true},
    {label:"SKU",name:"sku"},
    {label:"Type",name:"productType",type:"select",defaultValue:"preserve",options:[
     {value:"jam",label:"Jam"},
     {value:"jelly",label:"Jelly"},
     {value:"preserve",label:"Preserve"},
     {value:"pickle",label:"Pickle"},
     {value:"mayonnaise",label:"Mayonnaise"},
     {value:"sauce",label:"Sauce"},
     {value:"chutney",label:"Chutney"},
     {value:"ferment",label:"Ferment"},
     {value:"freezeDried",label:"Freeze Dried"},
     {value:"cheese",label:"Cheese"},
     {value:"seasonal",label:"Seasonal"},
     {value:"other",label:"Other"}
    ]},
    {label:"Container Type",name:"package.containerType",defaultValue:"jar"},
    {label:"Size Label",name:"package.sizeLabel"},
    {label:"Units Per Case",name:"package.unitsPerCase",type:"number",min:1,defaultValue:1},
    {label:"Shelf Life Days",name:"shelfLifeDays",type:"number",min:0},
    {label:"Retail Price",name:"suggestedRetailPrice",type:"number",min:0},
    {label:"Wholesale Price",name:"wholesalePrice",type:"number",min:0},
    {label:"Status",name:"status",type:"select",defaultValue:"draft",options:[
     {value:"draft",label:"Draft"},
     {value:"active",label:"Active"},
     {value:"seasonal",label:"Seasonal"},
     {value:"paused",label:"Paused"},
     {value:"retired",label:"Retired"}
    ]},
    {label:"Active",name:"isActive",type:"checkbox",defaultValue:true},
    {label:"Description",name:"description",type:"textarea"}
   ]}
  />
 );
}

export default Products;
