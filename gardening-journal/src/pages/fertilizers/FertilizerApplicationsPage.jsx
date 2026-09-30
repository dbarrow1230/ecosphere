import ResourceCrudPage from "../../components/crud/ResourceCrudPage.jsx";

const fields=[
 {name:"fertilizer",label:"Fertilizer",type:"select",optionsKey:"fertilizers",required:true,md:6},
 {name:"name",label:"Application Name",md:6},
 {name:"method",label:"Method",md:6},
 {name:"timing",label:"Timing",md:6},
 {name:"description",label:"Description",type:"textarea",md:12},
 {name:"isActive",label:"Active",type:"checkbox",defaultValue:true,md:6}
];

const columns=[
 {key:"name",label:"Application"},
 {key:"fertilizer",label:"Fertilizer"},
 {key:"method",label:"Method"},
 {key:"timing",label:"Timing"},
 {key:"isActive",label:"Active",badge:true}
];

export default function FertilizerApplicationsPage(){
 return(
  <ResourceCrudPage
   title="Fertilizer Applications"
   kicker="Feeding"
   description="Track feeding schedules, nutrients, hydro refills, dose amounts, and plant response."
   endpoint="/api/fertilizer-applications"
   optionLoaders={{fertilizers:"/api/reference/fertilizers"}}
   fields={fields}
   columns={columns}
   emptyText="No fertilizer applications found. Add one to track feeding history."
  />
 );
}