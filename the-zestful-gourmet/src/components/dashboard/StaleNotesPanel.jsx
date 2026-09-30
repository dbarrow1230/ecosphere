import {Clock3} from "lucide-react";
import DashboardListPanel from "./DashboardListPanel";

function StaleNotesPanel({
 staleNotes=[],
 loading=false,
 getTitle=item=>item.title||item.name||"Untitled note",
 getMeta=item=>`Last updated ${item.updatedAt||item.modifiedAt||item.createdAt||"No date"} · ${item.notebook?.name||item.notebookRef?.name||"Unfiled"}`,
 getLink=null
}){

 return(
  <DashboardListPanel
   kicker="Review Queue"
   title="Stale Notes"
   linkTo="/note-history"
   linkLabel="Open history"
   loading={loading}
   loadingMessage="Loading stale notes..."
   emptyMessage="No stale notes right now."
   items={staleNotes}
   icon={<Clock3 size={17} strokeWidth={2.2}/>}
   iconClassName="dashboard-list-icon-warning"
   getTitle={getTitle}
   getMeta={getMeta}
   getLink={getLink}
  />
 );
}

export default StaleNotesPanel;
