import {Star} from "lucide-react";
import DashboardListPanel from "./DashboardListPanel";

function DashboardSidebar({loading=false,favoriteNotes=[],getNoteTitle,getNotebookName,getTagCount}){
 const getNoteEditLink=item=>item?._id||item?.id?`/notes?edit=${item._id||item.id}`:"/notes";

 return(
   <DashboardListPanel
    kicker="Pinned"
    title="Favorite Notes"
    loading={loading}
    loadingMessage="Loading favorites..."
    emptyMessage="No favorite notes yet."
    items={favoriteNotes}
    icon={<Star size={17} strokeWidth={2.2}/>}
    iconClassName="dashboard-list-icon-soft"
    getTitle={getNoteTitle}
    getMeta={item=>`${getNotebookName(item)} · ${getTagCount(item)} tags`}
    getLink={getNoteEditLink}
   />
 );
}

export default DashboardSidebar;
