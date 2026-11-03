import {BookOpenText} from "lucide-react";
import DashboardListPanel from "./DashboardListPanel";

function ReferencesPanel({
 references=[],
 loading=false,
 getTitle=item=>item.title||item.name||"Untitled source",
 getMeta=item=>item.author||item.publisher||item.source||item.url||"Source",
 getLink=null
}){

 return(
  <DashboardListPanel
   kicker="Source Material"
   title="Recent Sources"
   linkTo="/references"
   linkLabel="Open sources"
   loading={loading}
   loadingMessage="Loading sources..."
   emptyMessage="No sources found yet."
   items={references}
   icon={<BookOpenText size={17} strokeWidth={2.2}/>}
   iconClassName="dashboard-list-icon-soft"
   getTitle={getTitle}
   getMeta={getMeta}
   getLink={getLink}
  />
 );
}

export default ReferencesPanel;
