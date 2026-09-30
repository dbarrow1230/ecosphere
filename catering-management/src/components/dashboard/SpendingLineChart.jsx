import DashboardEmpty from "./DashboardEmpty";

function SpendingLineChart({data=[],valueKey="value",labelKey="label",height=220}){

 if(!data.length){
  return <DashboardEmpty message="No spending data for the selected period."/>;
 }

 const width=720;
 const padding={top:16,right:18,bottom:34,left:42};
 const chartWidth=width-padding.left-padding.right;
 const chartHeight=height-padding.top-padding.bottom;
 const maxValue=Math.max(...data.map((item)=>Number(item?.[valueKey]||0)),0);
 const safeMax=maxValue>0?maxValue:1;

 const points=data.map((item,index)=>{
  const x=padding.left+(data.length===1?chartWidth/2:(index*(chartWidth/(data.length-1))));
  const y=padding.top+(chartHeight-((Number(item?.[valueKey]||0)/safeMax)*chartHeight));
  return{x,y,label:item?.[labelKey],value:Number(item?.[valueKey]||0)};
 });

 const polylinePoints=points.map((point)=>`${point.x},${point.y}`).join(" ");
 const gridLines=[0,.25,.5,.75,1].map((ratio)=>({
  y:padding.top+(chartHeight-(chartHeight*ratio)),
  value:(safeMax*ratio).toFixed(0)
 }));

 return(
  <div className="dashboard-line-chart">
   <svg viewBox={`0 0 ${width} ${height}`} className="dashboard-line-chart-svg" role="img" aria-label="Spending trend chart">
    {gridLines.map((line)=>(
     <g key={line.y}>
      <line x1={padding.left} x2={width-padding.right} y1={line.y} y2={line.y} className="dashboard-line-grid"/>
      <text x={padding.left-10} y={line.y+4} textAnchor="end" className="dashboard-line-axis-text">${line.value}</text>
     </g>
    ))}

    <polyline fill="none" points={polylinePoints} className="dashboard-line-path"/>

    {points.map((point)=>(
     <g key={`${point.label}-${point.x}`}>
      <circle cx={point.x} cy={point.y} r="4.5" className="dashboard-line-point"/>
      <text x={point.x} y={height-10} textAnchor="middle" className="dashboard-line-axis-text">{point.label}</text>
     </g>
    ))}
   </svg>
  </div>
 );
}

export default SpendingLineChart;