// src/pages/review/ReviewForm.jsx
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function ReviewForm(){
 return(
  <LifeboardFormPage
   title="New Review"
   eyebrow="Reviews"
   text="Create a daily, weekly, monthly, quarterly, or yearly review."
   endpoint="/api/reviews"
   redirectPath="/reviews"
   submitLabel="Save Review"
   initialValues={{
    title:"",
    reviewType:"weekly",
    periodStart:"",
    periodEnd:"",
    summary:"",
    wins:"",
    challenges:"",
    lessons:"",
    improvements:"",
    nextFocus:"",
    moodAverage:"",
    energyAverage:"",
    stressAverage:""
   }}
   fields={[
    {name:"title",label:"Title",required:true},
    {name:"reviewType",label:"Review Type",type:"select",options:[
     {value:"daily",label:"Daily"},
     {value:"weekly",label:"Weekly"},
     {value:"monthly",label:"Monthly"},
     {value:"quarterly",label:"Quarterly"},
     {value:"yearly",label:"Yearly"}
    ]},
    {name:"periodStart",label:"Period Start",type:"date",required:true},
    {name:"periodEnd",label:"Period End",type:"date",required:true},
    {name:"moodAverage",label:"Mood Average",type:"number",min:"0"},
    {name:"energyAverage",label:"Energy Average",type:"number",min:"0",max:"10"},
    {name:"stressAverage",label:"Stress Average",type:"number",min:"0",max:"10"},
    {name:"summary",label:"Summary",type:"textarea",rows:5,full:true},
    {name:"wins",label:"Wins",type:"textarea",rows:4,arrayFromLines:true},
    {name:"challenges",label:"Challenges",type:"textarea",rows:4,arrayFromLines:true},
    {name:"lessons",label:"Lessons",type:"textarea",rows:4,arrayFromLines:true},
    {name:"improvements",label:"Improvements",type:"textarea",rows:4,arrayFromLines:true},
    {name:"nextFocus",label:"Next Focus",type:"textarea",rows:4,arrayFromLines:true}
   ]}
  />
 );
}

export default ReviewForm;