import ResourceCrudPage from "../../components/crud/ResourceCrudPage.jsx";

const fields=[
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
   fields={fields}
   columns={columns}
   emptyText="No issues found. Add an issue to track follow-up and resolution."
  />
 );
}