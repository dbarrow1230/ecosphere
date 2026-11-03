import ResourceCrudPage from "../../components/crud/ResourceCrudPage.jsx";

const fields=[
 {name:"seed",label:"Seed",type:"select",optionsKey:"seeds",md:6},
 {name:"plant",label:"Plant",type:"select",optionsKey:"plants",md:6},
 {name:"planting",label:"Growing run",type:"select",optionsKey:"plantings",md:6},
 {name:"garden",label:"Garden",type:"select",optionsKey:"gardens",md:6},
 {name:"sourceType",label:"Source type",md:6},
 {name:"resolvedAt",label:"Resolved date",type:"date",md:6},
 {name:"title",label:"Issue Title",required:true,md:6},
 {name:"issueType",label:"Issue Type",md:6},
 {name:"severity",label:"Severity",md:4},
 {name:"status",label:"Status",md:4},
 {name:"observedAt",label:"Observed At",type:"date",md:4},
 {name:"description",label:"Description",type:"textarea",md:12},
 {name:"actionTaken",label:"Action Taken",type:"textarea",md:12},
 {name:"isActive",label:"Active",type:"checkbox",defaultValue:true,md:6}
];

const columns=[
 {key:"title",label:"Issue"},
 {key:"issueType",label:"Type"},
 {key:"severity",label:"Severity"},
 {key:"status",label:"Status",badge:true},
 {key:"observedAt",label:"Observed"}
];

export default function IssuesPage(){
 return(
  <ResourceCrudPage
   title="Issues"
   kicker="Plant Health"
   description="Track plant health problems, severity, follow-up tasks, and resolution notes."
   endpoint="/api/issues"
   optionLoaders={{seeds:"/api/seeds",plants:"/api/plants",plantings:"/api/plantings",gardens:"/api/gardens"}}
   fields={fields}
   columns={columns}
   emptyText="No issues found. Add an issue to track follow-up and resolution."
  />
 );
}
