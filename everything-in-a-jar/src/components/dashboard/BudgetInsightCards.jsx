// src/components/dashboard/BudgetInsightCards.jsx
import DashboardEmpty from "./DashboardEmpty";
import {months} from "../../utils/dashboard/dashboardFilters";

function BudgetList({items=[],emptyMessage=""}){

 if(!items.length){
  return <DashboardEmpty message={emptyMessage}/>;
 }

 return(
  <div className="dashboard-budget-list">
   {items.map((item)=>(
    <div key={item.key||item.category} className="dashboard-budget-item">
     <div className="dashboard-budget-item-top">
      <span className="dashboard-budget-item-label">{item.category}</span>
      <span className="dashboard-budget-item-value">${Number(item.spent||0).toFixed(2)} / ${Number(item.budget||0).toFixed(2)}</span>
     </div>

     <div className="dashboard-budget-track">
      <div
       className={`dashboard-budget-fill ${item.isOverBudget?"dashboard-budget-fill-danger":"dashboard-budget-fill-safe"}`.trim()}
       style={{width:`${Math.min(Number(item.percent||0),100)}%`}}
      />
     </div>

     <div className="dashboard-budget-item-bottom">
      <span>{Number(item.percent||0).toFixed(0)}% used</span>
      {item.isOverBudget?<span className="dashboard-budget-over">Over budget</span>:<span>On track</span>}
     </div>
    </div>
   ))}
  </div>
 );
}

function BudgetInsightCards({budgetInsights={},yearFilter,monthFilter}){

 const yearlyByCategory=budgetInsights?.yearlyByCategory||[];
 const monthlyByCategory=budgetInsights?.monthlyByCategory||[];
 const overBudget=budgetInsights?.overBudget||[];
 const monthLabel=months.find(month=>month.value===String(monthFilter))?.label||"Selected Month";

 return(
  <section className="dashboard-budget-row">
   <div className="dashboard-section dashboard-budget-card">
    <div className="dashboard-section-head">
     <div>
      <p className="dashboard-section-kicker">Yearly Business Budget</p>
      <h2 className="dashboard-section-title">{yearFilter} by Cost Area</h2>
     </div>
    </div>

    <BudgetList items={yearlyByCategory} emptyMessage="No yearly business budget data available."/>
   </div>

   <div className="dashboard-section dashboard-budget-card">
    <div className="dashboard-section-head">
     <div>
      <p className="dashboard-section-kicker">Monthly Business Budget</p>
      <h2 className="dashboard-section-title">{monthLabel} by Cost Area</h2>
     </div>
    </div>

    <BudgetList items={monthlyByCategory} emptyMessage="No monthly business budget data available."/>
   </div>

   <div className="dashboard-section dashboard-budget-card">
    <div className="dashboard-section-head">
     <div>
      <p className="dashboard-section-kicker">Budget Alerts</p>
      <h2 className="dashboard-section-title">Production & Operating Costs</h2>
     </div>
    </div>

    {overBudget.length?(
     <ul className="dashboard-list">
      {overBudget.map((item)=>(
       <li key={item.key||`${item.category}-${item.period}`} className="dashboard-list-item">
        <div className="dashboard-list-content">
         <span className="dashboard-item-title">{item.category}</span>
         <span className="dashboard-item-meta">{item.period} · ${Number(item.spent||0).toFixed(2)} spent of ${Number(item.budget||0).toFixed(2)}</span>
        </div>
       </li>
      ))}
     </ul>
    ):(
     <DashboardEmpty message="No over-budget business categories right now."/>
    )}
   </div>
  </section>
 );
}

export default BudgetInsightCards;
