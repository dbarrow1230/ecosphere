// src/pages/priority/PrioritiesPage.jsx
import LifeboardListPage from "../components/lifeboard/LifeboardListPage.jsx";

function PrioritiesPage(){
 return(
  <LifeboardListPage
   title="Priorities"
   text="View what needs attention across your daily, weekly, monthly, and yearly planning."
   endpoint="/api/priorities"
   dataKey="priorities"
   emptyText="No priorities found."
   createPath="/priorities/new"
   createLabel="Add Priority"
   filters={[
    {name:"priorityType",label:"Type",field:"priorityType",options:[
     {value:"daily",label:"Daily"},
     {value:"weekly",label:"Weekly"},
     {value:"monthly",label:"Monthly"},
     {value:"yearly",label:"Yearly"}
    ]},
    {name:"status",label:"Status",field:"status",options:[
     {value:"active",label:"Active"},
     {value:"completed",label:"Completed"},
     {value:"paused",label:"Paused"},
     {value:"cancelled",label:"Cancelled"},
     {value:"archived",label:"Archived"}
    ]}
   ]}
   columns={[
    {key:"title",label:"Title"},
    {key:"priorityType",label:"Type"},
    {key:"priorityLevel",label:"Level"},
    {key:"status",label:"Status"},
    {key:"dueDateDisplay",label:"Due Date"},
    {key:"lifeArea.name",label:"Life Area"}
   ]}
  />
 );
}

export default PrioritiesPage;