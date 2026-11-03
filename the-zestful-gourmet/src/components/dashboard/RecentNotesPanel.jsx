import {FileText} from "lucide-react";
import DashboardListPanel from "./DashboardListPanel";

function RecentNotesPanel({
 recentNotes=[],
 loading=false,
 getTitle=item=>item.title||item.name||"Untitled note",
 getMeta=item=>`${item.notebookRef?.name||item.notebook?.name||"Unfiled"} · ${item.updatedAt||item.createdAt||"No date"}`,
 getLink=null
}){

 return(
  <DashboardListPanel
   kicker="Recently Active"
   title="Latest Notes"
   linkTo="/notes"
   linkLabel="Browse notes"
   loading={loading}
   loadingMessage="Loading recent notes..."
   emptyMessage="No notes found yet."
   items={recentNotes}
   icon={<FileText size={17} strokeWidth={2.2}/>}
   iconClassName="dashboard-list-icon-soft"
   getTitle={getTitle}
   getMeta={getMeta}
   getLink={getLink}
  />
 );
}

export default RecentNotesPanel;
