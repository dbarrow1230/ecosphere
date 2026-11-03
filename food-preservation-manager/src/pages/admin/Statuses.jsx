import ResourceCrudPage from "./ResourceCrudPage.jsx";

const emptyStatus={
 name:"",
 code:"",
 group:"general",
 description:"",
 isDefault:false,
 isFinal:false,
 isActive:true,
 sortOrder:"0"
};

export default function Statuses(){
 return(
  <ResourceCrudPage
   title="Statuses"
   subtitle="Define reusable workflow statuses by group for orders, inventory, batches, and other records."
   apiPath="/api/statuses"
   arrayKey="statuses"
   initialForm={emptyStatus}
   fields={[
    {name:"name",label:"Name",required:true},
    {name:"code",label:"Code",required:true},
    {name:"group",label:"Group",required:true},
    {name:"description",label:"Description",type:"textarea",rows:3},
    {name:"sortOrder",label:"Sort Order",type:"number",step:"1"},
    {name:"isDefault",label:"Default",type:"checkbox",checkboxLabel:"Default status"},
    {name:"isFinal",label:"Final",type:"checkbox",checkboxLabel:"Final status"},
    {name:"isActive",label:"Active",type:"checkbox",checkboxLabel:"Active"}
   ]}
   columns={[
    {path:"name",label:"Name"},
    {path:"code",label:"Code"},
    {path:"group",label:"Group"},
    {path:"sortOrder",label:"Sort"},
    {path:"isDefault",label:"Default"},
    {path:"isFinal",label:"Final"},
    {path:"isActive",label:"Active"}
   ]}
   buildPayload={form=>({...form,sortOrder:Number(form.sortOrder||0)})}
   getRowTitle={item=>item.name||item.code||"Status"}
  />
 );
}
