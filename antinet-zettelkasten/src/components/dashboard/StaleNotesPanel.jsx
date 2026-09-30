import {Clock3} from "lucide-react";
import DashboardListPanel from "./DashboardListPanel";

function StaleNotesPanel({
 staleNotes=[],
 loading=false,
 getTitle=item=>item.title||item.name||"Untitled note",
 getMeta=item=>`Captured ${item.createdAt||"No date"}`,
 getLink=null
}){

 return(
  <DashboardListPanel
   kicker="Review Queue"
   title="Stale Fleeting Notes"
   linkTo="/inbox"
   linkLabel="Open inbox"
   loading={loading}
   loadingMessage="Loading stale fleeting notes..."
   emptyMessage="No overdue fleeting notes right now."
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
