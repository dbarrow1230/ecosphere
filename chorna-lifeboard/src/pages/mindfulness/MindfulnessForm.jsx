// src/pages/mindfulness/MindfulnessForm.jsx
import LifeboardFormPage from "../../components/lifeboard/LifeboardFormPage.jsx";

function MindfulnessForm(){
 return(
  <LifeboardFormPage
   title="Mindfulness Check-in"
   eyebrow="Mindfulness"
   text="Log mood, energy, stress, gratitude, intention, and reflection."
   endpoint="/api/mindfulness"
   redirectPath="/mindfulness"
   submitLabel="Save Check-in"
   initialValues={{
    entryDate:new Date().toISOString().slice(0,10),
    mood:"",
    energy:"",
    stress:"",
    gratitude:"",
    intention:"",
    affirmation:"",
    reflection:"",
    bodyFeeling:"",
    mentalState:"",
    needs:""
   }}
   fields={[
    {name:"entryDate",label:"Entry Date",type:"date",required:true},
    {name:"mood",label:"Mood"},
    {name:"energy",label:"Energy",type:"number",min:"1",max:"10"},
    {name:"stress",label:"Stress",type:"number",min:"1",max:"10"},
    {name:"intention",label:"Intention",full:true},
    {name:"gratitude",label:"Gratitude",type:"textarea",rows:4,arrayFromLines:true},
    {name:"affirmation",label:"Affirmation",type:"textarea",rows:4},
    {name:"bodyFeeling",label:"Body Feeling",type:"textarea",rows:4},
    {name:"mentalState",label:"Mental State",type:"textarea",rows:4},
    {name:"needs",label:"Needs",type:"textarea",rows:4},
    {name:"reflection",label:"Reflection",type:"textarea",rows:6,full:true}
   ]}
  />
 );
}

export default MindfulnessForm;