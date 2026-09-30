// src/pages/goal/GoalsPage.jsx
import LifeboardListPage from "../../components/lifeboard/LifeboardListPage.jsx";

function GoalsPage(){
 return(
  <LifeboardListPage
   title="Goals"
   text="Track life goals, progress, target dates, and connected life areas."
   endpoint="/api/goals"
   dataKey="goals"
   emptyText="No goals found."
   createPath="/goals/new"
   createLabel="Add Goal"
   filters={[
    {name:"goalType",label:"Goal Type",field:"goalType",options:[
     {value:"daily",label:"Daily"},
     {value:"weekly",label:"Weekly"},
     {value:"monthly",label:"Monthly"},
     {value:"yearly",label:"Yearly"},
     {value:"short-term",label:"Short-Term"},
     {value:"long-term",label:"Long-Term"}
    ]},
    {name:"status",label:"Status",field:"status",options:[
     {value:"not-started",label:"Not Started"},
     {value:"in-progress",label:"In Progress"},
     {value:"completed",label:"Completed"},
     {value:"paused",label:"Paused"},
     {value:"archived",label:"Archived"}
    ]}
   ]}
   columns={[
    {key:"title",label:"Title"},
    {key:"goalType",label:"Type"},
    {key:"progress",label:"Progress"},
    {key:"status",label:"Status"},
    {key:"targetDateDisplay",label:"Target Date"},
    {key:"lifeArea.name",label:"Life Area"}
   ]}
  />
 );
}

export default GoalsPage;