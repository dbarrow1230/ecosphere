import DashboardEmpty from "./DashboardEmpty";

const getWidthClass=percent=>{
 const safe=Number.isFinite(percent)?Math.min(Math.max(percent,0),100):0;
 const bucket=Math.round(safe/5)*5;
 return `dashboard-bar-width-${bucket}`;
};

function ReviewList({items=[],emptyMessage=""}){

 if(!items.length){
  return <DashboardEmpty message={emptyMessage}/>;
 }

 return(
  <div className="dashboard-budget-list">
   {items.map((item)=>{
    const value=Number(item.value??item.count??0);
    const percent=Number(item.percent??0);
    const safeValue=Number.isFinite(value)?value:0;
    const safePercent=Number.isFinite(percent)?percent:0;

    return(
    <div key={item.key||item.category||item.title||item._id} className="dashboard-budget-item">
     <div className="dashboard-budget-item-top">
      <span className="dashboard-budget-item-label">{item.category||item.title||item.name||"Untitled"}</span>
      <span className="dashboard-budget-item-value">{safeValue.toLocaleString()}</span>
     </div>

     <div className="dashboard-budget-track">
      <div
       className={`dashboard-budget-fill dashboard-budget-fill-safe ${getWidthClass(safePercent)}`}
      />
     </div>

     <div className="dashboard-budget-item-bottom">
      <span>{safePercent.toFixed(0)}% of current set</span>
      <span>{item.meta||"Review"}</span>
     </div>
    </div>
   );})}
  </div>
 );
}

function ReviewInsightCards({reviewInsights={},yearFilter,monthFilter}){

 const yearlyActivity=reviewInsights?.yearlyActivity||[];
 const monthlyActivity=reviewInsights?.monthlyActivity||[];
 const attentionQueue=reviewInsights?.attentionQueue||[];
 const yearTitle=yearFilter==="all"?"All Notes":`${yearFilter} Notes`;
 const monthTitle=monthFilter==="all"?"Current Month":reviewInsights?.monthLabel||"Selected Month";

 return(
  <section className="dashboard-section dashboard-review-card">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Review Focus</p>
     <h2 className="dashboard-section-title">Activity & Attention</h2>
    </div>
   </div>

   <div className="dashboard-review-groups">
    <div className="dashboard-review-group">
    <div className="dashboard-section-head">
     <div>
      <p className="dashboard-section-kicker">Yearly Activity</p>
      <h2 className="dashboard-section-title">{yearTitle}</h2>
     </div>
    </div>

    <ReviewList items={yearlyActivity} emptyMessage="No yearly activity data available."/>
    </div>

    <div className="dashboard-review-group">
    <div className="dashboard-section-head">
     <div>
      <p className="dashboard-section-kicker">Monthly Activity</p>
      <h2 className="dashboard-section-title">{monthTitle}</h2>
     </div>
    </div>

    <ReviewList items={monthlyActivity} emptyMessage="No monthly activity data available."/>
    </div>

    <div className="dashboard-review-group">
    <div className="dashboard-section-head">
     <div>
      <p className="dashboard-section-kicker">Attention Queue</p>
      <h2 className="dashboard-section-title">Unlinked & Stale Notes</h2>
     </div>
    </div>

    {attentionQueue.length?(
     <ul className="dashboard-list">
      {attentionQueue.map((item)=>(
       <li key={item.key||item._id||item.title} className="dashboard-list-item">
        <div className="dashboard-list-content">
         <span className="dashboard-item-title">{item.title||item.name||"Untitled note"}</span>
         <span className="dashboard-item-meta">{item.meta||"Needs review"}</span>
        </div>
       </li>
      ))}
     </ul>
    ):(
     <DashboardEmpty message="No notes need review right now."/>
    )}
    </div>
   </div>
  </section>
 );
}

export default ReviewInsightCards;
