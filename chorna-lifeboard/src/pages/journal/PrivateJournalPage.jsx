// src/pages/journal/PrivateJournalPage.jsx
import LifeboardListPage from "../../components/lifeboard/LifeboardListPage.jsx";

function PrivateJournalPage(){
 return(
  <LifeboardListPage
   title="Private Journal"
   text="View private journal entries that are meant for user-only access."
   endpoint="/api/journal?journalType=private"
   dataKey="journalEntries"
   emptyText="No private journal entries found."
   createPath="/journal/private/new"
   createLabel="New Private Entry"
   columns={[
    {key:"title",label:"Title"},
    {key:"entryDateDisplay",label:"Entry Date"},
    {key:"mood",label:"Mood"},
    {key:"energy",label:"Energy"},
    {key:"lifeArea.name",label:"Life Area"}
   ]}
  />
 );
}

export default PrivateJournalPage;