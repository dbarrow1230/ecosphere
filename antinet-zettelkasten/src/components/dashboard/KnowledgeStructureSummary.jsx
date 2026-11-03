import DashboardEmpty from "./DashboardEmpty";
import DashboardFilters from "./DashboardFilters";
import KnowledgeStructureCharts from "./KnowledgeStructureCharts";

function KnowledgeStructureSummary({
 loading=false,
 noteTypeChartData=[],
 yearFilter="all",
 monthFilter="all",
 dayFilter="all",
 availableYears=[],
 months=[],
 availableDays=[],
 onYearChange,
 onMonthChange,
 onDayChange,
 onResetCurrent
}){ 
 return(
  <section className="dashboard-section dashboard-section-charts">
   <div className="dashboard-section-head">
    <div>
     <p className="dashboard-section-kicker">Knowledge Structure</p>
     <h2 className="dashboard-section-title">Zettels by Type</h2>
    </div>

    <DashboardFilters
     months={months}
     availableYears={availableYears}
     availableDays={availableDays}
     yearFilter={yearFilter}
     monthFilter={monthFilter}
     dayFilter={dayFilter}
     onYearChange={onYearChange}
     onMonthChange={onMonthChange}
     onDayChange={onDayChange}
    />

    {onResetCurrent?(
     <button type="button" className="dashboard-calendar-reset" onClick={onResetCurrent}>
      Current Month
     </button>
    ):null}
   </div>

   <div className="dashboard-chart-body dashboard-chart-body-scroll">
    {loading?(
     <DashboardEmpty message="Loading zettel types..."/>
    ):(
     <KnowledgeStructureCharts
      noteTypeChartData={noteTypeChartData}
     />
    )}
   </div>
  </section>
 );
}

export default KnowledgeStructureSummary;
