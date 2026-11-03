// src/pages/visionBoard/VisionBoardsPage.jsx
import LifeboardListPage from "../../components/lifeboard/LifeboardListPage.jsx";

function VisionBoardsPage(){
 return(
  <LifeboardListPage
   title="Vision Boards"
   text="View personal, yearly, monthly, and goal-based vision boards."
   endpoint="/api/vision-boards"
   dataKey="visionBoards"
   emptyText="No vision boards found."
   createPath="/vision-boards/new"
   createLabel="Add Vision Board"
   filters={[
    {name:"boardType",label:"Board Type",field:"boardType",options:[
     {value:"personal",label:"Personal"},
     {value:"yearly",label:"Yearly"},
     {value:"monthly",label:"Monthly"},
     {value:"goal",label:"Goal"},
     {value:"career",label:"Career"},
     {value:"health",label:"Health"},
     {value:"creative",label:"Creative"},
     {value:"relationship",label:"Relationship"},
     {value:"financial",label:"Financial"},
     {value:"spiritual",label:"Spiritual"},
     {value:"custom",label:"Custom"}
    ]}
   ]}
   columns={[
    {key:"title",label:"Title"},
    {key:"boardType",label:"Type"},
    {key:"year",label:"Year"},
    {key:"month",label:"Month"},
    {key:"isActive",label:"Active"},
    {key:"isPrivate",label:"Private"}
   ]}
  />
 );
}

export default VisionBoardsPage;