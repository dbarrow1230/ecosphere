// src/pages/lifeTheme/LifeThemesPage.jsx
import LifeboardListPage from "../../components/lifeboard/LifeboardListPage.jsx";

function LifeThemesPage(){
 return(
  <LifeboardListPage
   title="Life Themes"
   text="View daily, weekly, monthly, quarterly, yearly, seasonal, and custom themes."
   endpoint="/api/life-themes"
   dataKey="lifeThemes"
   emptyText="No life themes found."
   createPath="/life-themes/new"
   createLabel="Add Life Theme"
   filters={[
    {name:"themeType",label:"Theme Type",field:"themeType",options:[
     {value:"daily",label:"Daily"},
     {value:"weekly",label:"Weekly"},
     {value:"monthly",label:"Monthly"},
     {value:"quarterly",label:"Quarterly"},
     {value:"yearly",label:"Yearly"},
     {value:"seasonal",label:"Seasonal"},
     {value:"custom",label:"Custom"}
    ]},
    {name:"status",label:"Status",field:"status",options:[
     {value:"active",label:"Active"},
     {value:"completed",label:"Completed"},
     {value:"archived",label:"Archived"}
    ]}
   ]}
   columns={[
    {key:"title",label:"Title"},
    {key:"themeType",label:"Type"},
    {key:"startDateDisplay",label:"Start"},
    {key:"endDateDisplay",label:"End"},
    {key:"status",label:"Status"},
    {key:"intention",label:"Intention"}
   ]}
  />
 );
}

export default LifeThemesPage;