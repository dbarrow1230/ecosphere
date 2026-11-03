import ManagementTable from "../../../components/dashboard/ManagementTable.jsx";

const emptyRecord={name:"",sku:"",quantity:0,status:"active",notes:""};
const fields=[
 {name:"name",label:"Item"},
 {name:"sku",label:"SKU"},
 {name:"quantity",label:"Quantity",type:"number"},
 {name:"status",label:"Status"},
 {name:"notes",label:"Notes"}
];

export default function InventoryManagement(){
 return <ManagementTable title="Inventory" endpoint="/api/inventory" emptyRecord={emptyRecord} fields={fields}/>;
}
