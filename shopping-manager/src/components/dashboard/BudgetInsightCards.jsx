BudgetInsightCards.jsx// src/components/dashboard/BudgetInsightCards.jsx
import DashboardEmpty from "./DashboardEmpty";

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

 return(
  <section className="dashboard-budget-row">
   <div className="dashboard-section dashboard-budget-card">
    <div className="dashboard-section-head">
     <div>
      <p className="dashboard-section-kicker">Yearly Budget</p>
      <h2 className="dashboard-section-title">{yearFilter} by Category</h2>
     </div>
    </div>

    <BudgetList items={yearlyByCategory} emptyMessage="No yearly budget data available."/>
   </div>

   <div className="dashboard-section dashboard-budget-card">
    <div className="dashboard-section-head">
     <div>
      <p className="dashboard-section-kicker">Monthly Budget</p>
      <h2 className="dashboard-section-title">{Number(monthFilter)+1} by Category</h2>
     </div>
    </div>

    <BudgetList items={monthlyByCategory} emptyMessage="No monthly budget data available."/>
   </div>

   <div className="dashboard-section dashboard-budget-card">
    <div className="dashboard-section-head">
     <div>
      <p className="dashboard-section-kicker">Over Budget</p>
      <h2 className="dashboard-section-title">Yearly & Monthly Alerts</h2>
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
     <DashboardEmpty message="No over-budget categories right now."/>
    )}
   </div>
  </section>
 );
}

export default BudgetInsightCards;