// src/pages/category/CategoryForm.jsx
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function CategoryForm(){
 return(
  <LifeboardFormPage
   title="New Category"
   eyebrow="Manage"
   text="Create a category for organizing lifeboard records."
   endpoint="/api/categories"
   redirectPath="/categories"
   submitLabel="Save Category"
   initialValues={{
    name:"",
    description:"",
    categoryType:"general",
    color:"",
    icon:"",
    isActive:true
   }}
   fields={[
    {name:"name",label:"Name",required:true},
    {name:"categoryType",label:"Category Type",type:"select",options:[
     {value:"task",label:"Task"},
     {value:"goal",label:"Goal"},
     {value:"habit",label:"Habit"},
     {value:"journal",label:"Journal"},
     {value:"note",label:"Note"},
     {value:"mindfulness",label:"Mindfulness"},
     {value:"milestone",label:"Milestone"},
     {value:"timeline",label:"Timeline"},
     {value:"general",label:"General"}
    ]},
    {name:"color",label:"Color"},
    {name:"icon",label:"Icon"},
    {name:"isActive",label:"Active",type:"checkbox",checkboxLabel:"Category is active"},
    {name:"description",label:"Description",type:"textarea",rows:5,full:true}
   ]}
  />
 );
}

export default CategoryForm;