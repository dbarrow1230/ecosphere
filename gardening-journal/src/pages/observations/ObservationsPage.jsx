import ResourceCrudPage from "../../components/crud/ResourceCrudPage.jsx";

const fields=[
 {name:"name",label:"Observation Name",required:true,md:6},
 {name:"observationType",label:"Observation Type",md:6},
 {name:"observedAt",label:"Observed At",type:"date",md:6},
 {name:"tags",label:"Tags",type:"tags",md:6},
 {name:"moisture",label:"Soil Moisture (%)",type:"number",nullable:true,min:0,max:100,step:"any",md:4},
 {name:"light",label:"Ambient Light (lux)",type:"number",nullable:true,min:0,step:"any",md:4},
 {name:"temperature",label:"Temperature (°C)",type:"number",nullable:true,step:"any",md:4},
 {name:"details",label:"Details",type:"textarea",md:12},
 {name:"isActive",label:"Active",type:"checkbox",defaultValue:true,md:6}
];

const columns=[
 {key:"name",label:"Observation"},
 {key:"observationType",label:"Type"},
 {key:"observedAt",label:"Observed"},
 {key:"moisture",label:"Moisture (%)"},
 {key:"light",label:"Light (lux)"},
 {key:"temperature",label:"Temperature (°C)"},
 {key:"tags",label:"Tags"},
 {key:"isActive",label:"Active",badge:true}
];

export default function ObservationsPage(){
 return(
  <ResourceCrudPage
   title="Observations"
   kicker="Garden Journal"
   description="Record weather, light, pests, growth changes, and other daily observations."
   endpoint="/api/observations"
   fields={fields}
   columns={columns}
   emptyText="No observations found. Add an observation from the garden or hydro setup."
  />
 );
}