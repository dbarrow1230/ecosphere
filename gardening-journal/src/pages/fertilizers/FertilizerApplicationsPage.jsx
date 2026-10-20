import ResourceCrudPage from "../../components/crud/ResourceCrudPage.jsx";

const fields=[
 {name:"results",label:"Results",type:"textarea",md:6},
 {name:"treatment",label:"Treatment / dosage",type:"textarea",md:6},
 {name:"applicationDate",label:"Treatment date",type:"date",md:6},
 {name:"problem",label:"Soil problem",type:"textarea",md:6},
 {name:"location",label:"Location",type:"text",md:6},
 {name:"plantName",label:"Plant",type:"text",md:6},
 {name:"fertilizer",label:"Fertilizer",type:"select",optionsKey:"fertilizers",md:6},
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
 {key:"applicationDate",label:"Date"},
 {key:"plantName",label:"Plant"},
 {key:"location",label:"Location"},
 {key:"problem",label:"Problem"},
 {key:"treatment",label:"Treatment"},
 {key:"results",label:"Results"},
 {key:"timing",label:"Timing"},
 {key:"isActive",label:"Active",badge:true}
];

export default function FertilizerApplicationsPage(){
 return(
  <ResourceCrudPage
   title="Fertilizer & Soil Amendments"
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