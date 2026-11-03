import DashboardEmpty from "./DashboardEmpty";

const getWidthClass=item=>{
 const raw=item?.percent??item?.width??0;
 const numeric=typeof raw==="string"?Number(raw.replace("%","")):Number(raw);
 const safe=Number.isFinite(numeric)?Math.min(Math.max(numeric,0),100):0;
 const bucket=Math.round(safe/5)*5;
 return `dashboard-bar-width-${bucket}`;
};

function DashboardChartCard({title,data=[],fillClass="",emptyMessage=""}){

 return(
  <div className="dashboard-chart-card">
   <div className="dashboard-chart-head">
    <h3 className="dashboard-chart-title">{title}</h3>
   </div>

   <div className="dashboard-chart-body">
   {data.length?data.map((item)=>(
     <div key={item.category} className="dashboard-bar-row">
      <div className="dashboard-bar-meta">
       <span className="dashboard-bar-label">{item.category}</span>
       <span className="dashboard-bar-value">{item.count??item.value??0}</span>
      </div>

      <div className="dashboard-bar-track">
       <div className={`dashboard-bar-fill ${fillClass} ${getWidthClass(item)}`.trim()}/>
      </div>
     </div>
    )):(
     <DashboardEmpty message={emptyMessage}/>
    )}
   </div>
  </div>
 );
}

function DashboardBadgeCard({title,data=[],emptyMessage=""}){
 return(
  <div className="dashboard-chart-card dashboard-badge-card">
   <div className="dashboard-chart-head"><h3 className="dashboard-chart-title">{title}</h3></div>
   {data.length?(
    <div className="dashboard-type-badges">{data.map(item=><span className="dashboard-type-badge" key={item.category}><span>{item.category}</span><strong>{item.count??item.value??0}</strong></span>)}</div>
   ):(
    <DashboardEmpty message={emptyMessage}/>
   )}
  </div>
 );
}

function KnowledgeStructureCharts({noteTypeChartData=[],notebookChartData=[],tagChartData=[],linkChartData=[],dynamicChartGroups=[]}){

 return(
  <div className="dashboard-chart-grid">

   <DashboardBadgeCard
    title="Notes by Type"
    data={noteTypeChartData}
    emptyMessage="No note type data for the selected period."
   />

   {notebookChartData.length?(
    <DashboardChartCard
     title="Notes by Notebook"
     data={notebookChartData}
     fillClass="dashboard-bar-fill-secondary"
     emptyMessage="No notebook data for the selected period."
    />
   ):null}

   {tagChartData.length?(
    <DashboardChartCard
     title="Tags"
     data={tagChartData}
     fillClass="dashboard-bar-fill-primary"
     emptyMessage="No tag data for the selected period."
    />
   ):null}

   {linkChartData.length?(
    <DashboardChartCard
     title="Links"
     data={linkChartData}
     fillClass="dashboard-bar-fill-secondary"
     emptyMessage="No link data for the selected period."
    />
   ):null}

   {dynamicChartGroups.map((group)=>(
    <DashboardChartCard
     key={group.type}
     title={group.title}
     data={group.data}
     fillClass={group.fillClass}
     emptyMessage={`No ${group.label.toLowerCase()} data for the selected period.`}
    />
   ))}

  </div>
 );
}

export default KnowledgeStructureCharts;
