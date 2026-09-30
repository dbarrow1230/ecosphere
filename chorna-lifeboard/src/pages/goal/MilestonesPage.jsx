// src/pages/goal/MilestonesPage.jsx
import LifeboardListPage from "../../components/lifeboard/LifeboardListPage.jsx";

function MilestonesPage(){
 return(
  <LifeboardListPage
   title="Milestones"
   text="Review major achievements, markers, and important points in your life timeline."
   endpoint="/api/milestones"
   dataKey="milestones"
   emptyText="No milestones found."
   createPath="/milestones/new"
   createLabel="Add Milestone"
   filters={[
    {name:"milestoneType",label:"Type",field:"milestoneType",options:[
     {value:"goal",label:"Goal"},
     {value:"personal",label:"Personal"},
     {value:"career",label:"Career"},
     {value:"health",label:"Health"},
     {value:"creative",label:"Creative"},
     {value:"financial",label:"Financial"},
     {value:"relationship",label:"Relationship"},
     {value:"education",label:"Education"},
     {value:"spiritual",label:"Spiritual"},
     {value:"other",label:"Other"}
    ]}
   ]}
   columns={[
    {key:"title",label:"Title"},
    {key:"milestoneType",label:"Type"},
    {key:"milestoneDateDisplay",label:"Date"},
    {key:"linkedGoal.title",label:"Goal"},
    {key:"lifeArea.name",label:"Life Area"}
   ]}
  />
 );
}

export default MilestonesPage;