// src/components/dashboard/DashboardSection.jsx
function DashboardSection({kicker,title,className="",children}){
 return(
  <section className={`dashboard-section ${className}`}>
   <div className="dashboard-section-head">
    <div>
     {kicker?<p className="dashboard-section-kicker">{kicker}</p>:null}
     {title?<h2 className="dashboard-section-title">{title}</h2>:null}
    </div>
   </div>

   {children}
  </section>
 );
}

export default DashboardSection;