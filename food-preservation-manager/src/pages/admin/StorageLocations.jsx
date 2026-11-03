import ResourceCrudPage from "./ResourceCrudPage.jsx";

const emptyLocation={
 name:"",
 code:"",
 type:"",
 description:"",
 isActive:true,
 notes:""
};

export default function StorageLocations(){
 return(
  <ResourceCrudPage
   title="Storage Locations"
   subtitle="Manage places where finished products, batches, supplies, and inventory are stored."
   apiPath="/api/storage-locations"
   arrayKey="storageLocations"
   initialForm={emptyLocation}
   fields={[
    {name:"name",label:"Name",required:true},
    {name:"code",label:"Code"},
    {name:"type",label:"Type"},
    {name:"description",label:"Description",type:"textarea",rows:3},
    {name:"notes",label:"Notes",type:"textarea",rows:3},
    {name:"isActive",label:"Active",type:"checkbox",checkboxLabel:"Active"}
   ]}
   columns={[
    {path:"name",label:"Name"},
    {path:"code",label:"Code"},
    {path:"type",label:"Type"},
    {path:"description",label:"Description"},
    {path:"isActive",label:"Active"}
   ]}
   getRowTitle={item=>item.name||item.code||"Storage location"}
  />
 );
}
