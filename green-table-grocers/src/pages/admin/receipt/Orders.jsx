import ManagementTable from "../../../components/dashboard/ManagementTable.jsx";
const emptyRecord={name:"",quantity:0,price:0,status:"pending",notes:""};
const fields=[{name:"name",label:"Order"},{name:"quantity",label:"Quantity",type:"number"},{name:"price",label:"Price",type:"number"},{name:"status",label:"Status"},{name:"notes",label:"Notes"}];
export default function Orders(){return <ManagementTable title="Orders" endpoint="/api/orders" emptyRecord={emptyRecord} fields={fields}/>;}
