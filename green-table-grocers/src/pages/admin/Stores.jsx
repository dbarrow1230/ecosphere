import ManagementTable from "../../components/dashboard/ManagementTable.jsx";
const emptyRecord={name:"",status:"active",notes:""};
const fields=[{name:"name",label:"Store"},{name:"status",label:"Status"},{name:"notes",label:"Notes"}];
export default function Stores(){return <ManagementTable title="Stores" endpoint="/api/stores" emptyRecord={emptyRecord} fields={fields}/>;}
