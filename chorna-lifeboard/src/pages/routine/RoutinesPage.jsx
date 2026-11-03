// src/pages/routine/RoutinesPage.jsx
import LifeboardListPage from "../../components/lifeboard/LifeboardListPage.jsx";

function RoutinesPage(){
 return(
  <LifeboardListPage
   title="Routines"
   text="Manage grouped actions such as morning routines, weekly resets, mindfulness routines, and self-care routines."
   endpoint="/api/routines"
   dataKey="routines"
   emptyText="No routines found."
   createPath="/routines/new"
   createLabel="Add Routine"
   filters={[
    {name:"routineType",label:"Routine Type",field:"routineType",options:[
     {value:"morning",label:"Morning"},
     {value:"afternoon",label:"Afternoon"},
     {value:"evening",label:"Evening"},
     {value:"night",label:"Night"},
     {value:"weekly-reset",label:"Weekly Reset"},
     {value:"monthly-reset",label:"Monthly Reset"},
     {value:"mindfulness",label:"Mindfulness"},
     {value:"self-care",label:"Self-Care"},
     {value:"work",label:"Work"},
     {value:"study",label:"Study"},
     {value:"fitness",label:"Fitness"},
     {value:"custom",label:"Custom"}
    ]}
   ]}
   columns={[
    {key:"title",label:"Title"},
    {key:"routineType",label:"Type"},
    {key:"frequency",label:"Frequency"},
    {key:"status",label:"Status"},
    {key:"startDateDisplay",label:"Start Date"},
    {key:"lifeArea.name",label:"Life Area"}
   ]}
  />
 );
}

export default RoutinesPage;