// src/pages/lifeTheme/LifeThemeForm.jsx
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function LifeThemeForm(){
 return(
  <LifeboardFormPage
   title="New Life Theme"
   eyebrow="Themes"
   text="Create a theme for a day, week, month, quarter, year, season, or custom period."
   endpoint="/api/life-themes"
   redirectPath="/life-themes"
   submitLabel="Save Life Theme"
   initialValues={{
    title:"",
    description:"",
    themeType:"monthly",
    startDate:new Date().toISOString().slice(0,10),
    endDate:"",
    intention:"",
    focusWords:"",
    affirmation:"",
    status:"active"
   }}
   fields={[
    {name:"title",label:"Title",required:true},
    {name:"themeType",label:"Theme Type",type:"select",options:[
     {value:"daily",label:"Daily"},
     {value:"weekly",label:"Weekly"},
     {value:"monthly",label:"Monthly"},
     {value:"quarterly",label:"Quarterly"},
     {value:"yearly",label:"Yearly"},
     {value:"seasonal",label:"Seasonal"},
     {value:"custom",label:"Custom"}
    ]},
    {name:"startDate",label:"Start Date",type:"date",required:true},
    {name:"endDate",label:"End Date",type:"date"},
    {name:"status",label:"Status",type:"select",options:[
     {value:"active",label:"Active"},
     {value:"completed",label:"Completed"},
     {value:"archived",label:"Archived"}
    ]},
    {name:"intention",label:"Intention",type:"textarea",rows:4,full:true},
    {name:"focusWords",label:"Focus Words",type:"textarea",rows:3,arrayFromLines:true},
    {name:"affirmation",label:"Affirmation",type:"textarea",rows:4},
    {name:"description",label:"Description",type:"textarea",rows:4}
   ]}
  />
 );
}

export default LifeThemeForm;