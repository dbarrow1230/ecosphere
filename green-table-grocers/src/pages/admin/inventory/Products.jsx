import ManagementTable from "../../../components/dashboard/ManagementTable.jsx";
const emptyRecord={name:"",category:"",sku:"",price:0,status:"active"};
const fields=[{name:"name",label:"Product"},{name:"category",label:"Category"},{name:"sku",label:"SKU"},{name:"price",label:"Price",type:"number"},{name:"status",label:"Status"}];
export default function Products(){return <ManagementTable title="Products" endpoint="/api/products" emptyRecord={emptyRecord} fields={fields}/>;}
