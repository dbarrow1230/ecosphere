// src/pages/mindfulness/MindfulnessPage.jsx
import LifeboardListPage from "../../components/lifeboard/LifeboardListPage.jsx";

function MindfulnessPage(){
 return(
  <LifeboardListPage
   title="Mindfulness"
   text="View mood, energy, stress, intention, gratitude, and reflection check-ins."
   endpoint="/api/mindfulness"
   dataKey="mindfulnessEntries"
   emptyText="No mindfulness check-ins found."
   createPath="/mindfulness/new"
   createLabel="New Check-in"
   columns={[
    {key:"entryDateDisplay",label:"Date"},
    {key:"mood",label:"Mood"},
    {key:"energy",label:"Energy"},
    {key:"stress",label:"Stress"},
    {key:"intention",label:"Intention"},
    {key:"lifeArea.name",label:"Life Area"}
   ]}
  />
 );
}

export default MindfulnessPage;