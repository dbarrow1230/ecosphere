// src/pages/category/CategoriesPage.jsx
import LifeboardListPage from "../../components/lifeboard/LifeboardListPage.jsx";

function CategoriesPage(){
 return(
  <LifeboardListPage
   title="Categories"
   text="Manage categories used across tasks, goals, habits, journal entries, notes, mindfulness, milestones, and timeline entries."
   endpoint="/api/categories"
   dataKey="categories"
   emptyText="No categories found."
   createPath="/categories/new"
   createLabel="Add Category"
   filters={[
    {name:"categoryType",label:"Category Type",field:"categoryType",options:[
     {value:"task",label:"Task"},
     {value:"goal",label:"Goal"},
     {value:"habit",label:"Habit"},
     {value:"journal",label:"Journal"},
     {value:"note",label:"Note"},
     {value:"mindfulness",label:"Mindfulness"},
     {value:"milestone",label:"Milestone"},
     {value:"timeline",label:"Timeline"},
     {value:"general",label:"General"}
    ]}
   ]}
   columns={[
    {key:"name",label:"Name"},
    {key:"categoryType",label:"Type"},
    {key:"description",label:"Description"},
    {key:"color",label:"Color"},
    {key:"icon",label:"Icon"},
    {key:"isActive",label:"Active"}
   ]}
  />
 );
}

export default CategoriesPage;